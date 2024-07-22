import {APIGatewayProxyEvent} from 'aws-lambda';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
import {DynamoDBDocumentClient, PutCommand} from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: APIGatewayProxyEvent) => {
    const tableName = process.env.TABLE_NAME!;

    try {
        await client.send(new PutCommand({
            TableName: tableName,
            Item: {
                'connectionId': event.requestContext.connectionId
            },
        }));
    } catch (error) {
        return {statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(error)};
    }

    return {statusCode: 200, body: 'Connected.'};
};