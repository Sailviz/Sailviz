import { implement, ORPCError } from "@orpc/server";
import * as config from "../config";
import { ORPCcontract } from "../contract";
import { randomUUID } from "crypto";
import { Client as MinioClient } from "minio";
import prisma from "@sailviz/db";
import { XMLParser } from "fast-xml-parser";
import { Point } from "@influxdata/influxdb-client";
import { influxQuery, influxWrite } from "./../influx";
import * as Types from "@sailviz/types";
import { analysisQueue } from "@sailviz/queue";

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

export const activity_createUploadUrl = os.activity.createUploadUrl.handler(
  async ({ input }) => {
    const id = randomUUID();
    const key = `activity/${input.userId}/${id}`;

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

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

export const activity_saveMetadata = os.activity.saveMetadata.handler(
  async ({ input }) => {
    const gpxStream = await minioClient.getObject(
      config.MINIO_BUCKET_SAILVIZ,
      input.s3key,
    );

    const gpxString = await streamToString(gpxStream);

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
    });
    const jsonObj = parser.parse(gpxString);
    const trackPoints = jsonObj.gpx.trk.trkseg.trkpt;
    const rows = trackPoints.map((pt: any) => ({
      timestamp: Math.floor(new Date(pt.time).getTime()),
      lat: parseFloat(pt.lat),
      lon: parseFloat(pt.lon),
    }));

    for (const row of rows) {
      const timestamp_ms = new Date(row.timestamp);

      const point = new Point("position")
        .tag("activityId", input.id)
        .stringField("pos", `{"lat":${row.lat},"lon":${row.lon}}`)
        .timestamp(timestamp_ms);
      influxWrite.writePoint(point);
    }
    await influxWrite.flush();

    const startTime = rows[0].timestamp / 1000;
    const endTime = rows[rows.length - 1].timestamp / 1000;

    console.log("startTime", startTime, "endTime", endTime);

    const newActivity = await prisma.activity.create({
      data: {
        id: input.id,
        s3Key: input.s3key,
        createdAt: new Date(),
        startTime: startTime,
        endTime: endTime,
        type: "Sail",
      },
    });

    await analysisQueue.add("analyseActivity", {
      activityId: newActivity.id,
    });

    return newActivity;
  },
);

export const activity_getURL = os.activity.getURL.handler(async ({ input }) => {
  const presignedUrl = await minioClient.presignedGetObject(
    config.MINIO_BUCKET_SAILVIZ,
    input.s3key,
  );
  return presignedUrl;
});

export const activity_find = os.activity.find.handler(async ({ input }) => {
  const activity = await prisma.activity.findUnique({
    where: {
      id: input.activityId,
    },
  });
  if (!activity) {
    throw new ORPCError("NOT_FOUND");
  }
  return activity;
});

export const activity_positions = os.activity.positions.handler(
  async ({ input }) => {
    const activity = await prisma.activity.findUnique({
      where: {
        id: input.activityId,
      },
    });
    if (!activity) {
      throw new ORPCError("NOT_FOUND");
    }

    let fluxQuery = `from(bucket: "${config.INFLUXDB_BUCKET}")
                  |> range(start: ${activity.startTime}, stop: ${activity.endTime})
                  |> filter(fn: (r) => r["activityId"] == "${activity.id}")
                  |> filter(fn: (r) => r["_field"] == "pos")`;

    const positions: Types.Position[] = [];
    await new Promise<void>((resolve, reject) => {
      influxQuery.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const value = JSON.parse(o._value);
          if (value.lat === 0 && value.lon === 0) return;
          const time = new Date(o._time).getTime();
          positions.push({
            lat: value.lat,
            lon: value.lon,
            timestamp: time,
          });
        },
        error(error) {
          console.log("Error querying InfluxDB:", error);
          reject(error);
        },
        complete() {
          resolve();
        },
      });
    });
    return positions;
  },
);

export const activity_linkToResult = os.activity.linkToResult.handler(
  async ({ input }) => {
    const activity = await prisma.activity.findUnique({
      where: {
        id: input.activityId,
      },
    });
    if (!activity) {
      throw new ORPCError("NOT_FOUND");
    }
    const result = await prisma.result.findUnique({
      where: {
        id: input.resultId,
      },
    });
    if (!result) {
      throw new ORPCError("NOT_FOUND");
    }
    await prisma.activity.update({
      where: {
        id: input.activityId,
      },
      data: {
        result: {
          connect: {
            id: input.resultId,
          },
        },
      },
    });
    return {
      activityId: input.activityId,
      resultId: input.resultId,
    };
  },
);
