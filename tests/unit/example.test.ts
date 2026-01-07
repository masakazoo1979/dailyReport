import { describe, it, expect } from 'vitest';

describe('Example Unit Test', () => {
  it('should add two numbers', () => {
    expect(1 + 1).toBe(2);
  });

  it('should check string equality', () => {
    expect('hello').toBe('hello');
  });

  it('should check object properties', () => {
    const user = { name: 'Test User', role: 'SALES' };
    expect(user).toHaveProperty('name', 'Test User');
    expect(user.role).toBe('SALES');
  });
});
