import { expect } from 'chai';
import { stub } from 'sinon';
import proxyquire from 'proxyquire';
import {
  KEY_LEFT,
  KEY_RIGHT,
  KEY_DOWN,
  KEY_UP,
  KEY_ENTER,
  DEFAULT_FOCUSABLE_CLASS,
  DEFAULT_SELECTED_CLASS,
  DEFAULT_DEFAULT_SELECTION_CLASS,
  NEXT_UP_CLASS,
  NEXT_DOWN_CLASS,
  NEXT_LEFT_CLASS,
  NEXT_RIGHT_CLASS
} from '../src/constants';
import { makeClassList } from './mocks/dom-mocks';

describe('dirnav', () => {
  let preventDefault, selectDefaultItem, onKeyPress, initDirNav, click;
  let domQueryOne, domQueryOneByClass, domQueryAllByClass, domAddEvent, getPageWidth, getPageHeight;

  const makeEvent = (keyCode) => ({ keyCode, preventDefault });
  const makeElement = (...defaultClasses) => ({
    classList: makeClassList(...defaultClasses),
    getBoundingClientRect: stub(),
    click,
    getAttribute: stub()
  });
  const isSelected = ({ classList }) => classList.contains(DEFAULT_SELECTED_CLASS);

  beforeEach(() => {
    preventDefault = stub();
    click = stub();
    domQueryOne = stub();
    domQueryOneByClass = stub();
    domQueryAllByClass = stub().returns([]);
    domAddEvent = stub();
    getPageWidth = stub().returns(1024);
    getPageHeight = stub().returns(768);

    ({ selectDefaultItem, onKeyPress, initDirNav } = proxyquire('../src/dirnav', {
      './dom': {
        domQueryOneByClass,
        domQueryAllByClass,
        domAddEvent,
        getPageWidth,
        getPageHeight,
        domQueryOne
      }
    }));

    // Not proxyquiring utils deliberately (and will not accept any PRs on that)
    // Well, this test definitely has a flavor of an integration one, because
    // if I mock/stub/proxyquire all my utils, it will be a... mockery, whereas
    // I actually want to test the algorithm, with specified input and expected output
  });

  describe('initDirNav', () => {
    it('adds keydown dom event', () => {
      // TBD: Improve this test
      initDirNav();

      expect(domAddEvent).to.have.been.calledWith('keydown');
    });
  });

  describe('options', () => {
    describe('onKeyPress options', () => {
      it('uses default focusableClass and selectedClass if not provided', () => {
        onKeyPress(makeEvent(KEY_UP));

        expect(domQueryAllByClass).to.have.been.calledWith(DEFAULT_FOCUSABLE_CLASS);
        expect(domQueryOneByClass).to.have.been.calledWith(DEFAULT_SELECTED_CLASS);
      });

      it('uses explicit focusableClass and selectedClass if provided', () => {
        onKeyPress(makeEvent(KEY_UP), {
          focusableClass: 'test1',
          selectedClass: 'test2'
        });

        expect(domQueryAllByClass).to.have.been.calledWith('test1');
        expect(domQueryAllByClass).to.have.not.been.calledWith(DEFAULT_FOCUSABLE_CLASS);
        expect(domQueryOneByClass).to.have.been.calledWith('test2');
        expect(domQueryOneByClass).to.have.not.been.calledWith(DEFAULT_SELECTED_CLASS);
      });

      describe('prevent default event behavior option', () => {
        beforeEach(() => {
          domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(
            makeElement(DEFAULT_SELECTED_CLASS, DEFAULT_FOCUSABLE_CLASS)
          );
          domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns([
            makeElement(DEFAULT_FOCUSABLE_CLASS)
          ]);
        });

        it('prevents default event behavior if otherwise is not instructed', () => {
          onKeyPress(makeEvent(KEY_ENTER));

          expect(preventDefault).to.have.been.called;
        });

        it('uses default event behavior if instructed by preventDefaultEvents option', () => {
          onKeyPress(makeEvent(KEY_ENTER), {
            preventDefaultEvents: false
          });

          expect(preventDefault).to.have.not.been.called;
        });
      });
    });

    describe('selectDefaultItem options', () => {
      it('uses default selectedClass and defaultSelectionClass if not provided', () => {
        selectDefaultItem();

        expect(domQueryAllByClass).to.have.been.calledWith(DEFAULT_SELECTED_CLASS);
        expect(domQueryOneByClass).to.have.been.calledWith(DEFAULT_DEFAULT_SELECTION_CLASS);
      });

      it('uses explicit selectedClass and defaultSelectionClass if provided', () => {
        selectDefaultItem({
          selectedClass: 'test1',
          defaultSelectionClass: 'test2'
        });

        expect(domQueryAllByClass).to.have.been.calledWith('test1');
        expect(domQueryAllByClass).to.have.not.been.calledWith(DEFAULT_SELECTED_CLASS);
        expect(domQueryOneByClass).to.have.been.calledWith('test2');
        expect(domQueryOneByClass).to.have.not.been.calledWith(DEFAULT_DEFAULT_SELECTION_CLASS);
      });
    });
  });

  describe('selectDefaultItem', () => {
    it('select explicitly set default element', () => {
      const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS);
      const defaultSelected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_DEFAULT_SELECTION_CLASS);

      domQueryAllByClass.withArgs(DEFAULT_SELECTED_CLASS).returns([selected]);
      domQueryOneByClass.withArgs(DEFAULT_DEFAULT_SELECTION_CLASS).returns(defaultSelected);

      selectDefaultItem();

      expect(isSelected(selected)).to.be.false;
      expect(isSelected(defaultSelected)).to.be.true;
    });

    it('select first focusable as a default element', () => {
      const first = makeElement(DEFAULT_FOCUSABLE_CLASS);
      const second = makeElement(DEFAULT_FOCUSABLE_CLASS);

      domQueryAllByClass.withArgs(DEFAULT_SELECTED_CLASS).returns([first, second]);
      domQueryOneByClass.withArgs(DEFAULT_DEFAULT_SELECTION_CLASS).returns(null);

      selectDefaultItem();

      expect(isSelected(first)).to.be.true;
      expect(isSelected(second)).to.be.false;
    });
  });

  describe('actions', () => {
    describe('KEY_ENTER', () => {
      it('no selection, no focusables', () => {
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns();
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns([]);

        onKeyPress(makeEvent(KEY_ENTER));

        expect(preventDefault).to.have.not.been.called;
        expect(click).to.have.not.been.called;
      });

      it('no selection, one focusable', () => {
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns();
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns([
          makeElement(DEFAULT_FOCUSABLE_CLASS)
        ]);

        onKeyPress(makeEvent(KEY_ENTER));

        expect(preventDefault).to.have.not.been.called;
        expect(click).to.have.not.been.called;
      });
    });

    describe('KEY_UP', () => {
      it('selects next focusable above within vertical search area above of the same width', () => {
        const selectedRect = {
          bottom: 49, top: 40,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 39, top: 30,
          left: 40, right: 50
        });
        items[2].getBoundingClientRect.returns({
          bottom: 29, top: 20,
          left: 40, right: 50
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_UP));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('selects a hardcoded element above', () => {
        const selectedRect = {
          bottom: 49, top: 40,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);
        selected.getAttribute.withArgs(NEXT_UP_CLASS).returns('.three');

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 39, top: 30,
          left: 40, right: 50
        });
        items[2].getBoundingClientRect.returns({
          bottom: 29, top: 20,
          left: 40, right: 50
        });

        domQueryOne.withArgs('.three').returns(items[2]);
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_UP));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.true;
      });

      it('selects next focusable element, overlapping vertical search area above', () => {
        const selectedRect = {
          bottom: 49, top: 40,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 39, top: 30,
          left: 35, right: 45
        });
        items[2].getBoundingClientRect.returns({
          bottom: 29, top: 20,
          left: 40, right: 50
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_UP));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('does not change selection if no items overlap vertical search area above', () => {
        const selectedRect = {
          bottom: 19, top: 10,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'four')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 39, top: 30,
          left: 40, right: 50
        });
        items[2].getBoundingClientRect.returns({
          bottom: 19, top: 10,
          left: 10, right: 20
        });
        items[3].getBoundingClientRect.returns({
          bottom: 9, top: 0,
          left: 5, right: 15
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_UP));

        expect(isSelected(items[0])).to.be.true;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.false;
        expect(isSelected(items[3])).to.be.false;
      });
    });

    describe('KEY_DOWN', () => {
      it('selects next focusable below within vertical search area above of the same width', () => {
        const selectedRect = {
          bottom: 19, top: 10,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 29, top: 20,
          left: 40, right: 50
        });
        items[2].getBoundingClientRect.returns({
          bottom: 39, top: 30,
          left: 40, right: 50
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_DOWN));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('selects a hardcoded element below', () => {
        const selectedRect = {
          bottom: 19, top: 10,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);
        selected.getAttribute.withArgs(NEXT_DOWN_CLASS).returns('.three');

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 29, top: 20,
          left: 40, right: 50
        });
        items[2].getBoundingClientRect.returns({
          bottom: 39, top: 30,
          left: 40, right: 50
        });

        domQueryOne.withArgs('.three').returns(items[2]);
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_DOWN));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.true;
      });

      it('selects next focusable element, overlapping vertical search area below', () => {
        const selectedRect = {
          bottom: 19, top: 10,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 29, top: 20,
          left: 35, right: 45
        });
        items[2].getBoundingClientRect.returns({
          bottom: 39, top: 30,
          left: 40, right: 50
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_DOWN));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('does not change selection if no items overlap vertical search area below', () => {
        const selectedRect = {
          bottom: 39, top: 30,
          left: 40, right: 50
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'four')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 29, top: 20,
          left: 40, right: 50
        });
        items[2].getBoundingClientRect.returns({
          bottom: 19, top: 10,
          left: 10, right: 20
        });
        items[3].getBoundingClientRect.returns({
          bottom: 49, top: 40,
          left: 5, right: 15
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_DOWN));

        expect(isSelected(items[0])).to.be.true;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.false;
        expect(isSelected(items[3])).to.be.false;
      });
    });

    describe('KEY_LEFT', () => {
      it('selects next focusable on the left within horizontal search area of the same height', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 40, right: 49
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 20, right: 29
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_LEFT));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('selects a hardcoded element on the left', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 40, right: 49
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);
        selected.getAttribute.withArgs(NEXT_LEFT_CLASS).returns('.three');

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 20, right: 29
        });

        domQueryOne.withArgs('.three').returns(items[2]);
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_LEFT));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.true;
      });

      it('selects next focusable element, overlapping vertical search area on the left', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 40, right: 49
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 55, top: 45,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 20, right: 29
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_LEFT));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('does not change selection if no items overlap horizontal search area on the left', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 20, right: 29
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'four')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 40, right: 49
        });
        items[3].getBoundingClientRect.returns({
          bottom: 5, top: 15,
          left: 10, right: 19
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_LEFT));

        expect(isSelected(items[0])).to.be.true;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.false;
        expect(isSelected(items[3])).to.be.false;
      });
    });

    describe('KEY_RIGHT', () => {
      it('selects next focusable on the right within horizontal search area above of the same height', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 20, right: 29
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 40, right: 49
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_RIGHT));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('selects a hardcoded element on the right', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 20, right: 29
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);
        selected.getAttribute.withArgs(NEXT_RIGHT_CLASS).returns('.three');

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 40, right: 49
        });

        domQueryOne.withArgs('.three').returns(items[2]);
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_RIGHT));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.true;
      });

      it('selects next focusable element, overlapping vertical search area on the right', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 20, right: 29
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 55, top: 45,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 40, right: 49
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_RIGHT));

        expect(isSelected(items[0])).to.be.false;
        expect(isSelected(items[1])).to.be.true;
        expect(isSelected(items[2])).to.be.false;
      });

      it('does not change selection if no items overlap horizontal search area on the right', () => {
        const selectedRect = {
          bottom: 50, top: 40,
          left: 40, right: 49
        };
        const selected = makeElement(DEFAULT_FOCUSABLE_CLASS, DEFAULT_SELECTED_CLASS, 'one');
        selected.getBoundingClientRect.returns(selectedRect);

        const items = [
          selected,
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'two'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'three'),
          makeElement(DEFAULT_FOCUSABLE_CLASS, 'four')
        ];
        items[1].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 30, right: 39
        });
        items[2].getBoundingClientRect.returns({
          bottom: 50, top: 40,
          left: 20, right: 29
        });
        items[3].getBoundingClientRect.returns({
          bottom: 5, top: 15,
          left: 50, right: 59
        });

        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns(selected);
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns(items);

        onKeyPress(makeEvent(KEY_RIGHT));

        expect(isSelected(items[0])).to.be.true;
        expect(isSelected(items[1])).to.be.false;
        expect(isSelected(items[2])).to.be.false;
        expect(isSelected(items[3])).to.be.false;
      });
    });
  });
});
