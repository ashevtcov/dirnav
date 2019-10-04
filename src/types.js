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
  defaultSelectionClass: ?string,
  preventDefaultEvents: ?boolean
};

export type DirectionResult = {
  newSelection: ?HTMLElement
};
