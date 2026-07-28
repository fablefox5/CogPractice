from datetime import datetime, timezone
from pydantic import BaseModel, Field
from decimal import Decimal

def current_time():
    return datetime.now(timezone.utc)

class Account(BaseModel):
    user_id: int
    amount: Decimal = Field(max_digits=10, decimal_places=2, default=Decimal(0.0))
    account_type: str = Field(max_length=50)
    created_at: datetime = Field(default_factory=current_time)

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

