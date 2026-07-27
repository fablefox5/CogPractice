def customer_menu(account_object):
    while True:
        print("Please choose one of the options below by entering the appropriate letter")
        print("d: Deposit money")
        print("w: Withdraw money")
        print("i: Account info")
        print("b: Current Balance")
        print("x: Exit program")

        user_input = input()

        match user_input.lower():
            case "d":
                DepositAction(account_object)
            case "w":
                WithdrawAction(account_object)
            case "i":
                print(account_object.get_account_details())
            case "b":
                print(f"Balance: ${account_object.get_balance()}")
            case "x":
                break
            case _:
                print("Incorrect letter entered, please enter a valid letter option")

def DepositAction(account_object):
    has_deposited = False
    while not has_deposited:
        deposit_amount = int(input("Please enter the amount to deposit. Please deposit a non-negative amount:"))
        is_successful_deposit = account_object.deposit(deposit_amount)

        if is_successful_deposit:
            has_deposited = True

def WithdrawAction(account_object):
    has_withdrawn = False

    while not has_withdrawn:
        deposit_amount = int(input("Please enter the amount to withdraw. Please withdraw a non-negative amount:"))
        is_successful_withdraw = account_object.withdraw(deposit_amount)

        if is_successful_withdraw:
            has_withdrawn = True
