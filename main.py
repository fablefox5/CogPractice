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

class Bank:
    def __init__(self, bank_name):
        self.__credential_map = {} #key = username, password = value
        self.__accounts_map = {} #key = username, password = user object
        self.bank_name = bank_name

    def start_message(self):
        print("----------------")
        print(f"Welcome to the {self.bank_name}")
        self.Login()

    def create_user(self, username, password, first_name, is_admin):
        #Should check to make sure username is unique, will do if time
        self.__credential_map[username] = password
        if is_admin:
            self.__accounts_map[username] = User.AdminAccount(username, password, first_name, len(self.__credential_map), is_admin)
        else:
            self.__accounts_map[username] = User.CustomerAccount(username, password, first_name, len(self.__credential_map), is_admin, 0)

    def validate_account(self, username, password):
        if username in self.__credential_map:
            if password == self.__credential_map.get(username):
                return self.__accounts_map.get(username)
            else:
                return None

    def Login(self):
        logged_in = False
        while not logged_in:
            username = input("Please enter your username:")
            while username == "":
                username = input("Invalid username, please enter your username:")

            password = input("Please enter your password:")

            while password == "":
                password = input("Invalid password, Please enter your password:")

            validation_res = self.validate_account(username, password)
            if validation_res is None:
                print(f"Login Failed, try again...")
            else:
                print(f"Login Successful, hellow")
                logged_in = True





def main():
    print("Hello World")


if __name__ == "__main__":
    main()