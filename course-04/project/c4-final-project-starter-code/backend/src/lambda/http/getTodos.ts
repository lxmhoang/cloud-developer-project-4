import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getTodosForUser } from '../../helpers/todos';
import { getUserId, parseNextKeyParameter, parseLimitParameter, parseOrderByParameter } from '../utils';
import { GetTodoRes } from '../../models/GetTodoRes'

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId: string = getUserId(event);
    let orderby = '';
    let nextKey; // Next key to continue scan operation if necessary
    let limit; // Maximum number of elements to return
    try {
      // Parse query parameters
      nextKey = parseNextKeyParameter(event);
      limit = parseLimitParameter(event) || 10;
      orderby = parseOrderByParameter(event) || '';
    } catch (e) {
      console.log('Failed to parse query parameters: ', e.message)
      return {
        statusCode: 400,
        // headers: {
        //   'Access-Control-Allow-Origin': '*'
        // },
        body: JSON.stringify({
          error: 'Invalid params'
        })
      }
    }

    const response: GetTodoRes = await getTodosForUser(userId, nextKey, limit, orderby);


    return {
      statusCode: 200,
      body: JSON.stringify({
        items: response.items,
        nextKey: response.nextKey
      })
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors(
      {
        origin: "*",
        credentials: true,
      }
    )
  )

