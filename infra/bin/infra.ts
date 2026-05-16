#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SportsProxyStack } from '../lib/sports-proxy-stack';

const app = new cdk.App();

// Configuration via CDK context or env vars. Sensible dev defaults; override in
// CI / per-environment.
const stage = app.node.tryGetContext('stage') ?? process.env.STAGE ?? 'dev';
const region = process.env.CDK_DEFAULT_REGION ?? 'eu-west-1';
const account = process.env.CDK_DEFAULT_ACCOUNT;

// Comma-separated allowlist of frontend origins (CloudFront + local dev).
// Override via -c allowedOrigins=https://example.com,http://localhost:4200.
const allowedOrigins =
  (app.node.tryGetContext('allowedOrigins') as string | undefined) ??
  process.env.ALLOWED_ORIGINS ??
  'http://localhost:4200';

const currentSeason =
  (app.node.tryGetContext('currentSeason') as string | undefined) ??
  process.env.CURRENT_SEASON ??
  '2026';

const ssmKeyName =
  (app.node.tryGetContext('ssmKeyName') as string | undefined) ??
  process.env.SSM_KEY_NAME ??
  '/pitch/sports/api-football-key';

new SportsProxyStack(app, `SportsProxyStack-${stage}`, {
  env: { account, region },
  stage,
  allowedOrigins,
  currentSeason,
  ssmKeyName,
  description: 'Pitch sports-proxy Lambda + API Gateway + DynamoDB cache',
});
