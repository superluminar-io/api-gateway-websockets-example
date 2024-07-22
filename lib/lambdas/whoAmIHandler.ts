import {APIGatewayProxyWebsocketHandlerV2} from 'aws-lambda';
import {ApiGatewayManagementApiClient, PostToConnectionCommand} from '@aws-sdk/client-apigatewaymanagementapi';

export const handler: APIGatewayProxyWebsocketHandlerV2 = async (event) => {
    const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    const apigwManagementApi = new ApiGatewayManagementApiClient({endpoint});

    const {connectionId} = event.requestContext;

    try {
        await apigwManagementApi.send(new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: connectionId
        }));
    } catch (error) {
        return {statusCode: 500, body: JSON.stringify(error)};
    }

    return {statusCode: 200, body: 'OK'};
};