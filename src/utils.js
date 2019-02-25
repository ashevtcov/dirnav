// @flow

import type { Bounds } from './types';

export const addClass = (element: HTMLElement, selectedClass: string) => element.classList.add(selectedClass);
export const removeClass = (element: HTMLElement, selectedClass: string) => element.classList.remove(selectedClass);
export const rect = (item: HTMLElement): Bounds => item.getBoundingClientRect();
export const arr = (collection: any) => Array.isArray(collection) ? collection : [].slice.call(collection);
export const sortByTopAcs = (a: HTMLElement, b: HTMLElement) => rect(a).top - rect(b).top;
export const sortByBottomDesc = (a: HTMLElement, b: HTMLElement) => rect(b).bottom - rect(a).bottom;
export const sortByLeftAsc = (a: HTMLElement, b: HTMLElement) => rect(a).left - rect(b).left;
export const sortByRightDesc = (a: HTMLElement, b: HTMLElement) => rect(b).right - rect(a).right;

export const areBoundsIntersecting = (a: Bounds, b: Bounds): boolean =>
  a.left <= b.right &&
  b.left <= a.right &&
  a.top <= b.bottom &&
  b.top <= a.bottom;

export const getFirstInBounds = (items: Array<HTMLElement>, bounds: Bounds): ?HTMLElement => {
  let newSelection = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemBounds = rect(item);

    if (areBoundsIntersecting(itemBounds, bounds)) {
      newSelection = item;
      break;
    }
  }

  return newSelection;
};
