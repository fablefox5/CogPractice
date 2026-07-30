export type Customer = {
  user_id: number
  username: string
  email: string
  name: string
  is_admin: boolean
  created_at: string
}

export type EditParams = {
    name: string
    email: string
    username: string
    password: string
}

export type EditCustomerModalProps = {
  onCancel: () => void
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
  placeholderData: EditParams
}

export type CreateCustomerModalProps = {
  onCancel: () => void
  onSubmit: (e: React.SubmitEvent<HTMLFormElement>) => void
}