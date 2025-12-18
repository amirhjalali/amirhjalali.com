import { S3Client } from '@aws-sdk/client-s3';

const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!r2Endpoint || !r2AccessKeyId || !r2SecretAccessKey) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('⚠️ Cloudflare R2 credentials missing. Image uploads will fail.');
    }
}

export const s3Client = new S3Client({
    region: 'auto',
    endpoint: r2Endpoint,
    credentials: {
        accessKeyId: r2AccessKeyId || '',
        secretAccessKey: r2SecretAccessKey || '',
    },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN;
