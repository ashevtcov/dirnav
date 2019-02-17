import { expect } from 'chai';
import {
  areBoundsIntersecting,
  sortByRightDesc,
  sortByLeftAsc,
  sortByBottomDesc,
  sortByTopAcs,
  addClass,
  removeClass
} from '../src/utils';
import { makeClassList } from './mocks/dom-mocks';

describe('utils', () => {
  describe('classList utils', () => {
    const makeElement = (...defaultClasses) => ({
      classList: makeClassList(...defaultClasses)
    });

    it('makeElement util', () => {
      // A test for test - how funny is that!
      const element1 = makeElement('default');

      expect(element1.classList.dictionary['default']).to.exist;
      expect(element1.classList.contains('default')).to.be.true;

      const element2 = makeElement();

      expect(Object.keys(element2.classList.dictionary)).to.have.lengthOf(0);

      const element3 = makeElement('1', 'b', '!');

      expect(Object.keys(element3.classList.dictionary)).to.have.lengthOf(3);
      expect(element3.classList.dictionary['1']).to.exist;
      expect(element3.classList.contains('1')).to.be.true;
      expect(element3.classList.dictionary['b']).to.exist;
      expect(element3.classList.contains('b')).to.be.true;
      expect(element3.classList.dictionary['!']).to.exist;
      expect(element3.classList.contains('!')).to.be.true;
    });

    it('addClass', () => {
      const element = makeElement('default');
      addClass(element, 'test-class-1');

      expect(element.classList.dictionary['test-class-1']).to.exist;
    });

    it('removeClass', () => {
      const element = makeElement('default');
      removeClass(element, 'default');

      expect(element.classList.dictionary['test-class-1']).to.not.exist;
    });
  });

  describe('sorters', () => {
    it('sortByRightDesc', () => {
      const list = [{
        id: 2,
        getBoundingClientRect: () => ({ right: 3.3 })
      }, {
        id: 0,
        getBoundingClientRect: () => ({ right: 1.1 })
      }, {
        id: 1,
        getBoundingClientRect: () => ({ right: 2.2 })
      }];

      const result = list.sort(sortByRightDesc);

      expect(result).to.have.lengthOf(3);
      expect(result[0].id).to.equal(2);
      expect(result[1].id).to.equal(1);
      expect(result[2].id).to.equal(0);
    });

    it('sortByLeftAsc', () => {
      const list = [{
        id: 2,
        getBoundingClientRect: () => ({ left: 3.3 })
      }, {
        id: 0,
        getBoundingClientRect: () => ({ left: 1.1 })
      }, {
        id: 1,
        getBoundingClientRect: () => ({ left: 2.2 })
      }];

      const result = list.sort(sortByLeftAsc);

      expect(result).to.have.lengthOf(3);
      expect(result[0].id).to.equal(0);
      expect(result[1].id).to.equal(1);
      expect(result[2].id).to.equal(2);
    });

    it('sortByBottomDesc', () => {
      const list = [{
        id: 2,
        getBoundingClientRect: () => ({ bottom: 3.3 })
      }, {
        id: 0,
        getBoundingClientRect: () => ({ bottom: 1.1 })
      }, {
        id: 1,
        getBoundingClientRect: () => ({ bottom: 2.2 })
      }];

      const result = list.sort(sortByBottomDesc);

      expect(result).to.have.lengthOf(3);
      expect(result[0].id).to.equal(2);
      expect(result[1].id).to.equal(1);
      expect(result[2].id).to.equal(0);
    });

    it('sortByTopAsc', () => {
      const list = [{
        id: 2,
        getBoundingClientRect: () => ({ top: 3.3 })
      }, {
        id: 0,
        getBoundingClientRect: () => ({ top: 1.1 })
      }, {
        id: 1,
        getBoundingClientRect: () => ({ top: 2.2 })
      }];

      const result = list.sort(sortByTopAcs);

      expect(result).to.have.lengthOf(3);
      expect(result[0].id).to.equal(0);
      expect(result[1].id).to.equal(1);
      expect(result[2].id).to.equal(2);
    });
  });

  describe('areBoundsIntersecting', () => {
    it('returns false if two rectangles do not intersect', () => {
      const a = {
        top: 1.2,
        left: 4.5,
        right: 5.1,
        bottom: 7.0
      };
      const b = {
        top: 30.0,
        left: 30.1,
        right: 50.3,
        bottom: 50.1
      };
      const result = areBoundsIntersecting(a, b);

      expect(result).to.be.false;
    });

    it('returns true if two rectangles intersect', () => {
      const a = {
        top: 1.2,
        left: 4.5,
        right: 10.1,
        bottom: 12.0
      };
      const b = {
        top: 3.0,
        left: 6.1,
        right: 15.3,
        bottom: 20.1
      };
      const result = areBoundsIntersecting(a, b);

      expect(result).to.be.true;
    });

    it('returns true if one rectangle include another', () => {
      const a = {
        top: 1.2,
        left: 4.5,
        right: 100.1,
        bottom: 120.0
      };
      const b = {
        top: 3.0,
        left: 6.1,
        right: 15.3,
        bottom: 20.1
      };
      const c = {
        top: 3.0,
        left: 6.1,
        right: 15.3,
        bottom: 20.1
      };
      const d = {
        top: 1.2,
        left: 4.5,
        right: 100.1,
        bottom: 120.0
      };
      const result1 = areBoundsIntersecting(a, b);
      const result2 = areBoundsIntersecting(c, d);

      expect(result1).to.be.true;
      expect(result2).to.be.true;
    });
  });
});
