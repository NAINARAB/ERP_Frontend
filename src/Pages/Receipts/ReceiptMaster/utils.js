// utils.mjs

// Local utility functions to handle floating point math
function add(a, b) {
  return +(a + b).toFixed(2);
}

function sub(a, b) {
  return +(a - b).toFixed(2);
}

function mul(a, b) {
  return +(a * b).toFixed(6); // More precision before rounding
}

function div(a, b) {
  return b !== 0 ? +(a / b).toFixed(6) : 0;
}

function roundNumber(value, precision = 2) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

function distributeAmountByQuantity(items, totalAmount) {
  const totalQuantity = items.reduce((sum, item) => add(sum, item.quantity), 0);
  const unitCost = div(totalAmount, totalQuantity);

  let distributed = 0;

  const result = items.map((item, index) => {
    if (index < items.length - 1) {
      const weightedAmount = roundNumber(mul(item.quantity, unitCost));
      distributed = add(distributed, weightedAmount);
      return {
        ...item,
        expence_value: weightedAmount,
      };
    } else {
      // Last item takes the remaining to ensure total matches exactly
      const lastValue = roundNumber(sub(totalAmount, distributed));
      return {
        ...item,
        expence_value: lastValue,
      };
    }
  });

  return result;
}
