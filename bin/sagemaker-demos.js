#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { SagemakerStudioStack } = require('../lib/sagemaker-studio-stack');

const app = new cdk.App();
new SagemakerStudioStack(app, 'SagemakerStudioStack', {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
