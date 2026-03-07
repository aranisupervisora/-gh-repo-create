export function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new TypeError('items must be an array');
  }

  return items.reduce((acc, item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new TypeError(`item at index ${index} must be an object`);
    }

    const { price, quantity } = item;

    if (!Number.isFinite(price) || !Number.isFinite(quantity)) {
      throw new TypeError(`item at index ${index} must include finite price and quantity numbers`);
    }

    return acc + (price * quantity);
  }, 0);
}
