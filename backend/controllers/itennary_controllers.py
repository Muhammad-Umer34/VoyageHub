from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from crud import create_itinerary
from auth.dependencies import get_current_user
from models import Itinerary, ItineraryCollaborator, CollabNotification, User
import schemas


from websocket_manager import send_notification

router = APIRouter(
    prefix="/itineraries",
    tags=["itineraries"],
)


@router.post(
    "/create",
    response_model=schemas.ItineraryOut,
    status_code=status.HTTP_201_CREATED
)
async def create_new_itinerary(
    itinerary_data: schemas.ItineraryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    itinerary = create_itinerary(db, itinerary_data, current_user.id)
    await send_notification(
        current_user.id,
        {
            "id": f"create_{itinerary.id}",
            "message": f"Your itinerary '{itinerary.title}' has been created.",
            "status": "accepted",
            "itinerary_id": itinerary.id
        }
    )

    return itinerary


@router.get("/get-itineraries", response_model=list[schemas.ItineraryOut])
def get_user_itineraries(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    user_id = current_user.id

    owned = (
        db.query(Itinerary)
        .filter(Itinerary.owner_id == user_id)
        .all()
    )

    collaborated = (
        db.query(Itinerary)
        .join(ItineraryCollaborator, Itinerary.id == ItineraryCollaborator.itinerary_id)
        .filter(ItineraryCollaborator.user_id == user_id)
        .all()
    )

    all_itineraries = list({i.id: i for i in owned + collaborated}.values())

    return all_itineraries



@router.post("/invite")
async def invite_user(
    invite_data: schemas.Invite,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    receiver = db.query(User).filter(User.email == invite_data.email).first()

    if not receiver:
        raise HTTPException(status_code=404, detail="User not found")

    itinerary = db.query(Itinerary).filter(
        Itinerary.id == invite_data.itinerary_id
    ).first()

    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    if itinerary.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to invite to this itinerary")

    existing = db.query(CollabNotification).filter(
        CollabNotification.itinerary_id == invite_data.itinerary_id,
        CollabNotification.receiver_id == receiver.id,
        CollabNotification.status == "pending"
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Invite already sent and pending")

    notification = CollabNotification(
        sender_id=current_user.id,
        receiver_id=receiver.id,
        itinerary_id=invite_data.itinerary_id,
        message=f"{current_user.full_name} invited you to '{itinerary.title}'",
        status="pending",
        is_read=False
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    await send_notification(
        receiver.id,
        {
            "id": notification.id,
            "message": f"{current_user.full_name} invited you to '{itinerary.title}'",
            "status": "pending",
            "itinerary_id": invite_data.itinerary_id,
            "sender_id": current_user.id
        }
    )

    return {"message": "Invitation sent successfully", "notification_id": notification.id}


@router.post("/invite/accept")
async def accept_invite(
    request_data: schemas.NotificationResponse,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = db.query(CollabNotification).filter(
        CollabNotification.id == request_data.notification_id,
        CollabNotification.receiver_id == current_user.id,
        CollabNotification.status == "pending"
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Pending invite not found")

    notification.status = "accepted"
    notification.is_read = True
    
    collaborator = ItineraryCollaborator(
        user_id=current_user.id,
        itinerary_id=notification.itinerary_id,
        role="editor"
    )
    
    db.add(collaborator)
    db.commit()

    itinerary = db.query(Itinerary).filter(Itinerary.id == notification.itinerary_id).first()
    itinerary_name = itinerary.title if itinerary else f"itinerary #{notification.itinerary_id}"

    await send_notification(
        notification.sender_id,
        {
            "id": f"accept_{notification.id}",
            "message": f"{current_user.full_name} accepted your invitation to '{itinerary_name}'",
            "status": "accepted",
            "itinerary_id": notification.itinerary_id
        }
    )

    return {"message": "Invitation accepted", "itinerary_id": notification.itinerary_id}


@router.post("/invite/reject")
async def reject_invite(
    request_data: schemas.NotificationResponse,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    notification = db.query(CollabNotification).filter(
        CollabNotification.id == request_data.notification_id,
        CollabNotification.receiver_id == current_user.id,
        CollabNotification.status == "pending"
    ).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Pending invite not found")
    
    notification.status = "rejected"
    notification.is_read = True
    db.commit()

    itinerary = db.query(Itinerary).filter(Itinerary.id == notification.itinerary_id).first()
    itinerary_name = itinerary.title if itinerary else f"itinerary #{notification.itinerary_id}"

    await send_notification(
        notification.sender_id,
        {
            "id": f"reject_{notification.id}",
            "message": f"{current_user.full_name} declined your invitation to '{itinerary_name}'",
            "status": "rejected",
            "itinerary_id": notification.itinerary_id
        }
    )

    return {"message": "Invitation rejected"}




@router.get("/invitations", response_model=list[schemas.CollabNotificationOut])
def get_invitations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    invitations = db.query(CollabNotification).filter(
        CollabNotification.receiver_id == current_user.id,
        CollabNotification.status == "pending"
    ).all()
    return invitations