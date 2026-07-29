const BASE_URL = 'http://127.0.0.1:8000/api/v1.0'

 async function getCustomers() {
  try {
    const response = await fetch(`${BASE_URL}/customers`)

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      return data
    }

    throw new Error('Unexpected response format from customers API')
  } catch (err) {
    console.error('An error has occurred when trying to get all customers:', err instanceof Error ? err.message : 'Unknown error')
    throw err
  }
}


async function editCustomer() {
    return null
}

async function deleteCustomer(customer_id: number) {
    try {
        const response = await fetch(`${BASE_URL}/customers`, {
            method: "DELETE",
            body: JSON.stringify({user_id: customer_id})
        })

        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`)
        }

        return true

    }
    catch (err) {
        console.error('An error has occurred when trying to get all customers:', err instanceof Error ? err.message : 'Unknown error')
        throw err
    }
}

export {getCustomers, editCustomer, deleteCustomer}