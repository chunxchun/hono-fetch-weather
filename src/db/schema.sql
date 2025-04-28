DROP TABLE IF EXISTS press_releases;

DROP TABLE IF EXISTS hourly_readings;

CREATE TABLE IF NOT EXISTS press_releases (
  id text PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL,
  press_date DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS hourly_readings (
  id text PRIMARY KEY,
  report text NOT NULL,
  temperature text NOT NULL,
  humidity text NOT NULL,
  report_time text NOT NULL,
  report_date DATE NOT NULL
);

INSERT INTO
  press_releases (id, title, url, press_date)
VALUES
  (
    '423b7e57-b350-4f27-af91-6f275f933e8a',
    '天 氣 稿 第 075 號 - 本港天氣預報',
    'https://www.info.gov.hk/gia/wr/202409/03/P2024090300228.htm',
    '2024-09-03'
  );

  