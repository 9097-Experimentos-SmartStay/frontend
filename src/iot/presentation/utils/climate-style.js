import { Comfort } from '../../domain/model/room-climate.js';

/** Comfort → PrimeVue tag severity and icon, so the guest view and the board read the same. */
const COMFORT_STYLE = Object.freeze({
    [Comfort.COLD]: { severity: 'info', icon: 'pi pi-arrow-down' },
    [Comfort.COMFORTABLE]: { severity: 'success', icon: 'pi pi-check' },
    [Comfort.WARM]: { severity: 'warn', icon: 'pi pi-arrow-up' },
});

/**
 * @param {string} comfort - One of {@link Comfort}.
 * @returns {{severity: string, icon: string}}
 */
export function comfortStyle(comfort) {
    return COMFORT_STYLE[comfort] ?? COMFORT_STYLE[Comfort.COMFORTABLE];
}

/**
 * @param {Function} t
 * @param {string} comfort
 * @returns {string}
 */
export function comfortLabel(t, comfort) {
    return t(`climate.comfort.${comfort}`);
}

/**
 * Temperature as the guest reads it, with one decimal only when it has one.
 * @param {number|null} celsius
 * @param {string} locale
 * @returns {string} E.g. "22 °C", "21,5 °C"; '—' when unknown.
 */
export function formatCelsius(celsius, locale) {
    if (celsius == null || !Number.isFinite(celsius)) return '—';
    const digits = Number.isInteger(celsius) ? 0 : 1;
    const value = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: 1 }).format(celsius);
    return `${value} °C`;
}
