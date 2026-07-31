from bson import Decimal128
from fastapi import APIRouter, status, HTTPException, Depends
from pymongo.asynchronous.collection import ReturnDocument
from pymongo.errors import DuplicateKeyError

from database.database import get_db
from lib.fastapi.security import OAuth2PasswordRequestForm
from schemas import (User, CustomerUpdateRequest, LoginData)
from config import api_version
from security import hash_password, authenticate_user, create_access_token, require_admin

api_router = APIRouter(prefix=f"/api/v{api_version}")

# Create new customer
@api_router.post("/customers", status_code=status.HTTP_201_CREATED)
async def create_user(customer_details: User, db = Depends(get_db)):
    try:
        data: dict = customer_details.model_dump()
        data["password"] = hash_password(data["password"])
        res = await db["users"].insert_one(data)
        user = await db["users"].find_one({"_id": res.inserted_id})
        return {
            "user_id": user["user_id"],
            "username": user["username"],
            "is_admin": user["is_admin"]
        }

    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A customer with the same id already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )



# Get customer based on user id
@api_router.get("/customers/{user_id}", status_code=status.HTTP_200_OK, response_model=User)
async def get_customer(user_id: int, admin_user: dict = Depends(require_admin),  db = Depends(get_db)):
    try:
        customer = await db["users"].find_one({"user_id": user_id, "is_admin": {"$ne": True}})
        if customer is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"the customer with id: {user_id} was not found"
            )
        else:
            return customer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Get all customers
@api_router.get("/customers", status_code=status.HTTP_200_OK, response_model=list[User])
async def get_customers(admin_user: dict = Depends(require_admin), db = Depends(get_db)):
    try:
        all_customers = await db["users"].find({"is_admin": {"$ne": True}}).to_list()

        return all_customers
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Update customer based on given user id
@api_router.patch("/customers/{user_id}", status_code=status.HTTP_200_OK, response_model=User)
async def update_customer(user_id: int, update_details: CustomerUpdateRequest, admin_user: dict = Depends(require_admin), db = Depends(get_db)):
    update_object = {}
    if update_details.name is not None: update_object["name"] = update_details.name
    if update_details.email is not None: update_object["email"] = update_details.email
    if update_details.username is not None: update_object["username"] = update_details.username

    try:
        customer = await db["users"].find_one_and_update(
            {"user_id": user_id},
            {"$set": update_object},
            return_document=ReturnDocument.AFTER
        )

        if customer is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"the customer with id: {user_id} was not found"
            )

        return customer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Delete customer based on given user id
@api_router.delete("/customers/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_customer(user_id: int, admin_user: dict = Depends(require_admin), db = Depends(get_db)):
    try:
        result = await db["users"].delete_one({"user_id": user_id})

        if result.deleted_count == 1:
            return None
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"the customer with id: {user_id} was not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@api_router.post("/login", status_code=status.HTTP_200_OK)
async def login(data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = await authenticate_user(data.username, data.password)

        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Invalid credentials.',
                                headers={"WWW-Authenticate": "Bearer"},)

        access_token = create_access_token({"sub": user.username, "is_admin": user.is_admin})

        return {
            "username": user.username,
            "access_token": access_token,
            "token_type": "bearer"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))