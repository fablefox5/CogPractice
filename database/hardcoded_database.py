from schemas import Account, Transaction
from decimal import Decimal

accounts_db: list[Account] = [
    Account(
        user_id=101,
        balance=Decimal("1250.50"),
        account_type="checking",
    ),
    Account(
        user_id=101,
        balance=Decimal("5000.00"),
        account_type="savings",
    ),
    Account(
        user_id=102,
        balance=Decimal("420.75"),
        account_type="checking",
    ),
    Account(
        user_id=103,
        balance=Decimal("15000.00"),
        account_type="money_market",
    ),
]

transactions_db: list[Transaction] = [

]