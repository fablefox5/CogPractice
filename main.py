# Implement problem-solving, OOD, Collections/DS concepts
# Create Abstract User, Create Admin extends User, Create Customer extends User
# Abstract Class User: username, password, isAdmin: true/false
# Abstract account class, with checking account, savings account extended from abstract
# Interface AccountOperations: PrintInterestRate(), Deposit, Withdraw, Transfer
# SavingsAccount always gives higher interest rate
# Create admin dashboard, admin goes to it if logged in, else go to customer.
# Admin can see all customers, all info
# AUthenticate user, check

class Bank:
    def __init__(self):
        self.__credential_map = {} #key = username, password = value
        self.__accounts_map = {} #


    def Login(self, username, password):
        if username in self.__credential_map:




def main():
    print("Hello World")


if __name__ == "__main__":
    main()