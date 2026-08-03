from bson import Decimal128
from fastapi import APIRouter, status, HTTPException, Response, Depends
from pymongo.asynchronous.collection import ReturnDocument
from pymongo.errors import DuplicateKeyError

from database.database import db_manager, get_db
from schemas import (Account, WithdrawResponse, DepositResponse, BalanceChangeRequest, Transaction,
                     AccountUpdateRequest, TransferRequest,
                     TransferResponse, AccountCreateRequest)
from config import api_version
from security import get_current_user, require_admin, verify_ownership_or_admin

api_router = APIRouter(prefix=f"/api/v{api_version}")

# ANYONE OR CLIENT SPECIFIC ROUTES

# Create new account
@api_router.post("/accounts", status_code=status.HTTP_201_CREATED)
async def create_account(account_details: AccountCreateRequest, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        new_details = account_details.model_dump()
        new_details["user_id"] = current_user["user_id"]
        new_details["balance"] = Decimal128(str(new_details["balance"]))
        res = await db["accounts"].insert_one(new_details)
        return {"message": "Account created successfully", "id": str(res.inserted_id)}

    except DuplicateKeyError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"An account with the same id already exists")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))



# Get account based on account id
@api_router.get("/accounts/{account_id}", status_code=status.HTTP_200_OK, response_model=Account)
async def get_account(account_id: int, admin_user = Depends(require_admin),  db = Depends(get_db)):
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

