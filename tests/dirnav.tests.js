import { expect } from 'chai';
import { stub } from 'sinon';
import proxyquire from 'proxyquire';
import { KEY_LEFT } from '../src/constants';

describe('dirnav', () => {
  let onKeyPress;
  let domQueryOneByClass, domQueryAllByClass, domAddEvent,
    getPageWidth, getPageHeight;

  beforeEach(() => {
    domQueryOneByClass = stub();
    domQueryAllByClass = stub();
    domAddEvent = stub();
    getPageWidth = stub().returns(1024);
    getPageHeight = stub().returns(768);

    ({ onKeyPress } = proxyquire('../src/dirnav', {
      './dom': {
        domQueryOneByClass,
        domQueryAllByClass,
        domAddEvent,
        getPageWidth,
        getPageHeight
      }
    }));
  });

  describe('directions', () => {
    it('right', () => {
      onKeyPress({ keyCode: KEY_LEFT });

      // TBD
    });
  });
});
