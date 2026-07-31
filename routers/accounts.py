from bson import Decimal128
from fastapi import APIRouter, status, HTTPException, Response, Depends
from pymongo.asynchronous.collection import ReturnDocument
from pymongo.errors import DuplicateKeyError

from database.database import db_manager, get_db
from schemas import (Account, WithdrawResponse, DepositResponse, BalanceChangeRequest, Transaction,
                     TransactionResponse, DeleteAccountResponse, AccountUpdateRequest)
from config import api_version
from security import get_current_user, require_admin

#temp for hardcoded
# from database.hardcoded_database import accounts_db, transactions_db

api_router = APIRouter(prefix=f"/api/v{api_version}")

# Create new account
@api_router.post("/accounts", status_code=status.HTTP_201_CREATED)
async def create_account(account_details: Account, client_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        res = await db["accounts"].insert_one(account_details.model_dump())
        return {"message": "Account created successfully", "id": str(res.inserted_id)}

    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"An account with the same id already exists")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



# Get account based on account id
@api_router.get("/accounts/{account_id}", status_code=status.HTTP_200_OK, response_model=Account)
async def get_account(account_id: int, db = Depends(get_db)):
    try:
        account = await db["accounts"].find_one({"account_id": account_id})
        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"the account with id: {account_id} was not found")
        else:
            return account
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Get account based on user id
@api_router.get("/accounts/customer/{user_id}", status_code=status.HTTP_200_OK, response_model=list[Account])
async def get_user_accounts(user_id: int, db = Depends(get_db)):
    try:
        accounts = await db["accounts"].find({"user_id": user_id}).to_list(length=100)
        if len(accounts) <= 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"accounts with user id: {user_id} was not found")
        else:
            return accounts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Get all accounts
@api_router.get("/accounts", status_code=status.HTTP_200_OK, response_model=list[Account])
async def get_accounts(db = Depends(get_db)):
    try:
        all_accounts = await db["accounts"].find({}).to_list(length=100)
        return all_accounts
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# withdraw money in given account (through account id)
@api_router.patch("/accounts/{account_id}/withdraw", status_code=status.HTTP_200_OK)
async def withdraw(account_id: int, data: BalanceChangeRequest, client_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        account = await db["accounts"].find_one({"account_id": account_id})

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"the account with id: {account_id} was not found")

        original_balance = account["balance"].to_decimal()
        if  original_balance < data.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient funds")

        decimal_amount = Decimal128(data.amount)
        updated_account = await db["accounts"].find_one_and_update({"account_id": account_id}, {"$inc": {"balance": Decimal128(-data.amount)}}, return_document=ReturnDocument.AFTER)

        await db["transactions"].insert_one({
            "account_id": account_id,
            "txn_type": "WITHDRAW",
            "amount": decimal_amount
        })
        return WithdrawResponse(
            user_id = account["user_id"],
            account_id = account["account_id"],
            withdraw_amount = data.amount,
            new_balance = updated_account["balance"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# deposit money in given account (through account id)
@api_router.patch("/accounts/{account_id}/deposit", status_code=status.HTTP_200_OK)
async def deposit(account_id: int, data: BalanceChangeRequest, client_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        account = await db["accounts"].find_one({"account_id": account_id})

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"the account with id: {account_id} was not found")


        if 0 > data.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Invalid deposit amount. Deposit cannot be a negative value.")

        updated_account = await db["accounts"].find_one_and_update({"account_id": account_id}, {"$inc": {"balance": Decimal128(data.amount)}})
        await db["transactions"].insert_one({
            "account_id": account_id,
            "txn_type": "DEPOSIT",
            "amount": Decimal128(data.amount)
        })

        return DepositResponse(
            user_id = account["user_id"],
            account_id = account["account_id"],
            deposit_amount = data.amount,
            new_balance = updated_account["balance"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# get all transactions history from a particular account (through account id)
@api_router.get("/accounts/{account_id}/transactions", status_code=status.HTTP_200_OK, response_model=list[Transaction])
async def get_transaction_history(account_id: int, db = Depends(get_db)):
    try:
        all_transactions = await db["transactions"].find({"account_id": account_id}).to_list(length=100)
        # if all_transactions.count() == 0:
        #     raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
        #                         detail=f"No transaction history found with given id: {account_id}")
        return all_transactions
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Update account based on given account id
@api_router.patch("/accounts/{account_id}", status_code=status.HTTP_200_OK, response_model=Account)
async def update_account(account_id: int, update_details: AccountUpdateRequest, db = Depends(get_db)):
    update_object = {}
    if update_details.account_type is not None: update_object["account_type"] = update_details.account_type
    if update_details.balance is not None: update_object["balance"] = Decimal128(update_details.balance)
    if update_details.account_id is not None: update_object["account_id"] = update_details.account_id
    if update_details.user_id is not None: update_object["user_id"] = update_details.user_id

    try:
        account = await db["accounts"].find_one_and_update({"account_id": account_id}, {"$set": update_object}, return_document=ReturnDocument.AFTER)

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"the account with id: {account_id} was not found")

        return account
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Delete account based on given account id
@api_router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(account_id: int, admin_user = Depends(require_admin), db = Depends(get_db)):
    try:
        result = await db["accounts"].delete_one({"account_id": account_id})

        if result.deleted_count == 1:
            return None
        else:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"the account with id: {account_id} was not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))