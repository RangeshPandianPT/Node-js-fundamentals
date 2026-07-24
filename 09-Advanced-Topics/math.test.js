const { add, subtract } = require('./math');

describe('Math Module', () => {
  test('should correctly add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });

  test('should correctly handle negative numbers in addition', () => {
    expect(add(-1, 5)).toBe(4);
  });

  test('should correctly subtract two numbers', () => {
    expect(subtract(10, 4)).toBe(6);
  });
});
