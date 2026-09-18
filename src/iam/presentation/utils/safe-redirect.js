/**
 * Only same-app paths are followed after sign-in (never an absolute URL from the query string).
 * @param {unknown} target - `route.query.redirect`.
 * @returns {string|null}
 */
export function safeRedirect(target) {
    return typeof target === 'string' && target.startsWith('/') && !target.startsWith('//') ? target : null;
}
