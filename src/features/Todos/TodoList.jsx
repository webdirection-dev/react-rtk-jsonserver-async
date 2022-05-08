import {useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";
import {ToastContainer, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'

import {getTodos, todosSelectors} from "./todos-slice";
import {selectVisibleTodos, toggleStatus, deleteTodo} from './todos-slice';

export const TodoList = () => {
    const dispatch = useDispatch();
    const {error, loading} = useSelector(state => state.todos)
    const activeFilter = useSelector(state => state.filter)

    //без createEntityAdapter
    // const todos = useSelector(state => selectVisibleTodos(state, activeFilter));

    //with createEntityAdapter
    const allTodos = useSelector(todosSelectors.selectAll)
    const todos = selectVisibleTodos(allTodos, activeFilter)

    useEffect(() => {
        //dispatch возвращает промис, можно использовать .then
        //метод unwrap позволяет добавить блок catch
        const promise = dispatch(getTodos())
            .unwrap()
            .then(({payload}) => {
                toast('All Todos were fetch')
            })
            .catch(error => {
                toast(error)
            })

        return () => {
            // если пользователь покинет страницу промис не выполниться, запрос на сервер будет отменен
            promise.abort()
        }
    }, [dispatch])

    return (
        <>
            <ToastContainer />
            <ul>
                {error && <h2>{error}</h2>}
                {loading === 'loading' && <h3>Loading...</h3>}

                {
                    loading === 'idle' && !error && todos.map((todo) => (
                        <li key={todo.id}>
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => dispatch(toggleStatus(todo.id))}
                            />{" "}
                            {todo.title}{" "}
                            <button onClick={() => dispatch(deleteTodo(todo.id))}>delete</button>
                        </li>
                    ))
                }
            </ul>
        </>
    );
};
