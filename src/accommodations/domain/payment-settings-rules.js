/**
 * Rules of the payment methods of a hotel (PUT /hotels/{id}/payment-settings). They mirror the backend value object
 * `HotelPaymentSettings`: same normalization, same limits, and every broken rule is reported at once, keyed by the
 * same fields and with the same meaning as the API violations (`payment_settings.*`).
 */

/** Why the payment methods are invalid (i18n `hotelPaymentSettings.rules.<code>`). */
export const PaymentSettingsRuleError = Object.freeze({
    ACCOUNT_HOLDER_REQUIRED: 'accountHolderRequired',
    ACCOUNT_HOLDER_LENGTH: 'accountHolderLength',
    YAPE_NUMBER_INVALID: 'yapeNumberInvalid',
    PLIN_NUMBER_INVALID: 'plinNumberInvalid',
    BANK_NAME_REQUIRED: 'bankNameRequired',
    BANK_NAME_LENGTH: 'bankNameLength',
    BANK_ACCOUNT_NUMBER_REQUIRED: 'bankAccountNumberRequired',
    BANK_ACCOUNT_NUMBER_INVALID: 'bankAccountNumberInvalid',
    CCI_INVALID: 'cciInvalid',
    METHOD_REQUIRED: 'methodRequired',
});

export const PAYMENT_SETTINGS_LIMITS = Object.freeze({
    accountHolder: { min: 2, max: 100 },
    bankName: { min: 2, max: 60 },
    bankAccountDigits: { min: 8, max: 20 },
    cciDigits: 20,
});

/** Peruvian mobile number (Yape, Plin): 9 digits starting with 9. */
const MOBILE_NUMBER = /^9\d{8}$/;
const ACCOUNT_NUMBER = /^[0-9-]+$/;
const CCI = /^\d{20}$/;

const text = (value) => String(value ?? '').trim();
const withoutSpacesAndHyphens = (value) => text(value).replace(/[\s-]+/g, '');

/**
 * Normalizes the form like the backend: trim; Yape, Plin and CCI without spaces or hyphens; account number without
 * spaces (hyphens kept). Empty strings mean "not set".
 * @param {{accountHolder?: string, yapeNumber?: string, plinNumber?: string, bankName?: string, bankAccountNumber?: string, bankAccountCci?: string}} form
 * @returns {{accountHolder: string, yapeNumber: string, plinNumber: string, bankName: string, bankAccountNumber: string, bankAccountCci: string}}
 */
export function normalizePaymentSettings(form) {
    return {
        accountHolder: text(form.accountHolder),
        yapeNumber: withoutSpacesAndHyphens(form.yapeNumber),
        plinNumber: withoutSpacesAndHyphens(form.plinNumber),
        bankName: text(form.bankName),
        bankAccountNumber: text(form.bankAccountNumber).replace(/\s+/g, ''),
        bankAccountCci: withoutSpacesAndHyphens(form.bankAccountCci),
    };
}

/**
 * @param {Object} form - Raw form values (normalized here).
 * @returns {Record<string, {code: string, params?: Object}>} One violation per invalid field; `methods` when no
 *   payment method is configured. Empty when valid.
 */
export function validatePaymentSettings(form) {
    const v = normalizePaymentSettings(form);
    const errors = {};
    const { accountHolder, bankName, bankAccountDigits } = PAYMENT_SETTINGS_LIMITS;

    if (!v.accountHolder) errors.accountHolder = { code: PaymentSettingsRuleError.ACCOUNT_HOLDER_REQUIRED };
    else if (v.accountHolder.length < accountHolder.min || v.accountHolder.length > accountHolder.max) {
        errors.accountHolder = { code: PaymentSettingsRuleError.ACCOUNT_HOLDER_LENGTH, params: { minLength: accountHolder.min, maxLength: accountHolder.max } };
    }

    if (v.yapeNumber && !MOBILE_NUMBER.test(v.yapeNumber)) errors.yapeNumber = { code: PaymentSettingsRuleError.YAPE_NUMBER_INVALID };
    if (v.plinNumber && !MOBILE_NUMBER.test(v.plinNumber)) errors.plinNumber = { code: PaymentSettingsRuleError.PLIN_NUMBER_INVALID };

    if (!v.bankName && (v.bankAccountNumber || v.bankAccountCci)) errors.bankName = { code: PaymentSettingsRuleError.BANK_NAME_REQUIRED };
    else if (v.bankName && (v.bankName.length < bankName.min || v.bankName.length > bankName.max)) {
        errors.bankName = { code: PaymentSettingsRuleError.BANK_NAME_LENGTH, params: { minLength: bankName.min, maxLength: bankName.max } };
    }

    if (!v.bankAccountNumber && (v.bankName || v.bankAccountCci)) {
        errors.bankAccountNumber = { code: PaymentSettingsRuleError.BANK_ACCOUNT_NUMBER_REQUIRED };
    } else if (v.bankAccountNumber) {
        const digits = v.bankAccountNumber.replace(/-/g, '').length;
        if (!ACCOUNT_NUMBER.test(v.bankAccountNumber) || digits < bankAccountDigits.min || digits > bankAccountDigits.max) {
            errors.bankAccountNumber = { code: PaymentSettingsRuleError.BANK_ACCOUNT_NUMBER_INVALID, params: { minDigits: bankAccountDigits.min, maxDigits: bankAccountDigits.max } };
        }
    }

    if (v.bankAccountCci && !CCI.test(v.bankAccountCci)) errors.bankAccountCci = { code: PaymentSettingsRuleError.CCI_INVALID };

    if (!v.yapeNumber && !v.plinNumber && !(v.bankName && v.bankAccountNumber)) {
        errors.methods = { code: PaymentSettingsRuleError.METHOD_REQUIRED };
    }
    return errors;
}
