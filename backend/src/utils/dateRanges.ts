import { addDays, format, isBefore, isAfter, getDay, nextFriday, nextMonday, parseISO } from 'date-fns';

export type DatePair = { depart: string; return: string };

function fmt(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function getWeekendPairs(windowStart: string, windowEnd: string): DatePair[] {
  const start = parseISO(windowStart);
  const end = parseISO(windowEnd);
  const pairs: DatePair[] = [];

  // Find first Friday on or after start
  let depart = getDay(start) === 5 ? start : nextFriday(start);
  while (isBefore(depart, end) || depart.getTime() === end.getTime()) {
    const ret = addDays(depart, 2); // Sunday
    if (!isAfter(ret, end)) {
      pairs.push({ depart: fmt(depart), return: fmt(ret) });
    }
    depart = addDays(depart, 7);
  }
  return pairs;
}

export function getWeekPairs(windowStart: string, windowEnd: string): DatePair[] {
  const start = parseISO(windowStart);
  const end = parseISO(windowEnd);
  const pairs: DatePair[] = [];

  // Find first Monday on or after start
  let depart = getDay(start) === 1 ? start : nextMonday(start);
  while (isBefore(depart, end) || depart.getTime() === end.getTime()) {
    const ret = addDays(depart, 6); // Sunday
    if (!isAfter(ret, end)) {
      pairs.push({ depart: fmt(depart), return: fmt(ret) });
    }
    depart = addDays(depart, 7);
  }
  return pairs;
}

export function getCustomPairs(
  windowStart: string,
  windowEnd: string,
  minNights: number,
  maxNights: number,
  maxPairs = 30
): DatePair[] {
  const start = parseISO(windowStart);
  const end = parseISO(windowEnd);
  const pairs: DatePair[] = [];

  let depart = start;
  while ((isBefore(depart, end) || depart.getTime() === end.getTime()) && pairs.length < maxPairs) {
    for (let nights = minNights; nights <= maxNights && pairs.length < maxPairs; nights++) {
      const ret = addDays(depart, nights);
      if (!isAfter(ret, end)) {
        pairs.push({ depart: fmt(depart), return: fmt(ret) });
      }
    }
    depart = addDays(depart, 1);
  }
  return pairs;
}

export function getDatePairs(
  tripType: 'weekend' | 'week' | 'custom',
  windowStart: string,
  windowEnd: string,
  minNights = 2,
  maxNights = 7
): DatePair[] {
  switch (tripType) {
    case 'weekend':
      return getWeekendPairs(windowStart, windowEnd);
    case 'week':
      return getWeekPairs(windowStart, windowEnd);
    case 'custom':
      return getCustomPairs(windowStart, windowEnd, minNights, maxNights);
  }
}
