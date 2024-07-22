import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocumentClient, DeleteCommand} from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent) => {
    const tableName = process.env.TABLE_NAME!;

    try {
        await client.send(new DeleteCommand({
            TableName: tableName,
            Key: {
                'connectionId': event.requestContext.connectionId
            },
        }));
    } catch (error) {
        return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(error)};
    }

    return { statusCode: 200, body: 'Disconnected.' };
};