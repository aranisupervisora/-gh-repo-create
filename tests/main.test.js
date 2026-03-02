import test from 'node:test';
import assert from 'node:assert/strict';

import { calculateTotal } from '../src/index.js';

test('calculateTotal returns sum of price * quantity for all items', () => {
  const items = [
    { price: 10, quantity: 2 },
    { price: 3, quantity: 4 }
  ];

  assert.equal(calculateTotal(items), 32);
});
