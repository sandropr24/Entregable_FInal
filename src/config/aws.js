require('dotenv').config();

const { S3Client } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { TextractClient } = require('@aws-sdk/client-textract');

const config = {
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT || 'http://localhost:4566',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test'
    }
};

const s3 = new S3Client({
    ...config,
    forcePathStyle: true
});

const dynamodb = DynamoDBDocumentClient.from(
    new DynamoDBClient(config)
);

const textract = new TextractClient(config);

module.exports = {
    s3,
    dynamodb,
    textract
};