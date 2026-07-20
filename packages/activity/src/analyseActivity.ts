import prisma from "@sailviz/db";
import { Client as MinioClient } from "minio";
import { computeAnalysis } from "./computeAnalysis";
import * as config from "./config";
import { XMLParser } from "fast-xml-parser";

const minioClient = new MinioClient({
  endPoint: config.MINIO_ENDPOINT as string,
  useSSL: true,
  accessKey:
    (config.MINIO_ACCESS_KEY as string) || process.env.MINIO_ACCESS_KEY || "",
  secretKey:
    (config.MINIO_SECRET_KEY as string) || process.env.MINIO_SECRET_KEY || "",
});

export interface TrackPoint {
  lat: number;
  lon: number;
  time: Date;
}

export interface Track {
  points: TrackPoint[];
}

async function parseGPX(buffer: Buffer): Promise<Track> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  });
  const xml = buffer.toString("utf8");
  const gpx = parser.parse(xml);

  const points: TrackPoint[] = [];

  const trks = gpx.gpx?.trk ?? [];
  for (const trk of trks) {
    const segs = trk.trkseg ?? [];
    for (const seg of segs) {
      const trkpts = seg.trkpt ?? [];
      for (const p of trkpts) {
        const lat = parseFloat(p.$.lat);
        const lon = parseFloat(p.$.lon);
        const timeStr = p.time?.[0];

        if (!timeStr) continue;

        const time = new Date(timeStr);

        points.push({ lat, lon, time });
      }
    }
  }

  // sort by time just in case
  points.sort((a, b) => a.time.getTime() - b.time.getTime());

  return { points };
}

export async function analyseActivity(activityId: string) {
  console.log(`[analysis] Starting analysis for ${activityId}`);

  // Load activity metadata
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
  });

  if (!activity) {
    throw new Error(`Activity ${activityId} not found`);
  }

  if (!activity.s3Key) {
    throw new Error(`Activity ${activityId} has no s3Key`);
  }

  // Download GPX file from MinIO
  console.log(`[analysis] Downloading GPX from MinIO: ${activity.s3Key}`);
  const stream = await minioClient.getObject("sailviz", activity.s3Key);
  const gpxBuffer = await streamToBuffer(stream);

  // Parse GPX
  console.log(`[analysis] Parsing GPX…`);
  const track = await parseGPX(gpxBuffer);

  // Compute analysis (VMG, tacks, gybes, segments, stats)
  console.log(`[analysis] Computing analysis…`);
  const analysis = computeAnalysis(track);

  // Save ActivityAnalysis to DB
  console.log(`[analysis] Saving analysis to DB…`);
  await prisma.activityAnalysis.upsert({
    where: { id: activityId },
    update: analysis,
    create: {
      id: activityId,
      ...analysis,
    },
  });

  console.log(`[analysis] Completed analysis for ${activityId}`);
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
