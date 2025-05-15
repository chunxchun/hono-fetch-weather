DROP TABLE IF EXISTS "daily_report_images";

DROP TABLE IF EXISTS "daily_reports";

CREATE TABLE IF NOT EXISTS "daily_report_images" (
  "id" text PRIMARY KEY,
  "date" text NOT NULL,
  "desc" text NOT NULL,
  "url" text NOT NULL,
  "width" integer NOT NULL,
  "height" integer NOT NULL,
  "building" text NOT NULL,
  "level" text NOT NULL,
  "location" text NOT NULL,
  "substrate" text NOT NULL,
  "work" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_reports" (
  "id" text PRIMARY KEY,
  "date" text NOT NULL,
  "title" text NOT NULL,
  "weather_summary" text NOT NULL,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);