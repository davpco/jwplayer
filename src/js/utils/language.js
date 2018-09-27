import { invert } from 'utils/underscore';
import { isIframe } from 'utils/browser';
import { ajax } from 'utils/ajax';
import { isDeepKeyMatch } from 'utils/validator';
import en from 'assets/translations/en.js';

/**
 * A map of 2-letter language codes (ISO 639-1) to language name in English
 */
const codeToLang = {
    zh: 'Chinese',
    nl: 'Dutch',
    en: 'English',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    pt: 'Portuguese',
    ru: 'Russian',
    es: 'Spanish',
    el: 'Greek',
};

const langToCode = invert(codeToLang);

function normalizeLanguageCode(language) {
    return language.substring(0, 2).toLowerCase();
}

function normalizeLanguageAndCountryCode(language) {
    return language.toLowerCase().replace('-', '_');
}

function normalizeIntl(intl) {
    // TODO: Country codes are generally seen in upper case, but we have yet to find documentation confirming that this is the standard.
    // When the documentation is found, remove lower case support and update our docs with reference to standards.
    return Object.keys(intl).reduce((obj, key) => {
        obj[normalizeLanguageAndCountryCode(key)] = intl[key];
        return obj;
    }, {});
}

export function getLabel(language) {
    if (!language) {
        return;
    }

    // We do not map ISO 639-2 (3-letter codes)
    if (language.length === 3) {
        return language;
    }

    return codeToLang[normalizeLanguageCode(language)] || language;
}

export function getCode(language) {
    return langToCode[language] || '';
}

function extractLanguage(doc) {
    const htmlTag = doc.querySelector('html');
    return htmlTag ? htmlTag.getAttribute('lang') : null;
}

export function getLanguage() {
    let language = extractLanguage(document);
    if (!language && isIframe()) {
        try {
            // Exception is thrown if iFrame is on a different domain name.
            language = extractLanguage(window.top.document);
        } catch (e) {/* ignore */}
    }
    return language || navigator.language || 'en';
}

export const translatedLanguageCodes = ['ar', 'da', 'de', 'es', 'fr', 'it', 'ja', 'nb', 'nl', 'pt', 'ro', 'sv', 'tr', 'zh'];

export function isTranslationAvailable(language) {
    return translatedLanguageCodes.indexOf(normalizeLanguageCode(language)) >= 0;
}

export function getCustomLocalization(localization, intl, languageAndCountryCode) {
    intl = normalizeIntl(intl || {});
    return Object.assign({}, localization || {}, intl[normalizeLanguageCode(languageAndCountryCode)], intl[normalizeLanguageAndCountryCode(languageAndCountryCode)]);
}

export function isLocalizationComplete(customLocalization) {
    return isDeepKeyMatch(en, customLocalization);
}

export function loadJsonTranslation(base, languageCode) {
    const url = `${base}translations/${normalizeLanguageCode(languageCode)}.json`;
    return new Promise((resolve, reject) => {
        ajax({ url, resolve, reject, responseType: 'json' });
    });
}

export function applyTranslation(baseLocalization, customization) {
    const localization = Object.assign({}, baseLocalization, customization);
    merge(localization, 'errors', baseLocalization, customization);
    merge(localization, 'related', baseLocalization, customization);
    merge(localization, 'sharing', baseLocalization, customization);
    merge(localization, 'advertising', baseLocalization, customization);
    return localization;
}

function merge(z, prop, a, b) {
    z[prop] = Object.assign({}, a[prop], b[prop]);
}
