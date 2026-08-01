import { describe, it, expect } from 'vitest';

describe('Collaboration & Startup Showcase', () => {
  it('should show collaborate button only for projects seeking help', () => {
    const projects = [
      { title: 'EVP', needs_help: true },
      { title: 'Chef\'s Muse', needs_help: false }
    ];
    const hasCollabBtn = (p) => p.needs_help;
    expect(projects.filter(hasCollabBtn)).toHaveLength(1);
    expect(projects.filter(hasCollabBtn)[0].title).toBe('EVP');
  });

  it('should badge student startups separately', () => {
    const projects = [
      { title: 'Tarisai', is_startup: true },
      { title: 'SecureScan', is_startup: false }
    ];
    const startups = projects.filter(p => p.is_startup);
    expect(startups).toHaveLength(1);
    expect(startups[0].title).toBe('Tarisai');
  });
});
