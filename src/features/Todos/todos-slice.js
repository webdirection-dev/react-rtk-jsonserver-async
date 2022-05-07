import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {resetToDefault} from '../Reset/reset-action';

const PATH = 'http://localhost:4001/todos/'

export const getTodos = createAsyncThunk(
    '@@todos/get-todos',
    async (_, {
        dispatch,
        getState,
        extra,
        rejectWithValue,
    }) => {
        const res = await fetch(PATH)
        return await res.json()
    }
);

export const createTodo = createAsyncThunk(
    '@@todos/create-todo',
    async (title) => {
        const res = await fetch(
            PATH,
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
);

export const toggleStatus = createAsyncThunk(
    '@@todos/toggle-todo',
    async (id, {dispatch, getState}) => {
        const todo = getState().todos.entities.find(i => i.id === id)

        await fetch(
            PATH+id,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({completed: !todo.completed})
            }
        )

        dispatch(toggleTodo(id))
    }
);

export const deleteTodo = createAsyncThunk(
    '@@todos/delete-todo',
    async (id, {dispatch}) => {
        await fetch(
            PATH+id,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            }
        )

        dispatch(removeTodo(id))
    }
);


const todoSlice = createSlice({
    name: '@@todos',
    initialState: {
        entities: [],
        loading: 'idle', // loading |
        error: null
    },

    reducers: {
        toggleTodo: (state, action) => {
            const todo = state.entities.find((todo) => todo.id === action.payload);
            todo.completed = !todo.completed;
        },

        removeTodo: (state, action) => {
            state.entities = state.entities.filter((todo) => todo.id !== action.payload);
        },
    },

    extraReducers: (builder) => {
        builder
            //resetToDefault
            .addCase(
                resetToDefault,
                (state) => {
                    state.entities = []
                }
            )

            //getTodos
            .addCase(
                getTodos.pending,
                (state) => {
                    state.loading = 'loading'
                    state.error = null
                }
            )
            .addCase(
                getTodos.rejected,
                (state) => {
                    state.loading = 'idle'
                    state.error = 'Something went wrong!'
                }
            )
            .addCase(
                getTodos.fulfilled,
                (state, action) => {
                    state.loading = 'idle'
                    state.entities = action.payload
                }
            )

            //createTodo
            .addCase(
                createTodo.fulfilled,
                (state, action) => {
                    state.loading = 'idle'
                    state.error = null
                    state.entities.push(action.payload)
                }
            )
    }
});

export const {removeTodo, toggleTodo} = todoSlice.actions;

export const todoReducer = todoSlice.reducer;

//selectors
export const selectVisibleTodos = (state, filter) => {
    const listTodos = state.todos.entities

    switch (filter) {
        case 'all': return listTodos
        case 'active': return listTodos.filter(i => !i.completed)
        case 'completed': return listTodos.filter(i => i.completed)

        default: return listTodos
    }
}