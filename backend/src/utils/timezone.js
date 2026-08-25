import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';

export function getLocalDate(utcDate, timezone) {
  return formatInTimeZone(utcDate, timezone, 'yyyy-MM-dd');
}

export function getCurrentLocalDate(timezone) {
  return getLocalDate(new Date(), timezone);
}

export function isDateInFuture(localDateString, timezone) {
  const currentLocal = getCurrentLocalDate(timezone);
  return localDateString > currentLocal;
}

export function isDateBeforeCreation(localDateString, createdAtUTC, timezone) {
  const creationLocalDate = getLocalDate(createdAtUTC, timezone);
  return localDateString < creationLocalDate;
}

export function isValidTimezone(timezone) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch (ex) {
    return false;
  }
}

export function parseLocalDate(localDateString, timezone) {
  const dateTimeString = `${localDateString}T00:00:00`;
  const zonedDate = toZonedTime(dateTimeString, timezone);
  return zonedDate;
}

export function getTimezoneOffset(timezone) {
  const now = new Date();
  return formatInTimeZone(now, timezone, 'XXX');
}

export function isValidLocalDateFormat(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  try {
    const date = parseISO(dateString);
    return date instanceof Date && !isNaN(date);
  } catch {
    return false;
  }
}
