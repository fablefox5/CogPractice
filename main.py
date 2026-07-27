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
                try_again_input = input("Login failed. Press t to try again or press x to exit the program")

                if try_again_input.lower() == "x":
                    return None
            else:
                print(f"Login Successful, hello ")
                logged_in = True




    def CustomerMenu(self, account_object):
        print("Please choose one of the options below by entering the appropriate letter")
        print("d: Deposit money")
        print("w: Withdraw money")
        print("i: Account info")
        print("b: Current Balance")
        print("x: Exit program")

        user_input = input()

        match user_input:
            case "d":
                has_deposited = False
                while not has_deposited:
                    deposit_amount = int(input("Please enter the amount to deposit. Please deposit a non-negative amount:"))
                    is_successful_deposit = account_object.deposit(deposit_amount)

                    if is_successful_deposit:
                        has_deposited = True
            case "w":
                has_withdrawn = False

                while not has_withdrawn:
                    deposit_amount = int(input("Please enter the amount to withdraw. Please withdraw a non-negative amount:"))
                    is_successful_withdraw = account_object.withdraw(deposit_amount)

                    if is_successful_withdraw:
                        has_withdrawn = True
            case "i":
                account_object.get_account_details()
            case "b":
                print(f"Balance: ${account_object.get_balance()}")
            case "x":
                return None
            case _:
                print("Incorrect letter entered, please enter a valid letter option")



    def AdminMenu(self, account_object):
        pass








def main():
    bank = Bank("Super Bank")
    bank.start_message()




if __name__ == "__main__":
    main()