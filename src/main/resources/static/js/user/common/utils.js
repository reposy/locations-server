/**
 * 단일 DOM 요소 선택
 * @param {string} selector
 * @returns {Element|null}
 */
export const qs = (selector) => document.querySelector(selector);

/**
 * 여러 DOM 요소 선택
 * @param {string} selector
 * @returns {NodeListOf<Element>}
 */
export const qsa = (selector) => document.querySelectorAll(selector);