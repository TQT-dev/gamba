import { formatInTimeZone } from "date-fns-tz";

export function currentBrusselsDate(date = new Date()) {
  return formatInTimeZone(date, "Europe/Brussels", "yyyy-MM-dd");
}

export function brusselsMidnight(date = new Date()) {
  const formatted = formatInTimeZone(date, "Europe/Brussels", "yyyy-MM-dd" );
  return new Date(`${formatted}T00:00:00+01:00`);
}
