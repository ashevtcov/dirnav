// @flow

export type Bounds = {
  top: number,
  bottom: number,
  left: number,
  right: number
};

export type DirNavOptions = {
  focusableClass: ?string,
  selectedClass: ?string,
  defaultSelectionClass: ?string
};

export const DEFAULT_FOCUSABLE_CLASS = 'focusable';
export const DEFAULT_SELECTED_CLASS = 'selected';
export const DEFAULT_DEFAULT_SELECTION_CLASS = 'default-selection';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_ENTER = 13;

const getPageHeight = (): number =>
  Math.max(
    (document.body || {}).scrollHeight || 0,
    (document.body || {}).offsetHeight || 0,
    (document.documentElement || {}).clientHeight || 0,
    (document.documentElement || {}).scrollHeight || 0,
    (document.documentElement || {}).offsetHeight || 0
  );
const getPageWidth = (): number =>
  Math.max(
    (document.body || {}).scrollWidth || 0,
    (document.body || {}).offsetWidth || 0,
    (document.documentElement || {}).clientWidth || 0,
    (document.documentElement || {}).scrollWidth || 0,
    (document.documentElement || {}).offsetWidth || 0
  );
const selectElement = (element: HTMLElement) => element.classList.add(DEFAULT_SELECTED_CLASS);
const deSelectElement = (element: HTMLElement) => element.classList.remove(DEFAULT_SELECTED_CLASS);
const rect = (item: HTMLElement): Bounds => item.getBoundingClientRect();
const arr = (collection) => [].slice.call(collection);
const sortByTopAcs = (a: HTMLElement, b: HTMLElement) => rect(a).top - rect(b).top;
const sortByBottomDesc = (a: HTMLElement, b: HTMLElement) => rect(b).bottom - rect(a).bottom;
const sortByLeftAsc = (a: HTMLElement, b: HTMLElement) => rect(a).left - rect(b).left;
const sortByRightDesc = (a: HTMLElement, b: HTMLElement) => rect(b).right - rect(a).right;
const areBoundsIntersecting = (a: Bounds, b: Bounds): boolean =>
  a.left <= b.right &&
  b.left <= a.right &&
  a.top <= b.bottom &&
  b.top <= a.bottom;

export const selectDefaultItem = (options: ?DirNavOptions) => {
  const selectedClass = (options && options.selectedClass) || DEFAULT_SELECTED_CLASS;
  const defaultSelectionClass = (options && options.defaultSelectionClass) || DEFAULT_DEFAULT_SELECTION_CLASS;
  const selected = document.getElementsByClassName(selectedClass);
  let firstItem = null;

  // Cleanup
  if (selected && selected.length) {
    firstItem = selected[0];

    for (let i = 0; i < selected.length; i++) {
      selected[i].classList.remove(selectedClass);
    }
  }

  // Select first item
  const explicitFirstItem = document.querySelector(`.${defaultSelectionClass}`);

  if (explicitFirstItem) {
    selectElement(explicitFirstItem);
    return;
  }

  if (firstItem) {
    selectElement(firstItem);
  }
};

const getFirstInBounds = (items: Array<HTMLElement>, bounds: Bounds): ?HTMLElement => {
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

const onKeyPress = (e: KeyboardEvent, options: ?DirNavOptions) => {
  // Temporary solution until https://github.com/facebook/flow/issues/183 is fixed
  // I wanted to use beautiful destructuring with defaulting, but
  // Flow cannot parse them, so here's some shit code
  let focusableClass = (options && options.focusableClass) || DEFAULT_FOCUSABLE_CLASS;
  let selectedClass = (options && options.selectedClass) || DEFAULT_SELECTED_CLASS;
  // End of shit code
  const selected = document.querySelector(`.${selectedClass}`);
  const items = document.getElementsByClassName(focusableClass);
  const { keyCode } = e;

  if (selected) {
    if (keyCode === KEY_ENTER) {
      selected.classList.add('clicked');
      selected.click();
    }
  } else {
    if (items && items.length) {
      items[0].classList.add(selectedClass);
    }

    return;
  }

  let newSelection = null;
  const pageWidth = getPageWidth();
  const pageHeight = getPageHeight();

  if (keyCode === KEY_DOWN) {
    const { left, right, bottom } = rect(selected);
    const sortedItems = arr(items)
      .filter(item => rect(item).top > bottom)
      .sort(sortByTopAcs);

    const searchBounds = {
      top: bottom,
      bottom: pageHeight,
      left,
      right,
    };

    newSelection = getFirstInBounds(sortedItems, searchBounds);
  }

  if (keyCode === KEY_UP) {
    const { left, top, right } = rect(selected);
    const sortedItems = arr(items)
      .filter(item => rect(item).bottom < top)
      .sort(sortByBottomDesc);

    const searchBounds = {
      top: 0,
      bottom: top,
      left,
      right,
    };

    newSelection = getFirstInBounds(sortedItems, searchBounds);
  }

  if (keyCode === KEY_RIGHT) {
    const { right, top, bottom } = rect(selected);
    const sortedItems = arr(items)
      .filter(item => rect(item).left > right)
      .sort(sortByLeftAsc);

    const searchBounds = {
      top,
      bottom,
      left: right,
      right: pageWidth,
    };

    newSelection = getFirstInBounds(sortedItems, searchBounds);
  }

  if (keyCode === KEY_LEFT) {
    const { left, top, bottom } = rect(selected);
    const sortedItems = arr(items)
      .filter(item => rect(item).right < left)
      .sort(sortByRightDesc);

    const searchBounds = {
      top,
      bottom,
      left: 0,
      right: left,
    };

    newSelection = getFirstInBounds(sortedItems, searchBounds);
  }

  if (newSelection) {
    selectElement(newSelection);
    deSelectElement(selected);
  }
};

export const initDirNav = (options: ?DirNavOptions) => {
  document.addEventListener('keydown', (e: KeyboardEvent) => onKeyPress(e, options));
};
