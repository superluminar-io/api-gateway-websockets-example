import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {AttributeType, TableV2} from 'aws-cdk-lib/aws-dynamodb';
import {WebSocketApi, WebSocketStage} from 'aws-cdk-lib/aws-apigatewayv2';
import {WebSocketLambdaIntegration} from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {PolicyStatement} from 'aws-cdk-lib/aws-iam';
import {CfnOutput} from 'aws-cdk-lib';

export class WebsocketsStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new TableV2(this, 'WebsocketConnections', {
            partitionKey: {name: 'connectionId', type: AttributeType.STRING},
        });

        const connectHandler = new NodejsFunction(this, 'ConnectHandler', {
            entry: 'lib/lambdas/connectHandler.ts',
            runtime: Runtime.NODEJS_20_X,
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        const disconnectHandler = new NodejsFunction(this, 'DisconnectHandler', {
            entry: 'lib/lambdas/disconnectHandler.ts',
            runtime: Runtime.NODEJS_20_X,
            environment: {
                TABLE_NAME: table.tableName,
            },
        });

        table.grantReadWriteData(connectHandler);
        table.grantReadWriteData(disconnectHandler);

        const webSocketApi = new WebSocketApi(this, 'WebsocketApi', {
            connectRouteOptions: {integration: new WebSocketLambdaIntegration('ConnectHandlerIntegration', connectHandler)},
            disconnectRouteOptions: {integration: new WebSocketLambdaIntegration('DisconnectHandlerIntegration', disconnectHandler)},
        });

        const apiStage = new WebSocketStage(this, 'DevStage', {
            webSocketApi,
            stageName: 'dev',
            autoDeploy: true,
        });

        const connectionsArn = this.formatArn({
            service: 'execute-api',
            resourceName: `${apiStage.stageName}/POST/*`,
            resource: webSocketApi.apiId,
        });

        const sendMessageHandler = new NodejsFunction(this, 'SendMessageHandler', {
            entry: 'lib/lambdas/sendMessageHandler.ts',
            runtime: Runtime.NODEJS_20_X,
        });

        webSocketApi.addRoute('sendMessage', {
            integration: new WebSocketLambdaIntegration('SendMessageHandlerIntegration', sendMessageHandler),
        });

        sendMessageHandler.addToRolePolicy(
            new PolicyStatement({actions: ['execute-api:ManageConnections'], resources: [connectionsArn]})
        );

        const whoAmIHandler = new NodejsFunction(this, 'WhoAmIHandler', {
            entry: 'lib/lambdas/whoAmIHandler.ts',
            runtime: Runtime.NODEJS_20_X,
        });

        webSocketApi.addRoute('whoAmI', {
            integration: new WebSocketLambdaIntegration('WhoAmIHandlerIntegration', whoAmIHandler),
        });

        whoAmIHandler.addToRolePolicy(
            new PolicyStatement({actions: ['execute-api:ManageConnections'], resources: [connectionsArn]})
        );

        new CfnOutput(this, 'WebSocketUrl', {
            value: `${webSocketApi.apiEndpoint}/${apiStage.stageName}`
        })
    }
}
