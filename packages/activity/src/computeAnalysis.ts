import * as Types from "@sailviz/types";

export interface ActivityAnalysis {
  distance: number;
  maxSpeed: number;
  segments: any;
  laps: any;
}

export function computeAnalysis(
  track: Types.Position[],
  courseBuoys: Types.CourseBuoyType[],
): ActivityAnalysis {
  if (track.length < 2) {
    return {
      distance: 0,
      maxSpeed: 0,
      segments: {},
      laps: {},
    };
  }

  let distance = 0;
  let maxSpeed = 0;
  let laps = {};
  let segments = {};

  const result = calculateDistanceAndSpeed(track);
  distance = result.distance;
  maxSpeed = result.maxSpeed;

  laps = detectLaps(track, courseBuoys);

  return {
    distance,
    maxSpeed,
    segments,
    laps,
  };
}

function calculateDistanceAndSpeed(points: Types.Position[]): {
  distance: number;
  maxSpeed: number;
} {
  let distance = 0;
  let maxSpeed = 0;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];

    const dt = (b.timestamp - a.timestamp) / 1000;
    if (dt <= 0) continue;

    const d = haversine(a.lat, a.lon, b.lat, b.lon);
    distance += d;

    const speed = d / dt;
    maxSpeed = Math.max(maxSpeed, speed);
  }
  return { distance, maxSpeed };
}

function detectLaps(
  track: Types.Position[],
  courseBuoys: Types.CourseBuoyType[],
): any {
  //we should check if the race has any marks specified
  const passes: Record<
    string,
    Array<{ time: number; direction?: string }>
  > = {};
  if (courseBuoys.length > 1) {
    // If there are course buoys, we can detect laps based on the waypoints
    for (const Buoy of courseBuoys) {
      if (Buoy.buoy.isStartLine == false) {
        // course mark.
        // log time that the track
        const roundings = detectCircleWaypointReached(track, Buoy.buoy);
        console.log(
          `Participant reached waypoint ${Buoy.buoy.name} at times:`,
          roundings,
        );
        passes[Buoy.id] = roundings;
      }
    }
    // start line crossings
    const IDM = courseBuoys.find((b) => b.buoy.name == "IDM");
    const ODM = courseBuoys.find((b) => b.buoy.name == "ODM");
    if (IDM && ODM) {
      const crossings = detectLineWaypointReached(track, IDM.buoy, ODM.buoy);
      // filter crossings to only include those that are in the correct direction
      const direction =
        sideOfLine(
          track[0], // we assume that the first point is downwind of the start line.
          IDM.buoy,
          ODM.buoy,
        ) >= 0
          ? "1→-1"
          : "-1→1";

      const filteredCrossings = crossings.filter(
        (c) => c.direction === direction,
      );
      console.log(
        `Participant crossed the start line at times:`,
        filteredCrossings,
      );
      passes[IDM.id] = filteredCrossings;
    }
    console.log(passes);
    const merged = Object.entries(passes)
      .flatMap(([waypoint, entries]) =>
        entries.map((e) => ({ waypoint, ...e })),
      )
      .sort((a, b) => a.time - b.time);

    console.log(merged);

    if (IDM && ODM) {
      // calculate lap times by taking the difference between each time they passed the first waypoint
      const lapTimes = passes[IDM.id]
        ?.map((entry, index, array) => {
          if (index === 0) {
            return null;
          }
          return entry.time - array[index - 1].time;
        })
        .filter((t) => t !== null);
      console.log(`Participant lap times:`, lapTimes);
      // calculate total time by taking the difference between the first time they passed the first waypoint and the last time they passed the first waypoint
    }
  } else {
    // If there are no course buoys, we have to try and detect laps based on the track points themselves.
    // This is a complex problem and may require advanced algorithms to detect loops in the track. For now, we will return an empty object.
  }
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

function heading(a: Types.Position, b: Types.Position): number {
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

function detectCircleWaypointReached(
  positions: Types.Position[],
  waypoint: Types.BuoyType,
) {
  const roundings = [];
  let inside = false;

  for (const p of positions) {
    const d = haversine(p.lat, p.lon, waypoint.lat, waypoint.lon);
    const nowInside = d < 10; // 10 meters radius for rounding

    if (!inside && nowInside) {
      roundings.push({ time: p.timestamp });
    }

    inside = nowInside;
  }

  return roundings;
}

function sideOfLine(
  p: Types.Position,
  IDM: Types.BuoyType,
  ODM: Types.BuoyType,
): number {
  return (
    (ODM.lon - IDM.lon) * (p.lat - IDM.lat) -
    (ODM.lat - IDM.lat) * (p.lon - IDM.lon)
  );
}

function detectLineWaypointReached(
  positions: Types.Position[],
  IDM: Types.BuoyType,
  ODM: Types.BuoyType,
) {
  const crossings = [];
  let prevSign = null;

  for (const p of positions) {
    const s = sideOfLine(p, IDM, ODM);
    const sign = s >= 0 ? 1 : -1;

    if (prevSign !== null && sign !== prevSign) {
      crossings.push({ time: p.timestamp, direction: `${prevSign}→${sign}` });
    }

    prevSign = sign;
  }

  return crossings;
}
