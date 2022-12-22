import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger';

const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    // TODO: Implement creating a new TODO item
    const userId: string = getUserId(event);
    logger.info(`Starting create new todo with event header : ${event.headers} body :  ! ${event.body} and user ID : ${userId}`);
    
    const todo = await createTodo(newTodo, userId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: todo
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
