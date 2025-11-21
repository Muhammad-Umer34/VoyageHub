from fastapi import Depends, HTTPException, status, APIRouter
from sqlalchemy.orm import Session
from database import get_db
from crud import create_itinerary
from auth.dependencies import get_current_user
import schemas

router = APIRouter( 
    prefix="/itineraries",
    tags=["itineraries"],
)

@router.post("/create", response_model=schemas.ItineraryOut, status_code=status.HTTP_201_CREATED)
def create_new_itinerary(
    itinerary_data: schemas.ItineraryCreate,  
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return create_itinerary(db, itinerary_data, current_user.id)