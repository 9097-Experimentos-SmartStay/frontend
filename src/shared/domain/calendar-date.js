const DAY_MS = 24 * 60 * 60 * 1000;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Value object for a calendar day (no time, no timezone).
 *
 * Booking check-in/check-out dates are calendar days in the API: the backend drops the time of
 * day and returns them without an offset ("2026-09-28T00:00:00"). Parsing them with `new Date()`
 * would apply the browser timezone and could move the day. This value object keeps only
 * year/month/day, so "28 Sep" is "28 Sep" everywhere.
 */
export class CalendarDate {
    /**
     * @param {number} year
     * @param {number} month - 1..12
     * @param {number} day - 1..31
     */
    constructor(year, month, day) {
        this.year = year;
        this.month = month;
        this.day = day;
        Object.freeze(this);
    }

    /**
     * @param {string|Date|CalendarDate|null|undefined} value - "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss" or a Date (its local day).
     * @returns {CalendarDate|null} Null when the value is empty or unparseable.
     */
    static from(value) {
        if (!value) return null;
        if (value instanceof CalendarDate) return value;
        if (value instanceof Date) {
            return Number.isNaN(value.getTime())
                ? null
                : new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
        }
        const match = ISO_DATE.exec(String(value));
        return match ? new CalendarDate(Number(match[1]), Number(match[2]), Number(match[3])) : null;
    }

    /** @returns {CalendarDate} The current local day. */
    static today() {
        return CalendarDate.from(new Date());
    }

    /** @returns {string} "YYYY-MM-DD", the format sent to the API. */
    toIsoString() {
        const pad = (n) => String(n).padStart(2, '0');
        return `${this.year}-${pad(this.month)}-${pad(this.day)}`;
    }

    /** @returns {Date} Local midnight of this day (for display with toLocaleDateString). */
    toDate() {
        return new Date(this.year, this.month - 1, this.day);
    }

    /**
     * @param {CalendarDate} other
     * @returns {number} Whole days from this day to `other` (negative when `other` is earlier).
     */
    daysUntil(other) {
        const a = Date.UTC(this.year, this.month - 1, this.day);
        const b = Date.UTC(other.year, other.month - 1, other.day);
        return Math.round((b - a) / DAY_MS);
    }

    /**
     * @param {CalendarDate} other
     * @returns {boolean}
     */
    isBefore(other) {
        return this.daysUntil(other) > 0;
    }

    /**
     * @param {CalendarDate} other
     * @returns {boolean}
     */
    isAfter(other) {
        return this.daysUntil(other) < 0;
    }

    /**
     * @param {CalendarDate|null} other
     * @returns {boolean}
     */
    equals(other) {
        return !!other && this.daysUntil(other) === 0;
    }

    /**
     * @param {number} days - May be negative.
     * @returns {CalendarDate}
     */
    addDays(days) {
        const date = new Date(Date.UTC(this.year, this.month - 1, this.day + days));
        return new CalendarDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }

    /**
     * @param {number} months - May be negative. The day is clamped to the length of the target month.
     * @returns {CalendarDate}
     */
    addMonths(months) {
        const first = new Date(Date.UTC(this.year, this.month - 1 + months, 1));
        const lastDay = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
        return new CalendarDate(first.getUTCFullYear(), first.getUTCMonth() + 1, Math.min(this.day, lastDay));
    }

    /** @returns {number} ISO day of the week: 1 = Monday … 7 = Sunday. */
    get dayOfWeek() {
        const weekday = new Date(Date.UTC(this.year, this.month - 1, this.day)).getUTCDay();
        return weekday === 0 ? 7 : weekday;
    }

    /** @returns {CalendarDate} The Monday of this day's week. */
    startOfWeek() {
        return this.addDays(1 - this.dayOfWeek);
    }

    /** @returns {CalendarDate} The first day of this day's month. */
    startOfMonth() {
        return new CalendarDate(this.year, this.month, 1);
    }

    /**
     * @param {CalendarDate} end - Excluded.
     * @returns {CalendarDate[]} Every day from this one (included) to `end` (excluded).
     */
    daysUntilExclusive(end) {
        const count = Math.max(0, this.daysUntil(end));
        return Array.from({ length: count }, (_, index) => this.addDays(index));
    }

    /**
     * @param {string} locale - BCP 47 locale ("es", "en").
     * @param {Intl.DateTimeFormatOptions} [options]
     * @returns {string}
     */
    format(locale, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
        return this.toDate().toLocaleDateString(locale, options);
    }

    toString() {
        return this.toIsoString();
    }
}
