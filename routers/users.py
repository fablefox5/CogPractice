from bson import Decimal128
from fastapi import APIRouter, status, HTTPException, Response, Depends
from pymongo.asynchronous.collection import ReturnDocument
from pymongo.errors import DuplicateKeyError

from database.database import db_manager, get_db
from schemas import (User, CustomerUpdateRequest, LoginData)
from config import api_version

api_router = APIRouter(prefix=f"/api/v{api_version}")

# Create new customer
@api_router.post("/customers", status_code=status.HTTP_201_CREATED)
async def create_customer(customer_details: User, db = Depends(get_db)):
    try:
        res = await db["users"].insert_one(customer_details.model_dump())
        account = await db["users"].find_one({"_id": res.inserted_id})
        return {
            "user_id": account["user_id"],
            "username": account["username"],
            "is_admin": account["is_admin"]
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
async def get_customer(user_id: int, db = Depends(get_db)):
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
async def get_customers(db = Depends(get_db)):
    try:
        all_customers = await db["users"].find({"is_admin": {"$ne": True}}).to_list(length=100)
        return all_customers
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Update customer based on given user id
@api_router.patch("/customers/{user_id}", status_code=status.HTTP_200_OK, response_model=User)
async def update_customer(user_id: int, update_details: CustomerUpdateRequest, db = Depends(get_db)):
    update_object = {}
    if update_details.name is not None: update_object["name"] = update_details.name
    if update_details.email is not None: update_object["email"] = update_details.email
    if update_details.username is not None: update_object["username"] = update_details.username
    if update_details.password is not None: update_object["password"] = update_details.password

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
async def delete_customer(user_id: int, db = Depends(get_db)):
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
async def login(data: LoginData, db = Depends(get_db)):
    try:
        account = await db["users"].find_one({"username": data.username, "password": data.password})

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Invalid credentials.')

        return {
            "user_id": account["user_id"],
            "username": account["username"],
            "is_admin": account["is_admin"]
            }

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))