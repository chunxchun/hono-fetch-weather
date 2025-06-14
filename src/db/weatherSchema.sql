DROP TABLE IF EXISTS "press_links";

DROP TABLE IF EXISTS "hourly_readings";

DROP TABLE IF EXISTS "heat_stress_work_warnings";

DROP TABLE IF EXISTS "daily_summaries";

CREATE TABLE IF NOT EXISTS "press_links" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "url" text NOT NULL,
  "press_release_date" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  UNIQUE (url)
);

CREATE TABLE IF NOT EXISTS "hourly_readings" (
  "id" text PRIMARY KEY,
  "content" text NOT NULL,
  "url" text NOT NULL,
  "temperature" text NOT NULL,
  "humidity" text NOT NULL,
  "report_time" text NOT NULL,
  "report_date" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  UNIQUE (url)
);

CREATE TABLE IF NOT EXISTS "heat_stress_work_warnings" (
  "id" text PRIMARY KEY,
  "content" text NOT NULL,
  "url" text NOT NULL,
  "level" text NULL,
  "report_date" text NOT NULL,
  "start_time" text NULL,
  "cancelled_time" text NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  UNIQUE (url)
);

CREATE TABLE IF NOT EXISTS "daily_summaries" (
  "id" text PRIMARY KEY,
  "date" text NOT NULL,
  "min_temperature" integer NOT NULL,
  "max_temperature" integer NOT NULL,
  "min_humidity" integer NOT NULL,
  "max_humidity" integer NOT NULL,
  "fetched_hsww" boolean NOT NULL default 0,
  UNIQUE (date)
);