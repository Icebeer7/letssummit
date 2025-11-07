import dayjs from 'dayjs';
import durationPlugin from 'dayjs/plugin/duration';
import { TFunction } from 'i18next';
import { Platform } from 'react-native';
import i18n from '../../assets/locales/strings.config';
import { Log } from './Log';

dayjs.extend(durationPlugin);

export function convertToUTCDate(date: Date) {
  if (Platform.OS === 'ios') {
    return date;
  }

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
  );
}

export function getUTCString(date: Date) {
  const dateString = convertToUTCDate(date).toISOString();

  const dotIndex = dateString.indexOf('.');
  return dateString.replace('T', ' ').slice(0, dotIndex);
}

export const formatTimestamp = (
  timeStamp: string,
  applyDaySuffix: boolean = false,
  dateOption: Intl.DateTimeFormatOptions = DD_YYY_MM,
  timeOption: Intl.DateTimeFormatOptions = HH_MM_M,
) => {
  const formattedDate = formatDate(timeStamp, dateOption, applyDaySuffix);
  const formattedTime = formatTime(timeStamp, timeOption);

  return `${formattedDate} ${formattedTime}`;
};

export const formatTime = (timeStamp: string, timeOption: Intl.DateTimeFormatOptions = HH_MM_M) => {
  const date = new Date(timeStamp);
  const locale = i18n.resolvedLanguage;
  return date.toLocaleString(locale, timeOption);
};

export const formatDate = (
  timeStamp: string,
  dateOption: Intl.DateTimeFormatOptions = DD_YYY_MM,
  applyDaySuffix: boolean = false,
) => {
  const date = new Date(timeStamp);
  const locale = i18n.resolvedLanguage;
  const formattedDate = date.toLocaleDateString(locale, dateOption);
  if (applyDaySuffix) {
    // Extract the day to determine the correct suffix
    const day = date.getDate();
    const daySuffix = getDaySuffix(day);

    // Replace the day in the formattedDate with the suffixed day
    return formattedDate.replace(/\b\d{1,2}\b/, `${day}${daySuffix}`);
  }
  return formattedDate;
};

export const DD_YYY_MM: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
};

export const HH_MM_M: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
};

function getDaySuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

export function getDate(timestamp: string): Date | undefined {
  try {
    const regex = /(\d{1,2})\/(\d{1,2})\/(\d{2,4}) (\d{1,2}):(\d{1,2}):(\d{1,2}) (AM|PM|am|pm)/;
    const match = timestamp.match(regex);

    if (match) {
      const [, month, day, year, hours, minutes, seconds, period] = match;
      if (month && day && year && hours && minutes && seconds && period) {
        let parsedHours = parseInt(hours, 10);
        if (period.toLowerCase() === 'pm' && parsedHours < 12) {
          parsedHours += 12; // Convert to 24-hour format
        } else if (period.toLowerCase() === 'am' && parsedHours === 12) {
          parsedHours = 0; // Midnight case
        }

        return new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parsedHours,
          parseInt(minutes),
          parseInt(seconds),
        );
      }
    }

    // If no match, return null or handle error
    return undefined;
  } catch (ex) {
    Log.e('Failed to parse timestamp : ', ex);
  }
}

export function parseDate(timestamp: string): Date {
  try {
    return new Date(timestamp);
  } catch (error) {
    return new Date();
  }
}

export type CalendarUnit =
  | 'YEAR'
  | 'MONTH'
  | 'DATE'
  | 'HOUR'
  | 'MINUTE'
  | 'MILLISECOND'
  | 'SECOND'
  | 'NONE';

export type CalendarDuration = {
  calendarUnit: CalendarUnit;
  value: number;
};