# Get all user accounts based on their JWT token user id
@api_router.get("/accounts/customer/me", status_code=status.HTTP_200_OK, response_model=list[Account])
async def get_user_accounts(current_user=Depends(get_current_user), db=Depends(get_db)):
    try:
        user_id = current_user["user_id"]
        accounts = await db["accounts"].find({"user_id": user_id}, {"_id": 0}).to_list(length=100)
        if len(accounts) <= 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"accounts with user id: {user_id} was not found")
        else:
            return accounts
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Transfer from one account to another
@api_router.patch("/accounts/transfer", status_code=status.HTTP_200_OK)
async def transfer(data: TransferRequest, current_user: dict = Depends(get_current_user), db= Depends(get_db)):
    try:
        if data.amount < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Transfer failed. Enter a number greater than or equal to 0")

        user_id = current_user["user_id"]
        source_id = data.source_account_id
        destination_id = data.destination_account_id

        source_account = await db["accounts"].find_one({"user_id": user_id, "account_id": source_id})
        destination_account = await db["accounts"].find_one({"user_id": user_id, "account_id": destination_id})

        if source_account is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Permissions Denied for transfer - invalid permission for account id: {source_id}")

        if destination_account is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Permissions Denied for transfer - invalid permission for account id: {destination_id}")

        original_balance = source_account["balance"].to_decimal()

        if  original_balance < data.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient funds for source account with id: {source_id}")

        decimal_amount = Decimal128(data.amount)

        updated_source = await db["accounts"].find_one_and_update({"account_id": source_id},
                                                                   {"$inc": {"balance": Decimal128(-data.amount)}},
                                                                   return_document=ReturnDocument.AFTER)

        updated_destination = await db["accounts"].find_one_and_update({"account_id": destination_id},
                                                                       {"$inc": {"balance": decimal_amount}},
                                                                       return_document=ReturnDocument.AFTER)


        source_transaction = Transaction(
            account_id = source_id,
            txn_type = f"WITHDRAW - TRANSFER TO ID: {destination_id}",
            amount = decimal_amount
        )

        destination_transaction = Transaction(
            account_id = destination_id,
            txn_type = f"DEPOSIT - TRANSFER TO ID: {source_id}",
            amount = decimal_amount
        )

        await db["transactions"].insert_one(source_transaction.model_dump())
        await db["transactions"].insert_one(destination_transaction.model_dump())


        return TransferResponse(
            source_account_id = source_id,
            destination_account_id = destination_id,
            amount = decimal_amount,
            source_account_balance = updated_source["balance"],
            destination_account_balance = updated_destination["balance"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# withdraw money in given account (through account id)
@api_router.patch("/accounts/{account_id}/withdraw", status_code=status.HTTP_200_OK)
async def withdraw(account_id: int, data: BalanceChangeRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    try:
        if data.amount < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Withdraw failed. Enter a number greater than or equal to 0")

        account = await db["accounts"].find_one({"account_id": account_id})

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"the account with id: {account_id} was not found")
        verify_ownership_or_admin(account["user_id"], current_user)
        original_balance = account["balance"]

        if isinstance(original_balance, Decimal128):
            original_balance = original_balance.to_decimal()

        if  original_balance < data.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient funds")

        decimal_amount = Decimal128(data.amount)
        updated_account = await db["accounts"].find_one_and_update({"account_id": account_id}, {"$inc": {"balance": Decimal128(-data.amount)}}, return_document=ReturnDocument.AFTER)

        transaction = Transaction(
            account_id = account_id,
            txn_type = "WITHDRAW",
            amount = decimal_amount
        )

        await db["transactions"].insert_one(transaction.model_dump())

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
async def deposit(account_id: int, data: BalanceChangeRequest, current_user: dict = Depends(get_current_user), db = Depends(get_db)):
    try:
        if data.amount < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Deposit failed. Enter a number greater than or equal to 0")

        account = await db["accounts"].find_one({"account_id": account_id})

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail=f"the account with id: {account_id} was not found")

        verify_ownership_or_admin(account["user_id"], current_user)
        if 0 > data.amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Invalid deposit amount. Deposit cannot be a negative value.")

        updated_account = await db["accounts"].find_one_and_update({"account_id": account_id}, {"$inc": {"balance": Decimal128(data.amount)}}, return_document=ReturnDocument.AFTER)

        transaction = Transaction(
            account_id = account_id,
            txn_type = "DEPOSIT",
            amount = Decimal128(data.amount)
        )

        await db["transactions"].insert_one(transaction.model_dump())


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



# ADMIN OR USER ROUTES

# get all transactions history from a particular account (through account id)
@api_router.get("/accounts/{account_id}/transactions", status_code=status.HTTP_200_OK, response_model=list[Transaction])
async def get_transaction_history(account_id: int, current_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        account = await db["accounts"].find_one({"account_id": account_id})

        if account is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"account with id: {account_id} not found")

        verify_ownership_or_admin(account["user_id"], current_user)
        all_transactions = await db["transactions"].find({"account_id": account_id}).to_list(length=100)
        return all_transactions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# ADMIN-SPECIFIC ROUTES

# Get all user accounts based on their user id
@api_router.get("/accounts/customer/{user_id}", status_code=status.HTTP_200_OK, response_model=list[Account])
async def get_user_accounts(user_id: int, admin_user = Depends(get_current_user), db = Depends(get_db)):
    try:
        accounts = await db["accounts"].find({"user_id": user_id}, {"_id": 0}).to_list(length=100)
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
async def get_accounts(admin_user=Depends(require_admin), db=Depends(get_db)):
    try:
        all_accounts = await db["accounts"].find({}).to_list(length=100)
        return all_accounts
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

# Delete account based on given account id
@api_router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(account_id: int, admin_user = Depends(require_admin), db = Depends(get_db)):
    try:
        result = await db["accounts"].delete_one({"account_id": account_id})


        if result.deleted_count != 1:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                          detail=f"the account with id: {account_id} was not found")

        await db["transactions"].delete_many({"account_id": account_id})

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Update account based on given account id
@api_router.patch("/accounts/{account_id}", status_code=status.HTTP_200_OK, response_model=Account)
async def update_account(account_id: int, update_details: AccountUpdateRequest, admin_user = Depends(require_admin), db = Depends(get_db)):
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
