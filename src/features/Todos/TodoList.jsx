import {useEffect} from "react";
import { useSelector, useDispatch } from "react-redux";

import {getTodos} from "./todos-slice";
import {selectVisibleTodos, toggleStatus, deleteTodo} from './todos-slice';

export const TodoList = () => {
    const activeFilter = useSelector(state => state.filter)
    const todos = useSelector(state => selectVisibleTodos(state, activeFilter));
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getTodos())
    }, [dispatch])

    return (
        <ul>
            {todos.map((todo) => (
                <li key={todo.id}>
                    <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => dispatch(toggleStatus(todo.id))}
                    />{" "}
                    {todo.title}{" "}
                    <button onClick={() => dispatch(deleteTodo(todo.id))}>delete</button>
                </li>
            ))}
        </ul>
    );
};
