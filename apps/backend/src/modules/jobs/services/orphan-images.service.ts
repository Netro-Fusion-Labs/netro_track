import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3';
import pino from 'pino';
import { prisma } from '../../../shared/config/prisma';

const logger = pino({ name: 'orphan-images' });

function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * Remove PENDING File rows older than 7 days that were never linked as a company logo
 * or user profile picture, and delete corresponding R2 objects when configured.
 */
export async function runOrphanImageCleanup(now: Date = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const bucket = process.env.R2_BUCKET_NAME;
  const client = getR2Client();

  const orphans = await prisma.file.findMany({
    where: {
      status: 'PENDING',
      companyLogo: null,
      userProfile: null,
      createdAt: { lt: cutoff },
    },
    take: 200,
  });

  let cleaned = 0;
  for (const file of orphans) {
    if (client && bucket) {
      try {
        await client.send(
          new DeleteObjectCommand({
            Bucket: file.bucket || bucket,
            Key: file.objectKey,
          }),
        );
      } catch (err) {
        logger.warn({ err, fileId: file.id }, 'Failed to delete orphan R2 object');
        continue;
      }
    }

    await prisma.file.delete({ where: { id: file.id } });
    cleaned += 1;
  }

  logger.info({ cleaned }, 'Orphan image cleanup complete');
  return cleaned;
}