export function addToDate(date: Date, unit: CalendarUnit, value: number) {
  const newDate = new Date(date);

  switch (unit) {
    case 'YEAR':
      newDate.setFullYear(newDate.getFullYear() + value);
      break;
    case 'MONTH':
      newDate.setMonth(newDate.getMonth() + value);
      break;
    case 'DATE': // Adding days (both "Day" and "Week" fall under "DATE")
      newDate.setDate(newDate.getDate() + value);
      break;
    case 'HOUR':
      newDate.setHours(newDate.getHours() + value);
      break;
    case 'MINUTE':
      newDate.setMinutes(newDate.getMinutes() + value);
      break;
    case 'SECOND':
      newDate.setSeconds(newDate.getSeconds() + value);
      break;
    case 'MILLISECOND':
      newDate.setMilliseconds(newDate.getMilliseconds() + value);
      break;
    default: {
      Log.e(`Invalid unit ${unit} received, returning original date.`);
      return date;
    }
  }

  return newDate;
}

export function getFormattedDateString(date: Date, format?: Intl.DateTimeFormatOptions): string {
  const locale = i18n.resolvedLanguage;
  const dateStyle = new Intl.DateTimeFormat(
    locale,
    format ?? {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    },
  );

  try {
    // Format the date to extract day, month and year in English first
    const day = date.getDate();

    // Get month name in the target locale
    let formattedDate = dateStyle.format(date);

    formattedDate = day.toString() + ' ' + formattedDate.replace(' ' + day.toString(), '');

    if (locale === 'en') {
      return formattedDate.replace(day.toString(), day.toString() + getDaySuffix(day));
    }
    return formattedDate;
  } catch (error) {
    // Fallback formatting if any error occurs
    return dateStyle.format(date);
  }
}

export function getTimeToExpire(
  duration: number,
  timeInDay: string | undefined,
  t: TFunction,
): string {
  if (duration >= 1) {
    const daysString = t('validity-days', { count: duration });

    if (timeInDay) {
      const components = timeInDay.split(':');
      const hours = parseInt(components?.[0] ?? '0', 10);
      if (hours > 0) {
        const hoursString = t('hour', { count: hours });
        return `${daysString} ${hoursString}`;
      }
    }
    return daysString;
  } else {
    if (timeInDay) {
      const components = timeInDay.split(':');
      const hours = parseInt(components?.[0] ?? '0', 10);
      const mins = parseInt(components?.[1] ?? '0', 10);
      const seconds = parseInt(components?.[2] ?? '0', 10);

      if (hours > 0) {
        return t('hour', { count: hours });
      } else if (mins > 0) {
        return t('minute', { count: mins });
      } else if (seconds > 0) {
        return t('second', { count: seconds });
      } else {
        return t('validity-days', { count: 0 });
      }
    }
    return 'na';
  }
}

export function isDateExpired(dateString: string): boolean {
  // Parse the input string to a Date object
  const inputDate = new Date(dateString);

  // Check if the date is invalid
  if (isNaN(inputDate.getTime())) {
    throw new Error('Invalid date string format');
  }

  // Get the current date
  const now = new Date();

  // Compare the input date with the current date
  return inputDate.getTime() < now.getTime();
}

export function hoursTillNextDay() {
  const now = new Date();
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 0, 0); // Set the time to midnight (start of the next day)
  // Calculate the difference in milliseconds
  const diffMs = nextDay.getTime() - now.getTime();
  // Convert milliseconds to hours
  return Math.floor(diffMs / (1000 * 60 * 60));
}

export function getTimeLeftDescription(targetDate: string | Date, t: TFunction): string {
  const now = dayjs();
  const target = dayjs(targetDate);

  if (target.isBefore(now)) return t('second', { count: 0 });

  const diffInMs = target.diff(now);
  const dur = dayjs.duration(diffInMs);

  if (dur.asDays() >= 1) {
    return t('validity-days', { count: Math.floor(dur.asDays()) });
  } else if (dur.asHours() >= 1) {
    return t('hour', { count: Math.floor(dur.asHours()) });
  } else if (dur.asMinutes() >= 1) {
    return t('minute', { count: Math.floor(dur.asMinutes()) });
  } else {
    return t('second', { count: Math.floor(dur.asSeconds()) });
  }
}
