def admin_menu(bank):
    while True:
        print("Please choose one of the options below by entering the appropriate letter")
        print("a: list out all user details")
        print("c: create a user")
        print("r: get account details of a user")
        print("u: update user details")
        print("d: delete a user")
        print("x: Exit program")

        user_input = input()

        match user_input.lower():
            case "a":
                print_all_users(bank)
            case "c":
                #Ideally check to make sure username doesn't exist already - NOTE: THIS IS NOT THE CASE YET
                user_details_string = input("Enter user details in comma separated list in format: (username, password, first_name, is_admin)")
                input_list = user_details_string.split(',')

                bank.create_user(input_list[0], input_list[1], input_list[2], bool(input_list[3]))
            case "r":
                #Assumes admin put in correct username or id, should check to make sure - NOTE: THIS IS NOT THE CASE YET
                user_identifier = input("Please enter the username or the id number of the user you want to get:")

                if user_identifier.isnumeric():
                    print(bank.get_user_by_id(int(user_identifier)).get_account_details())
                elif user_identifier:
                    print(bank.get_user_by_name(user_identifier).get_account_details())
            case "u":
                pass
            case "d":
                pass
            case "x":
                break
            case _:
                print("Incorrect letter entered, please enter a valid letter option")


def print_all_users(bank):
    print("\nAll users: (id | username | first name | balance | is admin?")
    for user_object in bank.get_account_map().values():
        balance = getattr(user_object, "balance", "NaN")
        print(
            f"{user_object.id} | {user_object.username} | {user_object.first_name} | {balance} | {user_object.is_admin}")
    print("")