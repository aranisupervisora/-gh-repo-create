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

test('calculateTotal throws when input is not an array', () => {
  assert.throws(
    () => calculateTotal(null),
    /items must be an array/
  );
});

test('calculateTotal throws when an item is not an object', () => {
  assert.throws(
    () => calculateTotal([1]),
    /item at index 0 must be an object/
  );
});

test('calculateTotal throws when price or quantity is not finite', () => {
  assert.throws(
    () => calculateTotal([{ price: 10, quantity: Number.NaN }]),
    /item at index 0 must include finite price and quantity numbers/
  );
});
