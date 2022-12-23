import { TodoItem } from './TodoItem'

export interface GetTodoRes {
  items: TodoItem[]
  nextKey: string
}