/**
 * ES Module Exports Demonstration
 * -------------------------------
 * In ES Modules, you use 'export' keyword instead of 'module.exports'.
 * You can have multiple named exports and at most one default export per file.
 */

// 1. Named Exports
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;
export const divide = (a, b) => {
  if (b === 0) throw new Error('Division by zero is not allowed!');
  return a / b;
};

// 2. Default Export
export default class AdvancedCalculator {
  constructor(initialValue = 0) {
    this.value = initialValue;
  }

  power(exponent) {
    this.value = Math.pow(this.value, exponent);
    return this;
  }

  sqrt() {
    this.value = Math.sqrt(this.value);
    return this;
  }

  getResult() {
    return this.value;
  }
}
