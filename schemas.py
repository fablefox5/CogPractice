from datetime import datetime, timezone
from typing import Annotated
from bson import Decimal128
from pydantic import BaseModel, Field, BeforeValidator, PlainSerializer, ConfigDict
from decimal import Decimal

def decimal128_to_decimal(value):
    if isinstance(value, Decimal128):
        return value.to_decimal()
    return value

def decimal_to_decimal128(value):
    if isinstance(value, Decimal):
        return Decimal128(value)
    return value

DecimalType = Annotated[Decimal,
BeforeValidator(decimal128_to_decimal),
PlainSerializer(lambda v: float(v), return_type=float, when_used="json"),
PlainSerializer(
        decimal_to_decimal128,
        when_used="unless-none"
    )
]

def current_time():
    return datetime.now(timezone.utc)

class Account(BaseModel):
    account_id: int
    user_id: int
    balance: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))
    account_type: str = Field(max_length=50)
    created_at: datetime = Field(default_factory=current_time)

    model_config = ConfigDict(arbitrary_types_allowed=True)

class AccountUpdateRequest(BaseModel):
    account_id: int = None
    user_id: int = None
    balance: DecimalType = Field(max_digits=10, decimal_places=2, default=None)
    account_type: str = Field(max_length=50, default=None)



class BalanceChangeRequest(BaseModel):
    amount: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))

class WithdrawResponse(BaseModel):
    user_id: int
    withdraw_amount: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))
    new_balance: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))

class DepositResponse(BaseModel):
    user_id: int
    deposit_amount: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))
    new_balance: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))

class User(BaseModel):
    user_id: int
    name: str = Field(max_length=100)
    email: str = Field(max_length=100)
    created_at: datetime = Field(default_factory=current_time)

class Transaction(BaseModel):
    txn_id: int = None
    account_id: int
    txn_type:  str = Field(max_length=20)
    amount: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))
    created_at: datetime = Field(default_factory=current_time)

class TransactionResponse(BaseModel):
    txn_type:  str = Field(max_length=20)
    amount: DecimalType = Field(max_digits=10, decimal_places=2, default=Decimal("0.0"))
    created_at: datetime

class DeleteAccountResponse(BaseModel):
    deleted_account_id: int