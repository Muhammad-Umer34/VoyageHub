from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from crud import create_itinerary
from auth.dependencies import get_current_user
from models import Itinerary, ItineraryCollaborator, CollabNotification, User , ChatMessage
import schemas
from datetime import datetime
import models

from websocket_manager import send_notification
from websocket_manager import broadcast_chat_message
import asyncio

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



@router.post("/add/sightseeking-activity", status_code=status.HTTP_201_CREATED)
async def add_sightseeking_activity(
    activity_data: schemas.SightSeekingActivityIN,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    day_schedule = db.query(models.DaySchedule).filter(
        models.DaySchedule.itinerary_id == activity_data.itinerary_id,
        models.DaySchedule.day_number == activity_data.day_number
    ).first()
    
    if not day_schedule:
        if isinstance(activity_data.date, str):
            # Try multiple formats for date string parsing
            date_formats = ["%Y-%m-%d", "%b %d, %Y", "%B %d, %Y"]  # e.g. 2025-11-25 or Nov 25, 2025 or November 25, 2025
            schedule_date = None
            for fmt in date_formats:
                try:
                    schedule_date = datetime.strptime(activity_data.date, fmt).date()
                    break
                except ValueError:
                    continue
            if not schedule_date:
                raise ValueError(f"Date format for '{activity_data.date}' not recognized.")
        else:
            schedule_date = activity_data.date
            
        day_schedule = models.DaySchedule(
            itinerary_id=activity_data.itinerary_id,
            day_number=activity_data.day_number,
            date=schedule_date,
            total_activities=0 
        )
        db.add(day_schedule)
        db.commit()
        db.refresh(day_schedule)
    
    activity_time = None
    if activity_data.time:
        time_formats = ["%H:%M", "%H:%M:%S"]
        for tfmt in time_formats:
            try:
                activity_time = datetime.strptime(activity_data.time, tfmt).time()
                break
            except ValueError:
                continue
    
    new_activity = models.Activity(
        day_schedule_id=day_schedule.id,
        title=activity_data.title,
        type=activity_data.type,
        description=activity_data.description,
        cover_image=activity_data.cover_image,
        added_by=current_user.id
    )
    
    db.add(new_activity)
    db.flush()  
    
    sightseeing_details = models.SightseeingActivity(
        id=new_activity.id,
        location_name=activity_data.location_name,
        entry_fee=activity_data.entry_fee
    )
    
    db.add(sightseeing_details)
    
    day_schedule.total_activities = (day_schedule.total_activities or 0) + 1
    day_schedule.last_updated = datetime.utcnow()
    
    db.commit()
    db.refresh(new_activity)
    db.refresh(sightseeing_details)
    db.refresh(day_schedule)
    
    return {
        "id": new_activity.id,
        "title": new_activity.title,
        "type": new_activity.type,
        "description": new_activity.description,
        "cover_image": new_activity.cover_image,
        "added_by": new_activity.added_by,
        "day_schedule_id": new_activity.day_schedule_id,
        "location_name": sightseeing_details.location_name,
        "entry_fee": sightseeing_details.entry_fee,
        "day_schedule": {
            "id": day_schedule.id,
            "day_number": day_schedule.day_number,
            "date": str(day_schedule.date),
            "total_activities": day_schedule.total_activities
        }
    }


def activity_to_dict(activity):
    return {
        "id": activity.id,
        "day_schedule_id": activity.day_schedule_id,
        "title": activity.title,
        "type": activity.type,
        "description": activity.description,
        "cover_image": activity.cover_image,
        "added_by": activity.added_by,
        "day_schedule": {
            "id": activity.day_schedule.id,
            "itinerary_id": activity.day_schedule.itinerary_id,
            "day_number": activity.day_schedule.day_number,
            "date": activity.day_schedule.date.isoformat() if activity.day_schedule.date else None,
            "total_activities": activity.day_schedule.total_activities,
            "last_updated": activity.day_schedule.last_updated.isoformat() if activity.day_schedule.last_updated else None,
        } if activity.day_schedule else None,
        "meal_activity": {
            "id": activity.meal_activity.id,
            "cuisine_type": activity.meal_activity.cuisine_type,
            "restaurant_name": activity.meal_activity.restaurant_name,
        } if activity.meal_activity else None,
        "accommodation_activity": {
            "id": activity.accommodation_activity.id,
            "hotel_name": activity.accommodation_activity.hotel_name,
            "booking_link": activity.accommodation_activity.booking_link,
            "address": activity.accommodation_activity.address,
        } if activity.accommodation_activity else None,
        "sightseeing_activity": {
            "id": activity.sightseeing_activity.id,
            "location_name": activity.sightseeing_activity.location_name,
            "entry_fee": activity.sightseeing_activity.entry_fee,
        } if activity.sightseeing_activity else None,
    }


@router.get("/get_all_activities_of_itinerary/{itinerary_id}")
def get_all_activities_of_itinerary(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    activities = (
        db.query(models.Activity)
        .join(models.DaySchedule, models.Activity.day_schedule_id == models.DaySchedule.id)
        .outerjoin(models.MealActivity, models.MealActivity.id == models.Activity.id)
        .outerjoin(models.AccommodationActivity, models.AccommodationActivity.id == models.Activity.id)
        .outerjoin(models.SightseeingActivity, models.SightseeingActivity.id == models.Activity.id)
        .filter(models.DaySchedule.itinerary_id == itinerary_id)
        .all()
    )

    return [activity_to_dict(a) for a in activities]



@router.post("/add/meal-activity", status_code=status.HTTP_201_CREATED)
async def add_meal_activity(
    data: schemas.MealActivityIN,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    
    day_schedule = db.query(models.DaySchedule).filter(
        models.DaySchedule.itinerary_id == data.itinerary_id,
        models.DaySchedule.day_number == data.day_number
    ).first()

    if not day_schedule:
        day_schedule = models.DaySchedule(
            itinerary_id=data.itinerary_id,
            day_number=data.day_number,
            date=data.date
        )
        db.add(day_schedule)
        db.commit()
        db.refresh(day_schedule)

    activity = models.Activity(
        day_schedule_id=day_schedule.id,
        title=data.title,
        type="meal",
        description=data.description,
        cover_image=data.cover_image,
        added_by=current_user.id
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    meal = models.MealActivity(
        id=activity.id,
        cuisine_type=data.cuisine_type,
        restaurant_name=data.restaurant_name
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    day_schedule.total_activities += 1
    db.commit()

    return {
        "message": "Meal activity added successfully",
        "activity_id": activity.id,
        "day_schedule_id": day_schedule.id,
        "title": activity.title,
        "type": activity.type,
        "cuisine_type": meal.cuisine_type,
        "restaurant_name": meal.restaurant_name,
        "date": day_schedule.date,
        "day_number": day_schedule.day_number
    }

@router.post("/add/accommodation-activity", status_code=status.HTTP_201_CREATED)
async def add_accommodation_activity(
    data: schemas.AccommodationActivityIN,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    day_schedule = db.query(models.DaySchedule).filter(
        models.DaySchedule.itinerary_id == data.itinerary_id,
        models.DaySchedule.day_number == data.day_number
    ).first()
    if not day_schedule:
        day_schedule = models.DaySchedule(
            itinerary_id=data.itinerary_id,
            day_number=data.day_number,
            date=data.date
        )
        db.add(day_schedule)
        db.commit()
        db.refresh(day_schedule)
    activity = models.Activity(
        day_schedule_id=day_schedule.id,
        title=data.title,
        type="accommodation",
        description=data.description,
        cover_image=data.cover_image,
        added_by=current_user.id
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    accommodation = models.AccommodationActivity(
        id=activity.id,
        hotel_name=data.hotel_name,
        address=data.address,
        booking_link=data.booking_link
    )

    db.add(accommodation)
    db.commit()
    db.refresh(accommodation)

    day_schedule.total_activities += 1
    db.commit()

    return {"message": "Accommodation activity added successfully"}


def user_is_collaborator(db: Session, itinerary_id: int, user_id: int) -> bool:
    return db.query(models.ItineraryCollaborator).filter_by(itinerary_id=itinerary_id, user_id=user_id).count() > 0


@router.delete("/{itinerary_id}/days/{day_id}/activities/{activity_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_activity(itinerary_id: int, day_id: int, activity_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    if current_user.id != itinerary.owner_id and not user_is_collaborator(db, itinerary_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete activities in this itinerary")

    day_schedule = db.query(models.DaySchedule).filter(
        models.DaySchedule.id == day_id,
        models.DaySchedule.itinerary_id == itinerary_id
    ).first()
    if not day_schedule:
        raise HTTPException(status_code=404, detail="Day schedule not found for this itinerary")

    activity = db.query(models.Activity).filter(
        models.Activity.id == activity_id,
        models.Activity.day_schedule_id == day_id
    ).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found for this day schedule")

    db.delete(activity)

    day_schedule.total_activities = max(day_schedule.total_activities - 1, 0)

    db.commit()
    return {"detail": "Activity deleted successfully"}


@router.delete("/itineraries/{itinerary_id}/days/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_day_schedule(itinerary_id: int, day_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    itinerary = db.query(Itinerary).filter(Itinerary.id == itinerary_id).first()
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")

    if current_user.id != itinerary.owner_id and not user_is_collaborator(db, itinerary_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this day schedule")

    day_schedule = db.query(models.DaySchedule).filter(
        models.DaySchedule.id == day_id,
        models.DaySchedule.itinerary_id == itinerary_id
    ).first()
    if not day_schedule:
        raise HTTPException(status_code=404, detail="Day schedule not found for this itinerary")

    db.delete(day_schedule)
    db.commit()

    return {"detail": "Day schedule and all associated activities deleted successfully"}



@router.get("/get_all_collaborators/{itinerary_id}", response_model=list[schemas.UserOut])
def get_all_collaborators(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    itinerary = (
        db.query(Itinerary)
        .filter(Itinerary.id == itinerary_id)
        .first()
    )

    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    if (
        current_user.id != itinerary.owner_id
        and not user_is_collaborator(db, itinerary_id, current_user.id)
    ):
        raise HTTPException(status_code=403, detail="Not authorized to view collaborators for this itinerary")

    collaborators = (
        db.query(User)
        .join(ItineraryCollaborator, User.id == ItineraryCollaborator.user_id)
        .filter(ItineraryCollaborator.itinerary_id == itinerary_id)
        .all()
    )

    owner = db.query(User).filter(User.id == itinerary.owner_id).first()
    if owner:
        collaborators.insert(0, owner)

    return collaborators


@router.post("/add/text-message", status_code=status.HTTP_201_CREATED)
async def add_text_message(
    data: schemas.TextMessageIN,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    message = models.ChatMessage(
        sender_id=current_user.id,
        text=data.text,
        itinerary_id=data.itinerary_id,
        message_type="text",
        created_at=datetime.utcnow()
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    broadcast_data = {
        "message_id": message.id,
        "itinerary_id": message.itinerary_id,
        "sender_id": message.sender_id,  
        "text": message.text,
        "timestamp": message.created_at.isoformat(),
    }

    asyncio.create_task(broadcast_chat_message(broadcast_data))

    return {
        "message": "Text message added successfully",
        "message_id": message.id,
        "itinerary_id": message.itinerary_id,
        "sender_id": message.sender_id,
        "text": message.text,
        "timestamp": message.created_at.isoformat()
    }


@router.get("/get_chat_messages/{itinerary_id}", response_model=list[schemas.ChatMessageOut])
async def get_chat_messages(
    itinerary_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.itinerary_id == itinerary_id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )

    formatted_messages = []

    for msg in messages:
        message_data = {
            "id": msg.id,
            "itinerary_id": msg.itinerary_id,
            "sender_id": msg.sender_id,
            "message_type": msg.message_type,
            "created_at": msg.created_at
        }

        if msg.message_type == "poll":
            # Load Poll + Options + Vote Count
            poll = db.query(models.Poll).filter(models.Poll.message_id == msg.id).first()
            
            if poll:
                options = []
                for opt in poll.options:
                    vote_count = len(opt.votes)
                    options.append({
                        "id": opt.id,
                        "text": opt.option_text,
                        "vote_count": vote_count
                    })

                message_data["poll_id"] = poll.id
                message_data["question"] = poll.question
                message_data["options"] = options
                message_data["text"] = None
            else:
                message_data["poll_id"] = None
                message_data["question"] = None
                message_data["options"] = None
                message_data["text"] = None

        else:
            # Regular text message
            message_data["text"] = msg.text
            message_data["poll_id"] = None
            message_data["question"] = None
            message_data["options"] = None

        formatted_messages.append(message_data)

    return formatted_messages

@router.post("/add/poll-message", status_code=status.HTTP_201_CREATED)
async def add_poll_message(
    data: schemas.PollMessageIN,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 1️⃣ Create Chat Message
    message = models.ChatMessage(
        sender_id=current_user.id,
        text="",
        itinerary_id=data.itinerary_id,
        message_type="poll",
        created_at=datetime.utcnow()
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    # 2️⃣ Create Poll
    poll = models.Poll(
        message_id=message.id,
        question=data.question
    )
    db.add(poll)
    db.commit()
    db.refresh(poll)

    # 3️⃣ Insert Poll Options
    option_objects = []
    for option_text in data.options:
        option = models.PollOption(
            poll_id=poll.id,
            option_text=option_text
        )
        db.add(option)
        option_objects.append(option)

    db.commit()

    # Refresh options to get their IDs
    db.refresh(poll)

    # Format poll options for returning / broadcasting
    formatted_options = [
        {"id": opt.id, "text": opt.option_text, "votes": 0}
        for opt in poll.options
    ]

    # 4️⃣ Prepare data for WebSocket Broadcast
    broadcast_data = {
        "type": "poll_message",
        "message_id": message.id,
        "itinerary_id": message.itinerary_id,
        "sender_id": message.sender_id,
        "poll": {
            "id": poll.id,
            "question": poll.question,
            "options": formatted_options
        },
        "timestamp": message.created_at.isoformat(),
    }

    asyncio.create_task(broadcast_chat_message(broadcast_data))

    # 5️⃣ Response
    return {
        "message": "Poll message added successfully",
        "message_id": message.id,
        "itinerary_id": message.itinerary_id,
        "sender_id": message.sender_id,
        "poll": {
            "id": poll.id,
            "question": poll.question,
            "options": formatted_options
        },
        "timestamp": message.created_at.isoformat()
    }


@router.post("/cast_vote", status_code=status.HTTP_200_OK)
async def cast_vote(
    vote_data: schemas.PollOptionVoteIN,  # expects poll_id and option_id (poll_option_id)
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check if user has already voted in the poll (any option)
    vote_exists = (
        db.query(models.Vote)
        .join(models.PollOption, models.Vote.poll_option_id == models.PollOption.id)
        .filter(
            models.PollOption.poll_id == vote_data.poll_id,
            models.Vote.user_id == current_user.id
        )
        .first()
    )

    if vote_exists:
        raise HTTPException(status_code=400, detail="Vote already cast for this poll by the user")

    # Create new vote
    vote = models.Vote(
        user_id=current_user.id,
        poll_option_id=vote_data.option_id,
    )
    db.add(vote)
    db.commit()
    db.refresh(vote)

    return {"message": "Vote cast successfully"}



@router.get("/did_i_vote/{poll_id}", status_code=status.HTTP_200_OK)
def did_i_vote(
    poll_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    vote = (
        db.query(models.Vote)
        .join(models.PollOption, models.Vote.poll_option_id == models.PollOption.id)
        .filter(
            models.PollOption.poll_id == poll_id,
            models.Vote.user_id == current_user.id
        )
        .first()
    )
    
    if vote:
        return {
            "did_vote": True,
            "poll_option_id": vote.poll_option_id
        }
    else:
        return {
            "did_vote": False,
            "poll_option_id": None
        }
