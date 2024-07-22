# Websockets example (Chat):

## Getting started:
#### Install:
```shell
npm i
```

#### Deploy:
```shell
npx cdk deploy
```
---

## How to test it?

#### Prerequisite
 - Two terminals opened
 - Websocket-CLI installed (e.g. Websocat)

#### Connect to Websocket:
```shell
websocat <StackOutput.WebSocketUrl>
```

#### Log connection ID:
_in one of the terminals enter:_
```shell
{"action":"whoAmI"}
```
_this should return something like:_ `bUPgldy-FiACE_Q=`

#### Send a message:
_in the other terminal enter:_
```shell
{"action":"sendMessage","connectionId":"<ID-FROM-ABOVE>","message":"Hello!"}
```
_If everything worked successfully you should now see your message in the first terminal._


---

## How does this solution work?

- When you establish a websocket connection, the lambda `connectHandler` will be executed.
  - This is saving the connectionId into a dynamodb table, which could be used for different purposes like broadcasting.
- When you close the websocket connection, the lambda `disconnectHandler` will be executed.
    - This is removes the connectionId from a dynamodb table.
- When you have a connection open and post a message with an action property, it will route the message to the configured lamdba.
  - See Diagram

![diagram.png](docs%2Fdiagram.png)

## How do Websockets with Lambda work?
First of all, Lambdas are not constantly running!  
When you send a message into the opened connection API-Gateway tries to route the message to the corresponding lambda, based on the `action` argument.
When someone tries to send a message to a open connection, you need the use the [PostToConnection-Command](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/apigatewaymanagementapi/command/PostToConnectionCommand/).