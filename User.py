from abc import abstractmethod


class User:
    @abstractmethod
    def __init__(self, username, password, first_name, user_id, is_admin):
        self.username = username
        self.password = password
        self.first_name = first_name
        self.id = user_id
        self.is_admin = is_admin

    def get_account_details(self):
        return f'username: {self.username}, name: {self.first_name}'

class CustomerAccount(User):
    def __init__(self, username, password, first_name, user_id, is_admin, initial_balance):
        super().__init__(username, password, first_name, user_id, is_admin)
        self.balance = initial_balance
        self.transaction_history = []

    def get_balance(self):
        return self.balance

    def deposit(self, amount):
        if amount < 0:
            return False

        self.balance += amount

        return True

    def withdraw(self, amount):
        if self.balance < amount:
            return False

        return True

    def get_account_details(self):
        return f'username: {self.username}, name: {self.first_name}, balance: {self.balance}'

class AdminAccount(User):
    def __init__(self, username, password, first_name, user_id, is_admin):
        super().__init__(username, password, first_name, user_id, is_admin)

    def get_all_accounts(self):
        pass

