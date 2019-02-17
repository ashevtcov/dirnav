# Overview
Directional navigation library for JavaScript applications to support 10 foot (TV) experience

# Installation
To install run `npm i dirnav`

# Usage Example
Initialize navigation on application load using code below.

```javascript
import { initDirNav } from 'dirnav';

initDirNav({
  focusableClass: 'focusable',
  selectedClass: 'selected'
});
```

> All options are optional as well as the argument

Then, you can mark elements, that are supposed to receive focus with `focusable` class, the `selected` class will be used to indicate current selection (do not set it in your DOM).

```html
  <div>
    <div className='focusable'>One</div>
    <div className='focusable'>Two</div>
    <div className='focusable'>Three</div>
  </div>
```

Mark any `focusable` element with `default-selection` class so the library can pre-select it.

```html
  <div>
    <div className='focusable default-selection'>One</div>
    <div className='focusable'>Two</div>
    <div className='focusable'>Three</div>
  </div>
```

After all DOM elements are created, call the following method to execute pre-selection.

```javascript
import { selectDefaultItem } from 'dirnav';

selectDefaultItem({
  defaultSelectionClass: 'default-selection'
});
```
