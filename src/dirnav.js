// @flow

import type { Bounds, DirNavOptions } from './types';

import {
  DEFAULT_SELECTED_CLASS,
  DEFAULT_FOCUSABLE_CLASS,
  DEFAULT_DEFAULT_SELECTION_CLASS,
  KEY_ENTER,
  KEY_DOWN,
  KEY_UP,
  KEY_RIGHT,
  KEY_LEFT
} from './constants';
import {
  arr,
  rect,
  selectElement,
  deSelectElement,
  areBoundsIntersecting,
  getPageWidth,
  getPageHeight,
  sortByTopAcs,
  sortByBottomDesc,
  sortByLeftAsc,
  sortByRightDesc
} from './utils';

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