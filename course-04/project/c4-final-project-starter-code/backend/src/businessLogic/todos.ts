import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodosAccess } from '../dataLayer/todosAcess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { GetTodoRes } from '../models/GetTodoRes';

const todosAcess = new TodosAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todosAcess.getTodosForUser(userId);
}

export async function getTodosForUser(userId: string, nextKey: any, limit: number, orderBy: string): Promise<GetTodoRes> {

  return await todosAcess.getTodos(userId, nextKey, limit, orderBy);
}

// export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
//   return todosAcess.getTodo(userId, todoId);
// }

export async function updateTodo(userId: string, id: string, payload: UpdateTodoRequest) : Promise<void>{
  return todosAcess.updateTodo(userId, id, payload);
}

export async function updateTodoAttachment(userId: string, todoId: string): Promise<void> {
  return todosAcess.updateTodoAttachment(userId, todoId);
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
    userId: userId,
    todoId: id,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
  })
}

export async function todoExists(id: string): Promise<boolean> {
  return await todosAcess.todoExists(id);
}
