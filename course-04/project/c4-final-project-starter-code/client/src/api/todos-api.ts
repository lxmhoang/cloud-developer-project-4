import { apiEndpoint } from '../config'
import { Todo } from '../types/Todo';
import { CreateTodoRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest';
import { GetTodoRes } from '../types/GetTodoRes';
import { GetTodoReq } from '../types/GetTodoReq';


export async function getTodos(
  idToken: string,
  request: GetTodoReq
): Promise<GetTodoRes> {

  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/todos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    params: {
      limit: request.limit,
      nextKey: request.nextKey
    },

  })
  console.log('Todos:', response.data.items)
  return response.data
}

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  const response = await Axios.post(`${apiEndpoint}/todos`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/todos/${todoId}`, JSON.stringify(updatedTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}


export async function updateTodoWithAttachmentURL(
  idToken: string,
  todoId: string
): Promise<void> {
  console.log("begin to update url to db")
  await Axios.put(`${apiEndpoint}/todos/${todoId}/attachment`, {},{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}


export async function deleteTodo(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })

  console.log('getUploadUrl data ', response.data.uploadUrl);
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  console.log('upload file ', uploadUrl);
  await Axios.put(uploadUrl, file)
}
