export type Customer = {
  user_id: number
  username: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
}

export type Account = {
    account_id: number
    user_id: number
    balance: number
    account_type: string
    created_at: Date
}

export type AccountBasicParams = {
    user_id: number
    balance: number
    account_type: string
}

export type CustomerBasicParams = {
    name: string
    email: string
    username: string
    password: string
}

export type EditCustomerModalProps = {
  onCancel: () => void
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
  placeholderData: CustomerBasicParams
}

export type CreateCustomerModalProps = {
  onCancel: () => void
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
}

export type LoginParams = {
  username: string,
  password: string
}

export type LoginResult = {
  username: string,
  user_id: number,
  is_admin: boolean
}

export type Transaction = {
    txn_id: number,
    account_id: number,
    txn_type:  string,
    amount: number,
    created_at: Date,
}

export type WithdrawResponse = {
    user_id: number,
    account_id: number,
    withdraw_amount: number,
    new_balance: number
}

export type DepositResponse = {
    user_id: number,
    account_id: number,
    deposit_amount: number,
    new_balance: number
}