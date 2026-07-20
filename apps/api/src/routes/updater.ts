import express from "express";
import { Readable } from "stream";
import { createHash, createHmac } from "crypto";
import * as config from "../config";

type UpdaterResponse = {
  version: string;
  url: string;
  signature: string;
  pub_date: string;
};

type ReleaseArtifact = {
  keyBase: string;
  version?: string;
  lastModified?: Date;
  assetKey?: string;
  signatureKey?: string;
};

type S3Object = {
  key: string;
  lastModified: Date;
};

const updaterBucket = config.MINIO_BUCKET_NAME;
const updaterBaseUrl = buildMinioBaseUrl(config.MINIO_ENDPOINT, true);
const updaterAccessKey = config.MINIO_ACCESS_KEY;
const updaterSecretKey = config.MINIO_SECRET_KEY;
const updaterRegion = "us-east-1";

export function registerUpdaterRoutes(app: express.Express) {
  app.get("/desktop-update/download", async (req, res) => {
    if (
      !updaterBucket ||
      !updaterBaseUrl ||
      !updaterAccessKey ||
      !updaterSecretKey
    ) {
      res.status(500).json({
        error:
          "MinIO settings are missing. Set MINIO_ENDPOINT, MINIO_PORT, MINIO_BUCKET_NAME, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY.",
      });
      return;
    }

    const key = typeof req.query.key === "string" ? req.query.key : null;
    if (!key) {
      res.status(400).json({ error: "Missing key query parameter" });
      return;
    }

    try {
      const response = await fetchMinioResponse(
        {
          bucket: updaterBucket,
          endpoint: updaterBaseUrl,
          accessKey: updaterAccessKey,
          secretKey: updaterSecretKey,
          region: updaterRegion,
        },
        key,
        {},
      );

      if (!response.ok || !response.body) {
        throw new Error(
          `Failed to download object ${key}: ${response.status} ${response.statusText}`,
        );
      }

      res.status(response.status);
      forwardResponseHeaders(response, res);
      Readable.fromWeb(response.body as any).pipe(res);
    } catch (error) {
      res.status(500).json({
        error: "Failed to proxy updater artifact from S3",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  app.get("/desktop-update/:currentVersion", async (req, res) => {
    if (
      !updaterBucket ||
      !updaterBaseUrl ||
      !updaterAccessKey ||
      !updaterSecretKey
    ) {
      res.status(500).json({
        error:
          "MinIO settings are missing. Set MINIO_ENDPOINT, MINIO_PORT, MINIO_BUCKET_NAME, MINIO_ACCESS_KEY, and MINIO_SECRET_KEY.",
      });
      return;
    }

    const publicBaseUrl = getPublicBaseUrl(req);
    if (!publicBaseUrl) {
      res.status(500).json({
        error: "Unable to determine public base URL for updater download",
      });
      return;
    }

    try {
      const update = await buildUpdateResponseFromS3({
        bucket: updaterBucket,
        endpoint: updaterBaseUrl,
        accessKey: updaterAccessKey,
        secretKey: updaterSecretKey,
        region: updaterRegion,
        publicBaseUrl,
      });

      if (!update) {
        res.status(404).json({
          error: "No updater artifacts were found in S3",
        });
        return;
      }
      console.log(
        `Latest update version: ${update.version}, client version: ${req.params.currentVersion}`,
      );

      if (compareVersion(update.version, req.params.currentVersion) <= 0) {
        res.status(204).send();
        return;
      }

      res.json(update);
    } catch (error) {
      res.status(500).json({
        error: "Failed to generate updater response from S3",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

async function buildUpdateResponseFromS3(options: {
  bucket: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
  publicBaseUrl: string;
}): Promise<UpdaterResponse | null> {
  const objects = await listAllObjects(options);
  const releases = groupObjectsByRelease(objects);
  const latestRelease = getLatestRelease(releases);

  if (!latestRelease?.assetKey || !latestRelease.signatureKey) {
    return null;
  }

  if (!latestRelease.version) {
    return null;
  }

  const signature = await fetchSignatureValue(
    options,
    latestRelease.signatureKey,
  );
  const pubDate =
    latestRelease.lastModified?.toISOString() ?? new Date().toISOString();

  return {
    version: latestRelease.version,
    url: buildPublicArtifactUrl(options.publicBaseUrl, latestRelease.assetKey),
    signature,
    pub_date: pubDate,
  };
}

async function listAllObjects(options: {
  bucket: string;
  endpoint: string;
  accessKey: string;
  secretKey: string;
  region: string;
}) {
  const objects: S3Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await fetchMinioResponse(options, "", {
      "list-type": "2",
      ...(continuationToken ? { "continuation-token": continuationToken } : {}),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to list objects from ${options.bucket}: ${response.status} ${response.statusText}`,
      );
    }

    const xml = await response.text();
    objects.push(...parseS3ListObjects(xml));
    continuationToken = extractTag(xml, "NextContinuationToken") ?? undefined;
  } while (continuationToken);

  return objects;
}

function groupObjectsByRelease(objects: S3Object[]) {
  const releases = new Map<string, ReleaseArtifact>();

  for (const object of objects) {
    const fileName = object.key.split("/").filter(Boolean).pop();
    if (!fileName) {
      continue;
    }

    if (!fileName.endsWith(".exe") && !fileName.endsWith(".exe.sig")) {
      continue;
    }

    const keyBase = fileName.endsWith(".sig")
      ? fileName.slice(0, -4)
      : fileName;
    const release = releases.get(keyBase) ?? {
      keyBase,
      version: extractVersionFromArtifactKey(keyBase),
    };

    if (fileName.endsWith(".sig")) {
      release.signatureKey = object.key;
    } else {
      release.assetKey = object.key;
      release.lastModified = maxDate(release.lastModified, object.lastModified);
    }

    releases.set(keyBase, release);
  }

  return releases;
}

function getLatestRelease(releases: Map<string, ReleaseArtifact>) {
  let latest: ReleaseArtifact | null = null;

  for (const release of releases.values()) {
    if (!latest) {
      latest = release;
      continue;
    }

    const releaseVersion = release.version ?? "";
    const latestVersion = latest.version ?? "";

    if (releaseVersion && latestVersion) {
      const versionComparison = compareVersion(releaseVersion, latestVersion);
      if (versionComparison > 0) {
        latest = release;
        continue;
      }

      if (versionComparison < 0) {
        continue;
      }
    }

    const releaseTime = release.lastModified?.getTime() ?? 0;
    const latestTime = latest.lastModified?.getTime() ?? 0;
    if (releaseTime > latestTime) {
      latest = release;
    }
  }

  return latest;
}

function extractVersionFromArtifactKey(keyBase: string) {
  const match = keyBase.match(
    /(?:^|[._-])(v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?:[._-]|$)/,
  );

  return match?.[1]?.replace(/^v/i, "") ?? null;
}

function compareVersion(left: string, right: string) {
  const normalizedLeft = parseVersionParts(left);
  const normalizedRight = parseVersionParts(right);

  for (let index = 0; index < 3; index += 1) {
    const difference =
      normalizedLeft.numeric[index] - normalizedRight.numeric[index];
    if (difference !== 0) {
      return difference;
    }
  }

  if (!normalizedLeft.prerelease && normalizedRight.prerelease) {
    return 1;
  }

  if (normalizedLeft.prerelease && !normalizedRight.prerelease) {
    return -1;
  }

  return normalizedLeft.prerelease.localeCompare(normalizedRight.prerelease);
}

function maxDate(left: Date | undefined, right: Date | undefined) {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return left > right ? left : right;
}

function buildMinioBaseUrl(endpoint: string, useSsl: boolean) {
  if (!endpoint) {
    return null;
  }

  const protocol = useSsl ? "https" : "http";
  return `${protocol}://${endpoint.replace(/^https?:\/\//, "")}`;
}

function buildPublicArtifactUrl(publicBaseUrl: string, key: string) {
  const url = new URL("/desktop-update/download", publicBaseUrl);
  url.search = new URLSearchParams({ key }).toString();
  return url.toString();
}

async function fetchSignatureValue(
  options: {
    bucket: string;
    endpoint: string;
    accessKey: string;
    secretKey: string;
    region: string;
  },
  key: string,
) {
  const response = await fetchMinioResponse(options, key, {});

  if (!response.ok) {
    throw new Error(
      `Failed to fetch signature ${key}: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.text()).trim();
}

async function fetchMinioResponse(
  options: {
    bucket: string;
    endpoint: string;
    accessKey: string;
    secretKey: string;
    region: string;
  },
  key: string,
  query: Record<string, string>,
) {
  const { url, headers } = createSignedMinioRequest(options, key, query);
  return fetch(url, {
    method: "GET",
    headers,
  });
}

function createSignedMinioRequest(
  options: {
    bucket: string;
    endpoint: string;
    accessKey: string;
    secretKey: string;
    region: string;
  },
  key: string,
  query: Record<string, string>,
) {
  const url = new URL(options.endpoint);
  url.pathname = `/${encodePathSegment(options.bucket)}${key ? `/${encodeObjectKey(key)}` : ""}`;

  const amzDate = toAmzDate(new Date());
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${options.region}/s3/aws4_request`;
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalQueryString = [...new URLSearchParams(query).entries()]
    .map(
      ([queryKey, queryValue]) =>
        [encodeRfc3986(queryKey), encodeRfc3986(queryValue)] as const,
    )
    .sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) {
        return leftValue.localeCompare(rightValue);
      }

      return leftKey.localeCompare(rightKey);
    })
    .map(([queryKey, queryValue]) => `${queryKey}=${queryValue}`)
    .join("&");

  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalHeaders =
    [
      `host:${url.host}`,
      `x-amz-content-sha256:${payloadHash}`,
      `x-amz-date:${amzDate}`,
    ].join("\n") + "\n";

  const canonicalRequest = [
    "GET",
    url.pathname,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(
    options.secretKey,
    dateStamp,
    options.region,
    "s3",
  );
  const signature = hmacHex(signingKey, stringToSign);

  const headers = {
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    Authorization: `AWS4-HMAC-SHA256 Credential=${options.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };

  if (canonicalQueryString) {
    url.search = canonicalQueryString;
  }

  return { url, headers };
}

function forwardResponseHeaders(response: Response, res: express.Response) {
  const headerNames = [
    "content-type",
    "content-length",
    "content-disposition",
    "last-modified",
    "etag",
    "cache-control",
    "accept-ranges",
  ];

  for (const headerName of headerNames) {
    const value = response.headers.get(headerName);
    if (value) {
      res.setHeader(headerName, value);
    }
  }
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function hmacHex(key: Buffer, value: string) {
  return createHmac("sha256", key).update(value).digest("hex");
}

function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string,
) {
  const kDate = createHmac("sha256", `AWS4${secretKey}`)
    .update(dateStamp)
    .digest();
  const kRegion = createHmac("sha256", kDate).update(region).digest();
  const kService = createHmac("sha256", kRegion).update(service).digest();
  return createHmac("sha256", kService).update("aws4_request").digest();
}

function toAmzDate(date: Date) {
  return (
    date
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .slice(0, 15) + "Z"
  );
}

function encodePathSegment(value: string) {
  return encodeRfc3986(value).replace(/%2F/g, "/");
}

function encodeObjectKey(value: string) {
  return value
    .split("/")
    .map((segment) => encodeRfc3986(segment))
    .join("/");
}

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function parseS3ListObjects(xml: string): S3Object[] {
  const contents = xml.match(/<Contents>[\s\S]*?<\/Contents>/g) ?? [];

  return contents
    .map((content) => {
      const key = extractTag(content, "Key");
      if (!key) {
        return null;
      }

      const lastModified = extractTag(content, "LastModified");
      return {
        key: decodeXmlEntities(key),
        lastModified: lastModified ? new Date(lastModified) : undefined,
      };
    })
    .filter((object): object is S3Object => object !== null);
}

function extractTag(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\/${tagName}>`));
  return match?.[1] ?? null;
}

function decodeXmlEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function parseVersionParts(version: string) {
  const normalized = version.replace(/^v/i, "");
  const match = normalized.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/,
  );

  if (!match) {
    return {
      numeric: [0, 0, 0],
      prerelease: normalized,
    };
  }

  return {
    numeric: [Number(match[1]), Number(match[2]), Number(match[3])],
    prerelease: match[4] ?? "",
  };
}

function getPublicBaseUrl(req: express.Request) {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || (req.secure ? "https" : "http");
  const host = req.get("host");

  if (!host) {
    return null;
  }

  return `${protocol}://${host}`;
}
