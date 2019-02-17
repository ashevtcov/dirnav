import { areBoundsIntersecting } from '../dirnav';
import { expect } from 'chai';

describe('areBoundsIntersecting', () => {
  it('returns true if two rects intersect', () => {
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
});
