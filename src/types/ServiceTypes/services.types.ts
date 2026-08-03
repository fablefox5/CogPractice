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

export type CreateAccountModalProps = {
  onCancel: () => void 
  onSubmit: (payload: AccountBasicParams) => void
  isSubmitting: boolean
}

export type EditUserAccountRequest = {
  accountId: number
  details: AccountBasicParams
}

export type EditUserAccountsModalProps = {
  userId: number
  username: string
  accounts: Account[]
  isLoading: boolean
  isSubmitting: boolean
  errorMessage: string | null
  onClose: () => void
  onRefresh: () => Promise<void>
  onSubmit: (payload: EditUserAccountRequest) => Promise<void>
}

export type TransferRequest = {
  sourceAccountId: number
  destinationAccountId: number
  amount: number
}

export type TransferModalProps = {
  onCancel: () => void
  onSubmit: (payload: TransferRequest) => Promise<TransferResponse> | TransferResponse
  accounts: Account[]
  initialSourceAccountId?: number | null
  isSubmitting: boolean
}

export type LoginParams = {
  username: string,
  password: string
}

export type LoginResult = {
  username: string,
  user_id: number,
  access_token: string,
  token_type: string
}

export type SignupResult = {
  username: string,
  is_admin: boolean
}

export type UserBasicParams = {
  username: string,
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

export type TransferResponse = {
    source_account_id: number
    destination_account_id: number
    amount: number
    source_account_balance: number
    destination_account_balance: number
}