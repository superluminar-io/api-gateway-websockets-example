#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {WebsocketsStack} from '../lib/websockets-stack';

const app = new cdk.App();
new WebsocketsStack(app, 'WebsocketsStack');