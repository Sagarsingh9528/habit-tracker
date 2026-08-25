import { parseISO, differenceInDays } from 'date-fns';
import { getCurrentLocalDate } from './timezone.js';

export function calculateStreaks(checkIns, userTimezone) {
  if (!checkIns || checkIns.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDates = checkIns
    .map(c => c.localDate)
    .sort((a, b) => b.localeCompare(a));

  const today = getCurrentLocalDate(userTimezone);
  const yesterday = getYesterday(today);

  let currentStreak = 0;
  const mostRecentDate = sortedDates[0];

  if (mostRecentDate === today || mostRecentDate === yesterday) {
    currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const expectedDate = subtractDays(sortedDates[i - 1], 1);
      
      if (sortedDates[i] === expectedDate) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const expectedDate = subtractDays(sortedDates[i - 1], 1);
    
    if (sortedDates[i] === expectedDate) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak);
  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak };
}

function getYesterday(dateString) {
  const date = parseISO(dateString);
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatDate(yesterday);
}

function subtractDays(dateString, days) {
  const date = parseISO(dateString);
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return formatDate(newDate);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isCompletedToday(checkIns, userTimezone) {
  if (!checkIns || checkIns.length === 0) return false;
  
  const today = getCurrentLocalDate(userTimezone);
  return checkIns.some(c => c.localDate === today);
}
