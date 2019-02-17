// @flow

import type { DirNavOptions } from './types';

import {
  DEFAULT_SELECTED_CLASS,
  DEFAULT_FOCUSABLE_CLASS,
  DEFAULT_DEFAULT_SELECTION_CLASS,
  DEFAULT_PREVENT_DEFAULT_EVENTS,
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
  getFirstInBounds,
  sortByTopAcs,
  sortByBottomDesc,
  sortByLeftAsc,
  sortByRightDesc
} from './utils';
import {
  getPageWidth,
  getPageHeight,
  domQueryOneByClass,
  domQueryAllByClass,
  domAddEvent
} from './dom';

export const selectDefaultItem = (options: ?DirNavOptions) => {
  const selectedClass = (options && options.selectedClass) || DEFAULT_SELECTED_CLASS;
  const defaultSelectionClass = (options && options.defaultSelectionClass) || DEFAULT_DEFAULT_SELECTION_CLASS;
  const selected = domQueryAllByClass(selectedClass);
  let firstItem = null;

  // Cleanup
  if (selected && selected.length) {
    firstItem = selected[0];

    for (let i = 0; i < selected.length; i++) {
      selected[i].classList.remove(selectedClass);
    }
  }

  // Select first item
  const explicitFirstItem = domQueryOneByClass(defaultSelectionClass);

  if (explicitFirstItem) {
    selectElement(explicitFirstItem);
    return;
  }

  if (firstItem) {
    selectElement(firstItem);
  }
};

export const onKeyPress = (e: KeyboardEvent, options: ?DirNavOptions) => {
  // Temporary solution until https://github.com/facebook/flow/issues/183 is fixed
  // I wanted to use beautiful destructuring with defaulting, but
  // Flow cannot parse them, so here's some shit code
  let focusableClass = (options && options.focusableClass) || DEFAULT_FOCUSABLE_CLASS;
  let selectedClass = (options && options.selectedClass) || DEFAULT_SELECTED_CLASS;
  let preventDefaultEvents = (options && options.preventDefaultEvents) || DEFAULT_PREVENT_DEFAULT_EVENTS;
  // End of shit code
  const selected = domQueryOneByClass(selectedClass);
  const items = domQueryAllByClass(focusableClass);
  const { keyCode } = e;

  if (selected) {
    if (keyCode === KEY_ENTER) {
      if (preventDefaultEvents) {
        e.preventDefault();
      }

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
    if (preventDefaultEvents) {
      e.preventDefault();
    }

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
    if (preventDefaultEvents) {
      e.preventDefault();
    }

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
    if (preventDefaultEvents) {
      e.preventDefault();
    }

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
    if (preventDefaultEvents) {
      e.preventDefault();
    }

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
  domAddEvent('keydown', (e: KeyboardEvent) => onKeyPress(e, options));
};
