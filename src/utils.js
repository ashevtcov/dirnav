// @flow

import type { Bounds } from './types';

import {
  DEFAULT_SELECTED_CLASS
} from './constants';

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
export const selectElement = (element: HTMLElement) => element.classList.add(DEFAULT_SELECTED_CLASS);
export const deSelectElement = (element: HTMLElement) => element.classList.remove(DEFAULT_SELECTED_CLASS);
export const rect = (item: HTMLElement): Bounds => item.getBoundingClientRect();
export const arr = (collection: any) => [].slice.call(collection);
export const sortByTopAcs = (a: HTMLElement, b: HTMLElement) => rect(a).top - rect(b).top;
export const sortByBottomDesc = (a: HTMLElement, b: HTMLElement) => rect(b).bottom - rect(a).bottom;
export const sortByLeftAsc = (a: HTMLElement, b: HTMLElement) => rect(a).left - rect(b).left;
export const sortByRightDesc = (a: HTMLElement, b: HTMLElement) => rect(b).right - rect(a).right;
export const areBoundsIntersecting = (a: Bounds, b: Bounds): boolean =>
  a.left <= b.right &&
  b.left <= a.right &&
  a.top <= b.bottom &&
  b.top <= a.bottom;
