import { implement, ORPCError } from "@orpc/server";
import * as config from "../config";
import { ORPCcontract } from "../contract";
import { randomUUID } from "crypto";
import { Client as MinioClient } from "minio";
import prisma from "@sailviz/db";

const minioClient = new MinioClient({
  endPoint:
    (config.MINIO_ENDPOINT as string) ||
    process.env.MINIO_ENDPOINT ||
    "localhost",
  port: Number((config.MINIO_PORT as any) || process.env.MINIO_PORT || 9000),
  useSSL:
    ((config.MINIO_USE_SSL as any) || process.env.MINIO_USE_SSL) === "true" ||
    false,
  accessKey:
    (config.MINIO_ACCESS_KEY as string) || process.env.MINIO_ACCESS_KEY || "",
  secretKey:
    (config.MINIO_SECRET_KEY as string) || process.env.MINIO_SECRET_KEY || "",
});

const os = implement(ORPCcontract);

export const image_createUploadUrl = os.image.createUploadUrl.handler(
  async ({ input }) => {
    const id = randomUUID();
    const key = `${input.ownerType}/${input.ownerId ?? "global"}/${input.category}/${id}`;

    const presigned = await minioClient.presignedPutObject(
      config.MINIO_BUCKET_SAILVIZ,
      key,
      300, // 5 minutes
    );

    return {
      uploadUrl: presigned,
      id,
      key,
    };
  },
);

export const image_saveMetadata = os.image.saveMetadata.handler(
  async ({ input }) => {
    const newImage = await prisma.image.create({
      data: {
        id: input.id,
        ownerType: input.ownerType,
        s3Key: input.s3key,
        category: input.category,
        ownerId: input.ownerId,
      },
    });

    return newImage;
  },
);

export const image_orgBanner = os.image.orgBanner.handler(async ({ input }) => {
  const image = await prisma.image.findFirst({
    where: {
      ownerType: "organisation",
      ownerId: input.orgId,
      category: "banner",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!image) {
    return null;
  }

  const presignedUrl = await minioClient.presignedGetObject(
    config.MINIO_BUCKET_SAILVIZ,
    image.s3Key,
  );

  return presignedUrl;
});

export const image_getURL = os.image.getURL.handler(async ({ input }) => {
  const presignedUrl = await minioClient.presignedGetObject(
    config.MINIO_BUCKET_SAILVIZ,
    input.s3key,
  );
  return presignedUrl;
});
