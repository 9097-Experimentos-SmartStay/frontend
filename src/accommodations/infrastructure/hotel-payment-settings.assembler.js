import { HotelPaymentSettings } from '../domain/model/hotel-payment-settings.js';
import { normalizePaymentSettings } from '../domain/payment-settings-rules.js';

const orNull = (value) => (value == null || value === '' ? null : value);

/**
 * HotelPaymentSettingsResource (GET/PUT /hotels/{id}/payment-settings) ↔ {@link HotelPaymentSettings}, and the
 * `payment_settings.*` violations of the API → the rule codes of the form.
 */
export class HotelPaymentSettingsAssembler {
    /**
     * @param {Object} resource
     * @returns {HotelPaymentSettings|null}
     */
    static toEntityFromResource(resource) {
        if (!resource) return null;
        return new HotelPaymentSettings({
            hotelId: resource.hotelId,
            acceptsBookings: resource.acceptsBookings,
            accountHolder: orNull(resource.accountHolder),
            yapeNumber: orNull(resource.yapeNumber),
            plinNumber: orNull(resource.plinNumber),
            bankName: orNull(resource.bankName),
            bankAccountNumber: orNull(resource.bankAccountNumber),
            bankAccountCci: orNull(resource.bankAccountCci),
        });
    }

    /**
     * @param {Object} response - Axios response.
     * @returns {HotelPaymentSettings|null}
     */
    static toEntityFromResponse(response) {
        return HotelPaymentSettingsAssembler.toEntityFromResource(response?.data);
    }

    /**
     * Body of PUT /hotels/{id}/payment-settings: the whole settings, normalized; methods not set go as null.
     * @param {Object} form
     * @returns {Object}
     */
    static toUpdateResource(form) {
        const values = normalizePaymentSettings(form);
        return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, orNull(value)]));
    }
}

/** Fields of the form (and `methods`, the whole set of methods). */
const FIELDS = Object.freeze(['accountHolder', 'yapeNumber', 'plinNumber', 'bankName', 'bankAccountNumber', 'bankAccountCci', 'methods']);

/** `payment_settings.bank_name_required` → `bankNameRequired`. */
const toRuleCode = (code) => code.slice('payment_settings.'.length).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

/**
 * Field violations of PUT /hotels/{id}/payment-settings (same rule codes as the form validation).
 * @param {import('@/shared/infrastructure/http/problem-details.js').ProblemDetails} problem
 * @returns {Record<string, {code: string, params?: Object}>}
 */
export function paymentSettingsFieldViolations(problem) {
    const violations = {};
    for (const field of FIELDS) {
        const rule = (problem.fieldViolations[field] ?? []).find(({ code }) => code.startsWith('payment_settings.'));
        if (rule) violations[field] = { code: toRuleCode(rule.code), params: rule.params };
        else if (problem.violationOf(field)) violations[field] = { code: 'serverRejected' };
    }
    return violations;
}
