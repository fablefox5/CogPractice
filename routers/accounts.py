from fastapi import APIRouter, status, HTTPException

import schemas
from schemas import Account, WithdrawResponse, DepositResponse, BalanceChangeRequest, Transaction, TransactionResponse
from config import api_version
from decimal import Decimal

#temp for hardcoded
from database.hardcoded_database import accounts_db, transactions_db

api_router = APIRouter(prefix=f"/api/v{api_version}")


@api_router.post("/accounts", status_code=status.HTTP_201_CREATED)
def create_account(account_details: Account):
    accounts_db.append(account_details)
    return accounts_db



@api_router.get("/accounts/{account_id}", status_code=status.HTTP_200_OK, response_model=Account)
def get_item(account_id: int) -> Account:
    for account in accounts_db:
        if account_id == account.user_id:
            return account

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"the id: {account_id} was not found")


@api_router.post("/accounts/{account_id}/withdraw", status_code=status.HTTP_200_OK)
def withdraw(account_id: int, data: BalanceChangeRequest):
    for account in accounts_db:
        if account_id == account.user_id:
            if account.balance < data.amount:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Insufficient funds")

            account.balance -= data.amount
            transactions_db.append(Transaction(
                txn_id = account_id + len(transactions_db),
                account_id = account_id,
                txn_type = "WITHDRAW",
                amount = data.amount
            ))

            return WithdrawResponse(
                user_id = account.user_id,
                withdraw_amount = data.amount,
                new_balance = account.balance
            )

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"the id: {account_id} was not found")

@api_router.post("/accounts/{account_id}/deposit", status_code=status.HTTP_200_OK)
def withdraw(account_id: int, data: BalanceChangeRequest):
    for account in accounts_db:
        if account_id == account.user_id:
            if 0 > data.amount:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                    detail=f"Invalid deposit amount. Deposit cannot be a negative value.")

            account.balance += data.amount
            transactions_db.append(Transaction(
                txn_id = 111,
                account_id = account_id,
                txn_type = "DEPOSIT",
                amount = data.amount
            ))
            return DepositResponse(
                user_id = account.user_id,
                deposit_amount = data.amount,
                new_balance = account.balance
            )

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"the id: {account_id} was not found")


@api_router.get("/accounts/{account_id}/transactions", status_code=status.HTTP_200_OK, response_model=list[TransactionResponse])
def get_transaction_history(account_id: int):
    transaction_array = []

    for transaction in transactions_db:
        if transaction.account_id == account_id:
            transaction_array.append(TransactionResponse(
                type = transaction.txn_type,
                amount = transaction.amount,
                date = transaction.created_at
            ))

    if len(transaction_array) > 0:
        return transaction_array

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No transaction history found with given id: {account_id}")

