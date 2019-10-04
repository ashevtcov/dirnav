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
  addClass,
  removeClass,
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
      removeClass(selected[i], selectedClass);
    }
  }

  // Select first item
  const explicitFirstItem = domQueryOneByClass(defaultSelectionClass);

  if (explicitFirstItem) {
    addClass(explicitFirstItem, selectedClass);
    return;
  }

  if (firstItem) {
    addClass(firstItem, selectedClass);
  }
};

const handleLeft = ({
  selected,
  items
}) => {
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

  const newSelection = getFirstInBounds(sortedItems, searchBounds);

  return {
    newSelection
  };
};

const handleRight = ({
  selected,
  items,
  pageWidth
}) => {
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

  const newSelection = getFirstInBounds(sortedItems, searchBounds);

  return {
    newSelection
  };
};

const handleDown = ({
  selected,
  items,
  pageHeight
}) => {
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

  const newSelection = getFirstInBounds(sortedItems, searchBounds);

  return {
    newSelection
  };
};

const handleUp = ({
  selected,
  items
}) => {
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

  const newSelection = getFirstInBounds(sortedItems, searchBounds);

  return {
    newSelection
  };
};

type DirectionResult = {
  newSelection: any
};

const isDirectionalKeyCode = (keyCode) => (
  keyCode === KEY_LEFT ||
  keyCode === KEY_RIGHT ||
  keyCode === KEY_DOWN ||
  keyCode === KEY_UP
);

const handleDirection = ({
  preventDefaultEvents,
  keyCode,
  preventDefault,
  pageWidth,
  pageHeight,
  selected,
  items
}): DirectionResult => {
  if (isDirectionalKeyCode(keyCode) && preventDefaultEvents) {
    preventDefault();
  }

  if (keyCode === KEY_LEFT) {
    return handleLeft({ selected, items });
  }

  if (keyCode === KEY_RIGHT) {
    return handleRight({ selected, items, pageWidth });
  }

  if (keyCode === KEY_DOWN) {
    return handleDown({ selected, items, pageHeight });
  }

  if (keyCode === KEY_UP) {
    return handleUp({ selected, items });
  }

  return {
    newSelection: null
  };
};

export const onKeyPress = (e: KeyboardEvent, options: ?DirNavOptions) => {
  // Temporary solution until https://github.com/facebook/flow/issues/183 is fixed
  // I wanted to use beautiful destructuring with defaulting, but
  // Flow cannot parse them, so here's some shit code
  let focusableClass = (options && options.focusableClass) || DEFAULT_FOCUSABLE_CLASS;
  let selectedClass = (options && options.selectedClass) || DEFAULT_SELECTED_CLASS;
  let preventDefaultEvents = (options && options.preventDefaultEvents !== undefined)
    ? options.preventDefaultEvents
    : DEFAULT_PREVENT_DEFAULT_EVENTS;
  // End of shit code
  const selected = domQueryOneByClass(selectedClass);
  const items = domQueryAllByClass(focusableClass);
  const { keyCode, preventDefault } = e;

  if (selected) {
    if (keyCode === KEY_ENTER) {
      if (preventDefaultEvents) {
        preventDefault();
      }

      selected.click();
    }
  } else {
    if (items && items.length) {
      addClass(items[0], selectedClass);
    }

    return;
  }

  const pageWidth = getPageWidth();
  const pageHeight = getPageHeight();
  const { newSelection } = handleDirection({
    preventDefaultEvents,
    keyCode,
    preventDefault,
    pageWidth,
    pageHeight,
    selected,
    items
  });

  if (newSelection) {
    addClass(newSelection, selectedClass);
    removeClass(selected, selectedClass);
  }
};

export const initDirNav = (options: ?DirNavOptions) => {
  domAddEvent('keydown', (e: KeyboardEvent) => onKeyPress(e, options));
};
