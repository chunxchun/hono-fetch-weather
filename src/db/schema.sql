DROP TABLE IF EXISTS "press_links";

DROP TABLE IF EXISTS "hourly_readings";

DROP TABLE IF EXISTS "heat_stress_work_warnings";

CREATE TABLE IF NOT EXISTS "press_links" (
  "id" text PRIMARY KEY,
  "title" text NOT NULL,
  "url" text NOT NULL,
  "press_release_date" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
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
  "updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "heat_stress_work_warnings" (
  "id" text PRIMARY KEY,
  "content" text NOT NULL,
  "url" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);