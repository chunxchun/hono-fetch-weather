export type PressLink = {
  id: string;
  title: string;
  url: string;
  press_release_date: string;
  created_at: string;
  updated_at: string;
};

export type HourlyReading = {
  id: string;
  // title: string;
  content: string;
  url: string;
  temperature: string;
  humidity: string;
  report_date: string;
  report_time: string;
  created_at: string;
  updated_at: string;
};

export type HSWW = {
  id: string;
  content: string;
  url: string;
  created_at: string;
  updated_at: string; 
};
