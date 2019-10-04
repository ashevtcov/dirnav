// @flow

export const domAddEvent = (eventName: string, callback: any) =>
  document.addEventListener(eventName, callback);
export const domQueryOne = (selector: string): ?HTMLElement =>
  document.querySelector(selector);
export const domQueryOneByClass = (className: string): ?HTMLElement =>
  domQueryOne(`.${className}`);
export const domQueryAllByClass = (className: string): ?HTMLCollection<HTMLElement> =>
  document.getElementsByClassName(className);
export const domGetAttrValue = (element: HTMLElement, attrName: string): ?string =>
  element.getAttribute(attrName);

export const getPageHeight = (): number =>
  Math.max(
    (document.body || {}).scrollHeight || 0,
    (document.body || {}).offsetHeight || 0,
    (document.documentElement || {}).clientHeight || 0,
    (document.documentElement || {}).scrollHeight || 0,
    (document.documentElement || {}).offsetHeight || 0
  );
export const getPageWidth = (): number =>
  Math.max(
    (document.body || {}).scrollWidth || 0,
    (document.body || {}).offsetWidth || 0,
    (document.documentElement || {}).clientWidth || 0,
    (document.documentElement || {}).scrollWidth || 0,
    (document.documentElement || {}).offsetWidth || 0
  );
