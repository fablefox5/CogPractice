from bson import Decimal128
from fastapi import APIRouter, status, HTTPException, Depends
from pymongo.asynchronous.collection import ReturnDocument
from pymongo.errors import DuplicateKeyError

from database.database import get_db
from lib.fastapi.security import OAuth2PasswordRequestForm
from schemas import (User, CustomerUpdateRequest, LoginData, NewUser, BasicUserData)
from config import api_version
from security import hash_password, authenticate_user, create_access_token, require_admin, get_current_user

api_router = APIRouter(prefix=f"/api/v{api_version}")

#ANYONE OR CLIENT SPECIFIC ROUTES

# Get self basic details
@api_router.get("/me", status_code=status.HTTP_200_OK)
async def create_user(current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        customer = await db["users"].find_one({"user_id": current_user.get('user_id')})
        if customer is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"could not get client's details"
            )
        else:
            return BasicUserData(
                username = customer["username"],
                is_admin = customer["is_admin"]
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# Login
@api_router.post("/login", status_code=status.HTTP_200_OK)
async def login(data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = await authenticate_user(data.username, data.password)

        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Invalid credentials.',
                                headers={"WWW-Authenticate": "Bearer"},)

        access_token = create_access_token({"sub": user.username, "is_admin": user.is_admin, "user_id": user.user_id})

        return {
            "username": user.username,
            "access_token": access_token,
            "user_id": user.user_id,
            "token_type": "bearer"
            }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



# Create new customer
@api_router.post("/customers", status_code=status.HTTP_201_CREATED)
async def create_user(customer_details: NewUser, db = Depends(get_db)):
    try:
        data: dict = customer_details.model_dump()
        data["password"] = hash_password(data["password"])
        res = await db["users"].insert_one(data)
        user = await db["users"].find_one({"_id": res.inserted_id})
        return {
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



# ADMIN ROUTES

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
    if update_details.password is not None: update_object["password"] = hash_password(update_details.password)

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

        if result.deleted_count != 1:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"the customer with id: {user_id} was not found"
            )

        accounts_list = await db["accounts"].find({"user_id": user_id}).to_list(length=100)

        for account in accounts_list:
            await db["transactions"].delete_many({"account_id": account["account_id"]})
            await db["accounts"].delete_many({"user_id": user_id})

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))