from fastapi import APIRouter
from schemas import Account
from config import api_version

#temp for hardcoded
from database.hardcoded_database import accounts


api_router = APIRouter(prefix=f"/api/v{api_version}")


@api_router.post("/accounts")
def create_account(account_details: Account):
    accounts.append(account_details)
    return accounts



@api_router.get("/accounts/{account_id}")
def get_item(account_id: int) -> Account:
    for account in accounts:
        if account_id == account.user_id:
            return account