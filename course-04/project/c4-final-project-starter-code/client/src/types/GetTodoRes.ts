import { Todo } from "./Todo"

export interface GetTodoRes {
    items: Todo[],
    nextKey?: string
}
