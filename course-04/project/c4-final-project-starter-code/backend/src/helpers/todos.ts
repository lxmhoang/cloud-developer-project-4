import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodosAccess } from '../helpers/todosAcess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';

const todosAcess = new TodosAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todosAcess.getTodosForUser(userId);
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
  return todosAcess.getTodo(userId, todoId);
}

export async function updateTodo(userId: string, id: string, payload: UpdateTodoRequest) : Promise<void>{
  return todosAcess.updateTodo(userId, id, payload);
}

export async function updateTodoAttachment(userId: string, id: string): Promise<void> {
  return todosAcess.updateTodoAttachment(userId, id);
}

export async function deleteTodo(userId: string, id: string): Promise<void> {
  return todosAcess.deleteTodo(userId, id);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const id = uuid.v4();

  return await todosAcess.createTodo({
    userId,
    todoId: id,
    name: createTodoRequest.name,
    done: false,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate
  })
}

export async function todoExists(id: string): Promise<boolean> {
  return await todosAcess.todoExists(id);
}
