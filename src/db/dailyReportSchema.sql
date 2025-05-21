DROP TABLE IF EXISTS "daily_report_images";

DROP TABLE IF EXISTS "daily_reports";

DROP TABLE IF EXISTS "man_powers";

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
  "updated_at" text NOT NULL,
  UNIQUE (date)
);

CREATE TABLE IF NOT EXISTS "man_powers" (
  "id" text PRIMARY KEY,
  "date" text NOT NULL,
  "work_desc" text NOT NULL,
  "quantity" text NOT NULL,
  "man_count" integer NOT NULL,
  "location" text NOT NULL,
  "remarks" text NOT NULL,
  UNIQUE (date, location)
);