import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } from './s3-client';
import crypto from 'crypto';

/**
 * Uploads a base64 image or Buffer to Cloudflare R2
 * Returns the public URL of the uploaded file
 */
export async function uploadToR2(
    data: string | Buffer,
    fileName: string,
    contentType: string
): Promise<string> {
    if (!R2_BUCKET_NAME) {
        throw new Error('R2_BUCKET_NAME is not configured');
    }

    let body: Buffer;
    if (typeof data === 'string' && data.startsWith('data:')) {
        // Extract base64 data from data URI
        const base64Data = data.split(',')[1];
        body = Buffer.from(base64Data, 'base64');
    } else if (typeof data === 'string') {
        body = Buffer.from(data, 'base64');
    } else {
        body = data;
    }

    // Generate a unique filename if not provided or to prevent collisions
    const fileExtension = fileName.split('.').pop() || 'png';
    const hashedName = crypto.createHash('md5').update(`${Date.now()}-${fileName}`).digest('hex');
    const safeFileName = `${hashedName}.${fileExtension}`;
    const key = `notes/${safeFileName}`;

    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: contentType,
    });

    await s3Client.send(command);

    // Return the public URL
    if (R2_PUBLIC_DOMAIN) {
        return `${R2_PUBLIC_DOMAIN}/${key}`;
    }

    // Fallback to endpoint-based URL if public domain isn't set
    // Note: R2 endpoints are usually for authenticated S3 access, 
    // high-traffic sites should use a public domain or R2 custom domain.
    return `${process.env.R2_ENDPOINT}/${R2_BUCKET_NAME}/${key}`;
}
