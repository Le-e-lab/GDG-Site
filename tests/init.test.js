import { describe, it, expect } from 'vitest';

describe('Project Environment Initialization', () => {
  it('should confirm package configuration type is module', async () => {
    const pkg = await import('../package.json');
    expect(pkg.default.type).toBe('module');
  });
});
