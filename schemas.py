from datetime import datetime, timezone
from pydantic import BaseModel, Field
from decimal import Decimal

def current_time():
    return datetime.now(timezone.utc)

class Account(BaseModel):
    user_id: int
    balance: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))
    account_type: str = Field(max_length=50)
    created_at: datetime = Field(default_factory=current_time)


class BalanceChangeRequest(BaseModel):
    amount: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))

class WithdrawResponse(BaseModel):
    user_id: int
    withdraw_amount: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))
    new_balance: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))

class DepositResponse(BaseModel):
    user_id: int
    deposit_amount: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))
    new_balance: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))

class User(BaseModel):
    user_id: int
    name: str = Field(max_length=100)
    email: str = Field(max_length=100)
    created_at: datetime = Field(default_factory=current_time)

class Transaction(BaseModel):
    txn_id: int
    account_id: int
    txn_type:  str = Field(max_length=20)
    amount: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))
    created_at: datetime = Field(default_factory=current_time)

class TransactionResponse(BaseModel):
    type:  str = Field(max_length=20)
    amount: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))
    date: datetime