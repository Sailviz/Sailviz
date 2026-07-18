import { InfluxDB } from "@influxdata/influxdb-client";
import * as config from "./config";
const token = config.INFLUXDB_TOKEN;
const url = config.INFLUXDB_URL;
const INFLUXDB_org = config.INFLUXDB_ORG;
const INFLUXDB_bucket = config.INFLUXDB_BUCKET;

export const influxWrite = new InfluxDB({ url, token }).getWriteApi(
  INFLUXDB_org,
  INFLUXDB_bucket,
  "ms"
);
export const influxQuery = new InfluxDB({ url, token }).getQueryApi(
  INFLUXDB_org
);
