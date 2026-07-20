export interface ActivityAnalysis {
  distance: number;
  maxSpeed: number;
  avgSpeed: number;
  vmgUpwind: number | null;
  vmgDownwind: number | null;
  tackCount: number;
  gybeCount: number;
  durationSeconds: number;
}
export interface TrackPoint {
  lat: number;
  lon: number;
  time: Date;
}

export interface Track {
  points: TrackPoint[];
}

export function computeAnalysis(track: Track): ActivityAnalysis {
  if (track.points.length < 2) {
    return {
      distance: 0,
      maxSpeed: 0,
      avgSpeed: 0,
      vmgUpwind: null,
      vmgDownwind: null,
      tackCount: 0,
      gybeCount: 0,
      durationSeconds: 0,
    };
  }

  let distance = 0;
  let maxSpeed = 0;
  let sumSpeed = 0;
  let tackCount = 0;
  let gybeCount = 0;

  // VMG buckets
  let upwindVmgSamples: number[] = [];
  let downwindVmgSamples: number[] = [];

  // Detect tacks/gybes by heading change
  let lastHeading = heading(track.points[0], track.points[1]);

  for (let i = 1; i < track.points.length; i++) {
    const a = track.points[i - 1];
    const b = track.points[i];

    const dt = (b.time.getTime() - a.time.getTime()) / 1000;
    if (dt <= 0) continue;

    const d = haversine(a.lat, a.lon, b.lat, b.lon);
    distance += d;

    const speed = d / dt;
    sumSpeed += speed;
    maxSpeed = Math.max(maxSpeed, speed);

    const h = heading(a, b);
    const delta = angleDelta(lastHeading, h);

    // Tack detection: crossing the wind direction (approx 45° change)
    if (Math.abs(delta) > 45 && Math.abs(delta) < 135) {
      tackCount++;
    }

    // Gybe detection: crossing dead downwind (approx 135° change)
    if (Math.abs(delta) >= 135) {
      gybeCount++;
    }

    lastHeading = h;

    // VMG calculation (requires wind direction later)
    // For now, assume wind is 0° (north) — replace later with real wind
    const windDir = 0;
    const vmg = speed * Math.cos(degToRad(angleDelta(h, windDir)));

    if (vmg > 0) {
      upwindVmgSamples.push(vmg);
    } else {
      downwindVmgSamples.push(Math.abs(vmg));
    }
  }

  const durationSeconds =
    (track.points.at(-1)!.time.getTime() - track.points[0].time.getTime()) /
    1000;

  return {
    distance,
    maxSpeed,
    avgSpeed: sumSpeed / track.points.length,
    vmgUpwind: upwindVmgSamples.length ? average(upwindVmgSamples) : null,
    vmgDownwind: downwindVmgSamples.length ? average(downwindVmgSamples) : null,
    tackCount,
    gybeCount,
    durationSeconds,
  };
}

//
// Utility functions
//

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // meters
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function heading(a: TrackPoint, b: TrackPoint): number {
  const dLon = degToRad(b.lon - a.lon);
  const lat1 = degToRad(a.lat);
  const lat2 = degToRad(b.lat);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const brng = radToDeg(Math.atan2(y, x));
  return (brng + 360) % 360;
}

function angleDelta(a: number, b: number): number {
  let d = ((b - a + 540) % 360) - 180;
  return d;
}
