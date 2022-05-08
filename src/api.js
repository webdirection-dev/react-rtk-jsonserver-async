const BASE_URL = 'http://localhost:4001/todos/'

export const getTodos = async () => {
    const res = await fetch(BASE_URL)
    return await res.json()
}

export const createTodo = async (title) => {
    const res = await fetch(
        BASE_URL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({title, completed: false})
        }
    )

    return await res.json()
}

export const toggleStatus = async (id, todo) => {
    await fetch(
        BASE_URL+id,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({completed: !todo.completed})
        }
    )
}

export const deleteTodo = async (id) => {
    await fetch(
        BASE_URL+id,
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
}