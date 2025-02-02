import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

import { TodoItem } from '../models/TodoItem';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { createLogger } from '../utils/logger';
import { GetTodoRes } from '../models/GetTodoRes';
import { encodeNextKey } from '../lambda/utils';

const logger = createLogger('TodoAccess');

const XAWS = AWSXRay.captureAWS(AWS);

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoTable = process.env.TODOS_TABLE,
    private readonly attachmentBucket = process.env.ATTACHMENT_S3_BUCKET) {
  }

  async getTodosForUser(userId: string): Promise<TodoItem[]> {

    const result = await this.docClient.query({
      TableName: this.todoTable,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId
      },
      
    }).promise()
    const items = result.Items

    return items as TodoItem[]
  }

  async getTodos(userId: string, nextKey: any, limit: number, orderBy: string): Promise<GetTodoRes> {

        // Order by created date by default
    let indexName = process.env.TODOS_CREATED_AT_INDEX;
    if (!!orderBy && orderBy === "dueDate") {
            indexName = process.env.TODOS_DUE_DATE_INDEX; 
    }

    const result = await this.docClient.query({
            TableName: this.todoTable,
            IndexName: indexName,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            Limit: limit,
            ScanIndexForward: false,
            ExclusiveStartKey: nextKey
        }
    ).promise();

    return { 
      items: result.Items as TodoItem[],
      nextKey: encodeNextKey(result.LastEvaluatedKey)
  } as GetTodoRes;
}

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info(`begin to create new item ${JSON.stringify(todo)}`)
    await this.docClient.put({
      TableName: this.todoTable,
      Item: todo
    }).promise()

    return todo;
  }

  async deleteTodo(userId: string, id: string): Promise<void> {
    logger.info(`begin to delete item with id  ${id}`)
    await this.docClient.delete({
      TableName: this.todoTable,
      Key: {
        todoId: id,
        userId: userId    
      }
    }).promise();

    return;
  }

  async updateTodo(userId: string, id: string, todo: UpdateTodoRequest): Promise<void> {
    logger.info('Starting update todo: ', todo);
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        todoId: id,
        userId: userId    
      },
      UpdateExpression: 'set #name = :updateName, #done = :doneStatus, #dueDate = :updateDueDate',
      ExpressionAttributeNames: { '#name': 'name', '#done': 'done', '#dueDate': 'dueDate' },
      ExpressionAttributeValues: {
        ':updateName': todo.name,
        ':doneStatus': todo.done,
        ':updateDueDate': todo.dueDate,
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();

    return;
  }
  
  async updateTodoAttachment(userId: string, id: string): Promise<void> {
    await this.docClient.update({
      TableName: this.todoTable,
      Key: {
        todoId: id,
        userId: userId                
    },    
      UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
      ExpressionAttributeNames: { '#attachmentUrl': 'attachmentUrl' },
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${this.attachmentBucket}.s3.amazonaws.com/${id}`
      },
      ReturnValues: "UPDATED_NEW"
    }).promise();
  }

  async todoExists(id: string): Promise<boolean> {
    const result = await this.docClient
      .get({
        TableName: this.todoTable,
        Key: {
          id
        }
      })
      .promise()
  
    return !!result.Item
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}

