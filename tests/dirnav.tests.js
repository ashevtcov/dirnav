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
  DEFAULT_DEFAULT_SELECTION_CLASS
} from '../src/constants';
import { makeClassList } from './mocks/dom-mocks';

describe('dirnav', () => {
  let preventDefault, getBoundingClientRect, selectDefaultItem, onKeyPress, click;
  let domQueryOneByClass, domQueryAllByClass, domAddEvent,
    getPageWidth, getPageHeight;

  const makeEvent = (keyCode) => ({ keyCode, preventDefault });
  const makeElement = (...defaultClasses) => ({
    classList: makeClassList(...defaultClasses),
    getBoundingClientRect,
    click
  });

  beforeEach(() => {
    preventDefault = stub();
    getBoundingClientRect = stub().returns();
    click = stub();
    domQueryOneByClass = stub();
    domQueryAllByClass = stub().returns([]);
    domAddEvent = stub();
    getPageWidth = stub().returns(1024);
    getPageHeight = stub().returns(768);

    ({ selectDefaultItem, onKeyPress } = proxyquire('../src/dirnav', {
      './dom': {
        domQueryOneByClass,
        domQueryAllByClass,
        domAddEvent,
        getPageWidth,
        getPageHeight
      }
    }));

    // Not proxyquiring utils deliberately (and will not accept any PRs on that)
    // Well, this test definitely has a flavor of an integration one, because
    // if I mock/stub/proxyquire all my utils, it will be a... mockery, whereas
    // I actually want to test the algorithm, with specified input and expected output
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

  describe('actions', () => {
    describe('KEY_ENTER', () => {
      it('no selection, no focusables', () => {
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns();
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns([]);

        onKeyPress({ keyCode: KEY_ENTER });

        expect(preventDefault).to.have.not.been.called;
        expect(click).to.have.not.been.called;
      });

      it('no selection, one focusable', () => {
        domQueryOneByClass.withArgs(DEFAULT_SELECTED_CLASS).returns();
        domQueryAllByClass.withArgs(DEFAULT_FOCUSABLE_CLASS).returns([
          makeElement(DEFAULT_FOCUSABLE_CLASS)
        ]);

        onKeyPress({ keyCode: KEY_ENTER });

        expect(preventDefault).to.have.not.been.called;
        expect(click).to.have.not.been.called;
      });
    });
  });
});
