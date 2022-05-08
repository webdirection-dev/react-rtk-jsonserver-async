import {createSlice, createAsyncThunk, createEntityAdapter} from '@reduxjs/toolkit'
import {resetToDefault} from '../Reset/reset-action'

const todosAdapter = createEntityAdapter({
    //selectId явно обозначает id элемента
    selectId: (todo) => todo.id,
    //sortComparer явно уточняет метод сортировки
    // sortComparer: {}
})

//createAsyncThunk имеет 3 параметра
export const getTodos = createAsyncThunk(
    //Параметр 1 Название (typePrefix)
    '@@todos/get-todos',

    //Параметр 2 инструменты работы со стейтом (payloadCreator)
    async (
        props,
        {
            dispatch,
            getState,
            extra: api,
            rejectWithValue
        }
    ) => {
        try {
            return await api.getTodos()
        } catch (e) {
            return rejectWithValue('Failed to Fetch all todos.')
        }
    },

    //Параметр 3 Опции
    {
        condition: (props, {getState, extra}) => {
            //исключаем множественное обращение к серверу, например пользователь дважды нажал кнопку Загрузить
            const {loading} = getState().todos
            if (loading === 'loading') return false
        }
    }
);

export const createTodo = createAsyncThunk(
    '@@todos/create-todo',
    async (title, {extra: api}) => api.createTodo(title)
);

export const toggleStatus = createAsyncThunk(
    '@@todos/toggle-todo',
    async (id, {dispatch, getState, extra: api}) => {
        //без createEntityAdapter
        // const todo = getState().todos.entities.find(i => i.id === id)
        // await api.toggleStatus(id, todo)
        // dispatch(toggleTodo(id))

        //with createEntityAdapter
        const todo = getState().todos.entities[id]

        await api.toggleStatus(id, todo)
        dispatch(toggleTodo({id, completed: !todo.completed}))
    }
);

export const deleteTodo = createAsyncThunk(
    '@@todos/delete-todo',
    async (id, {dispatch, extra: api}) => {
        await api.deleteTodo(id)
        dispatch(removeTodo(id))
    }
);

const todoSlice = createSlice({
    name: '@@todos',

    //state без createEntityAdapter
    // initialState: {
    //     entities: [],
    //     loading: 'idle', // idle | loading
    //     error: null
    // },

    //state with createEntityAdapter
    //entities: [] находится createEntityAdapter по дефолту
    initialState: todosAdapter.getInitialState({
        loading: 'idle', // idle | loading
        error: null
    }),

    reducers: {
        toggleTodo: (state, action) => {
            //без createEntityAdapter
            // const todo = state.entities.find((todo) => todo.id === action.payload);
            // todo.completed = !todo.completed;

            //with createEntityAdapter
            const {id, completed} = action.payload

            todosAdapter.updateOne(
                state,
                {
                    id: id,
                    changes: {
                        completed: completed
                    }
                }
            )
        },

        removeTodo: (state, action) => {
            //без createEntityAdapter
            // state.entities = state.entities.filter((todo) => todo.id !== action.payload);

            //with createEntityAdapter
            todosAdapter.removeOne(state, action.payload)
        },
    },

    extraReducers: (builder) => {
        builder
            //resetToDefault
            .addCase(
                resetToDefault,
                //без createEntityAdapter
                // (state) => {
                //     state.entities = []
                // }

                //with createEntityAdapter
                (state) => {
                    todosAdapter.setAll(state, [])
                }

            )

            //getTodos
            .addCase(
                getTodos.pending,
                (state, action) => {
                    state.loading = 'loading'
                    state.error = null
                }
            )

            .addCase(
                getTodos.fulfilled,
                (state, action) => {
                    //без createEntityAdapter
                    // state.entities = action.payload

                    //with createEntityAdapter
                    todosAdapter.addMany(state, action.payload)
                }
            )

            //createTodo
            .addCase(
                createTodo.fulfilled,
                (state, action) => {
                    //без createEntityAdapter
                    // state.entities.push(action.payload)

                    //with createEntityAdapter
                    todosAdapter.addOne(state, action.payload)
                }
            )

            //addMatcher работает со всеми экшенами, соответсвующих условию matcher
            .addMatcher(
                action => action.type.endsWith('/rejected'), // boolean
                (state, action) => {
                    state.loading = 'idle'
                    state.error = action.payload || action.error.message
                }
            )

            .addMatcher(
                action => action.type.endsWith('/fulfilled'), // boolean
                (state, action) => {
                    state.loading = 'idle'
                    state.error = null
                }
            )
    }
});

export const {removeTodo, toggleTodo} = todoSlice.actions;
export const todoReducer = todoSlice.reducer;

//selectors
export const todosSelectors = todosAdapter.getSelectors(state => state.todos)

//без createEntityAdapter
// export const selectVisibleTodos = (state, filter) => {
//     const listTodos = state.todos.entities
//
//     switch (filter) {
//         case 'all': return listTodos
//         case 'active': return listTodos.filter(i => !i.completed)
//         case 'completed': return listTodos.filter(i => i.completed)
//
//         default: return listTodos
//     }
// }

//with createEntityAdapter
export const selectVisibleTodos = (allTodos = [], filter) => {
    switch (filter) {
        case 'all': return allTodos
        case 'active': return allTodos.filter(i => !i.completed)
        case 'completed': return allTodos.filter(i => i.completed)

        default: return allTodos
    }
}