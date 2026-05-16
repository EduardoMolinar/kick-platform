import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib';
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import {
  AttributeType,
  BillingMode,
  Table,
} from 'aws-cdk-lib/aws-dynamodb';
import {
  Architecture,
  Code,
  Function as LambdaFunction,
  LoggingFormat,
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export interface SportsProxyStackProps extends StackProps {
  /** dev / staging / prod — included in resource names. */
  readonly stage: string;
  /** Comma-separated list of allowed CORS origins (no trailing slash). */
  readonly allowedOrigins: string;
  /** API-Football season query param (e.g. '2026'). */
  readonly currentSeason: string;
  /** SSM Parameter Store name holding the API-Football SecureString key. */
  readonly ssmKeyName: string;
}

const BACKEND_DIR = path.join(__dirname, '..', '..', 'backend', 'sports-proxy');

/**
 * Bundle the Python Lambda locally without Docker.
 *
 * All our runtime dependencies (aws-lambda-powertools, boto3, httpx) are pure
 * Python, so pip-installing on the host machine produces wheels that work on
 * Lambda Linux. If we ever add a C-extension dep, switch to Docker bundling
 * (`@aws-cdk/aws-lambda-python-alpha`) or compile against `manylinux`.
 */
function bundleLocally(outputDir: string): boolean {
  try {
    const requirementsTxt = path.join(BACKEND_DIR, 'requirements.txt');
    execSync(
      `python -m pip install -r "${requirementsTxt}" -t "${outputDir}" --quiet --disable-pip-version-check`,
      { stdio: 'inherit' }
    );
    fs.cpSync(
      path.join(BACKEND_DIR, 'src', 'sports_proxy'),
      path.join(outputDir, 'sports_proxy'),
      { recursive: true }
    );
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Local Lambda bundling failed:', err);
    return false;
  }
}

export class SportsProxyStack extends Stack {
  constructor(scope: Construct, id: string, props: SportsProxyStackProps) {
    super(scope, id, props);

    // === DynamoDB cache table ===
    const cacheTable = new Table(this, 'CacheTable', {
      tableName: `pitch-sports-cache-${props.stage}`,
      partitionKey: { name: 'cacheKey', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'expiresAt',
      removalPolicy:
        props.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    // === SSM Parameter (pre-existing — bootstrapped manually) ===
    const apiKeyParam = StringParameter.fromSecureStringParameterAttributes(
      this,
      'ApiKeyParam',
      { parameterName: props.ssmKeyName }
    );

    // === Lambda (Python 3.12) ===
    // Bundled via local `pip install` + source copy. Falls back to Docker if
    // local bundling fails for any reason.
    const code = Code.fromAsset(BACKEND_DIR, {
      bundling: {
        image: Runtime.PYTHON_3_12.bundlingImage,
        command: [
          'bash',
          '-c',
          'pip install -r requirements.txt -t /asset-output && cp -au src/sports_proxy /asset-output/',
        ],
        local: {
          tryBundle(outputDir: string): boolean {
            return bundleLocally(outputDir);
          },
        },
      },
    });

    const handler = new LambdaFunction(this, 'Handler', {
      functionName: `pitch-sports-proxy-${props.stage}`,
      runtime: Runtime.PYTHON_3_12,
      architecture: Architecture.ARM_64,
      code,
      handler: 'sports_proxy.handler.lambda_handler',
      memorySize: 256,
      timeout: Duration.seconds(8),
      loggingFormat: LoggingFormat.JSON,
      logRetention: RetentionDays.TWO_WEEKS,
      environment: {
        CACHE_TABLE_NAME: cacheTable.tableName,
        SSM_KEY_NAME: props.ssmKeyName,
        CURRENT_SEASON: props.currentSeason,
        ALLOWED_ORIGINS: props.allowedOrigins,
        POWERTOOLS_SERVICE_NAME: 'sports-proxy',
        POWERTOOLS_LOG_LEVEL: 'INFO',
      },
    });

    cacheTable.grantReadWriteData(handler);
    apiKeyParam.grantRead(handler);

    // === API Gateway HTTP API ===
    const api = new HttpApi(this, 'Api', {
      apiName: `pitch-sports-proxy-${props.stage}`,
      corsPreflight: {
        allowOrigins: props.allowedOrigins.split(',').map((s) => s.trim()),
        allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.OPTIONS],
        allowHeaders: ['content-type'],
        maxAge: Duration.minutes(10),
      },
    });

    api.addRoutes({
      path: '/v1/{proxy+}',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration('LambdaIntegration', handler),
    });

    // === Outputs ===
    new CfnOutput(this, 'apiUrl', {
      value: api.apiEndpoint,
      description: 'Sports-proxy API Gateway endpoint',
      exportName: `pitch-sports-proxy-api-url-${props.stage}`,
    });
    new CfnOutput(this, 'cacheTableName', { value: cacheTable.tableName });
  }
}
