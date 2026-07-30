export type Customer = {
  user_id: number
  username: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
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