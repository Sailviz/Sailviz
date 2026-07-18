import { prisma } from "@sailviz/db";
import { getObjectStream } from "@sailviz/minio";
import { parseGPX } from "@sailviz/gpx";
import { writeTrackToInflux } from "@sailviz/influx";
import { computeAnalysis } from "./computeAnalysis";

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
  const stream = await getObjectStream("sailviz", activity.s3Key);
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
    where: { activityId },
    update: analysis,
    create: {
      activityId,
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
