import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import invariant from "tiny-invariant";

const bucket = process.env.S3_BUCKET_NAME;
const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
const region = process.env.AWS_REGION ?? "auto";
const endpoint = process.env.AWS_ENDPOINT_URL_S3 ?? process.env.S3_ENDPOINT;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region,
  endpoint,
  credentials:
    accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined,
  forcePathStyle: Boolean(endpoint),
});

const getBaseUrl = () => {
  invariant(publicBaseUrl, "S3_PUBLIC_BASE_URL is required");
  return publicBaseUrl.replace(/\/$/, "");
};

export const getPublicUrl = (key: string) => {
  return `${getBaseUrl()}/${key}`;
};

export const createPresignedUploadUrl = async ({
  key,
  contentType,
}: {
  key: string;
  contentType: string;
}) => {
  invariant(bucket, "S3_BUCKET_NAME is required");
  invariant(accessKeyId, "AWS_ACCESS_KEY_ID is required");
  invariant(secretAccessKey, "AWS_SECRET_ACCESS_KEY is required");

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
  const publicUrl = getPublicUrl(key);
  return { uploadUrl, publicUrl };
};
