import { CalendarDate } from '@/shared/domain/calendar-date.js';
import { Money } from '@/shared/domain/money.js';

const STYLES = Object.freeze({
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    medium: { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
});

/**
 * Formats a calendar day (booking dates) in the UI language, without timezone shifts.
 * @param {CalendarDate|string|null} value
 * @param {string} locale - Current vue-i18n locale.
 * @param {'short'|'medium'|'long'} [style='short']
 * @returns {string} '—' when empty.
 */
export function formatDay(value, locale, style = 'short') {
    const day = CalendarDate.from(value);
    return day ? day.format(locale, STYLES[style]) : '—';
}

/**
 * Formats an instant (payment date, audit entry) in the user's timezone.
 * @param {Date|null} value
 * @param {string} locale
 * @returns {string}
 */
export function formatDateTime(value, locale) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '—';
    return value.toLocaleString(locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * @param {Money|number|null|undefined} amount
 * @param {string} locale
 * @returns {string} The amount in soles ("S/ 255.00"); '—' when missing.
 */
export function formatMoney(amount, locale) {
    const money = Money.from(amount);
    return money ? money.format(locale) : '—';
}
