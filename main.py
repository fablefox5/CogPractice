# Implement problem-solving, OOD, Collections/DS concepts
# Create Abstract User, Create Admin extends User, Create Customer extends User
# Abstract Class User: username, password, isAdmin: true/false
# Abstract account class, with checking account, savings account extended from abstract
# Interface AccountOperations: PrintInterestRate(), Deposit, Withdraw, Transfer
# SavingsAccount always gives higher interest rate
# Create admin dashboard, admin goes to it if logged in, else go to customer.
# Admin can see all customers, all info
# Authenticate user, check

import User
import UserActions
import AdminActions

class Bank:
    def __init__(self, bank_name):
        self.__credential_map = {} #key = username, password = value
        self.__accounts_map = {} #key = username, password = user object
        self.bank_name = bank_name

    def start(self):
        print("----------------")
        print(f"Welcome to the {self.bank_name}")
        login_object = self.login()

        if login_object is not None:
            if login_object.is_admin:
                AdminActions.admin_menu(self)
            else:
                UserActions.customer_menu(login_object)

    def create_user(self, username, password, first_name, is_admin):
        #Should check to make sure username is unique, will do if time
        self.__credential_map[username] = password
        if is_admin:
            self.__accounts_map[username] = User.AdminAccount(username, password, first_name, len(self.__credential_map), is_admin)
        else:
            self.__accounts_map[username] = User.CustomerAccount(username, password, first_name, len(self.__credential_map), is_admin, 0)

    def remove_user_by_name(self, username):
        if username in self.__accounts_map:
            self.__accounts_map.pop(username)
        else:
            print("Incorrect username given. Please enter a username that exists.")

    def get_user_by_id(self, user_id):
        for username, user_object in self.__accounts_map:
            if user_object.id == user_id:
                self.__accounts_map.pop(username)

        print("Incorrect id given. Please enter an id that exists.")

    def get_user_by_name(self, username):
        if username in self.__accounts_map:
            return self.__accounts_map.get(username)
        else:
            print("Incorrect username given. Please enter a username that exists.")

    def get_user_by_id(self, user_id):
        for user_object in self.__accounts_map.values():
            if user_object.id == user_id:
                return user_object

        print("Incorrect id given. Please enter an id that exists.")

    def get_account_map(self):
        return self.__accounts_map

    def validate_account(self, username, password):
        if username in self.__credential_map:
            if password == self.__credential_map.get(username):
                return self.__accounts_map.get(username)
            else:
                return None

    def login(self):
        while True:
            username = input("Please enter your username:")
            while username == "":
                username = input("Please enter your username (do not enter blank username):")

            password = input("Please enter your password:")

            while password == "":
                password = input("Please enter your password (do not enter blank password):")

            res_object = self.validate_account(username, password)
            if res_object is None:
                try_again_input = input("Login failed. Press t to try again or press x to exit the program")

                if try_again_input.lower() == "x":
                    return None
            else:
                print(f"Login Successful, hello {res_object.first_name}")
                return res_object










def main():
    bank = Bank("Super Bank")
    bank.create_user("test_user", "password", "Andrew", False)
    bank.create_user("admin", "admin", "Jon", True)
    bank.start()




if __name__ == "__main__":
    main()