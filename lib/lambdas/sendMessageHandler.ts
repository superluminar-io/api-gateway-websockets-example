import {APIGatewayProxyEvent} from 'aws-lambda';
import {ApiGatewayManagementApiClient, PostToConnectionCommand} from '@aws-sdk/client-apigatewaymanagementapi';

export const handler = async (event: APIGatewayProxyEvent) => {
    const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    const apigwManagementApi = new ApiGatewayManagementApiClient({endpoint});

    const {connectionId, message} = JSON.parse(event.body!);

    try {
        await apigwManagementApi.send(new PostToConnectionCommand({ConnectionId: connectionId, Data: message}));
    } catch (error) {
        return {statusCode: 500, body: JSON.stringify(error)};
    }

    return {statusCode: 200, body: 'OK'};
};