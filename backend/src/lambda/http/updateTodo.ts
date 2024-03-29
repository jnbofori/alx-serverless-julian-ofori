import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getUserId } from '../utils'
import { updateTodo, todoExists, timeInMs, logMetric } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('TodosAccess')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.log('Updating item', { event })
  const startTime = timeInMs()

  const todoId = event.pathParameters.todoId
  const userId = getUserId(event);

  const parsedBody = JSON.parse(event.body)

  const validTodoId = await todoExists(todoId, userId)

  if (!validTodoId) {
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Todo item does not exist'
      })
    }
  }

  const todo = await updateTodo(parsedBody, event, todoId)

  const endTime = timeInMs()
  const totalTime = endTime - startTime
  await logMetric(totalTime, "updateTodo");

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items: todo
    })
  }
}
