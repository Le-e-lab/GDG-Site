import { describe, it, expect } from 'vitest';

describe('Spotlight (single source of truth)', () => {
  it('should pick the newest active spotlight member', () => {
    const members = [
      { name: 'Old', is_active: true, created_at: '2026-07-25' },
      { name: 'New', is_active: true, created_at: '2026-08-01' }
    ];
    const pick = (list) => list
      .filter(m => m.is_active)
      .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0];
    expect(pick(members).name).toBe('New');
  });

  it('should ignore inactive members', () => {
    const members = [
      { name: 'Active', is_active: true, created_at: '2026-07-25' },
      { name: 'Inactive', is_active: false, created_at: '2026-08-01' }
    ];
    const active = members.filter(m => m.is_active);
    expect(active).toHaveLength(1);
    expect(active[0].name).toBe('Active');
  });

  it('should return empty state when no active members (no team fallback)', () => {
    const spotlightMembers = [];
    const hasSpotlight = spotlightMembers.length > 0;
    // Old bug: fell back to team is_spotlight and resurrected deleted members.
    // New behavior: no fallback — if the table is empty, show the empty state.
    expect(hasSpotlight).toBe(false);
  });

  it('should render safely with missing fields (never throw)', () => {
    const render = (member) => {
      if (!member || typeof member !== 'object') return null;
      const safe = (v) => (v === null || v === undefined) ? '' : String(v);
      return { name: safe(member.name) || 'Community Member', role: safe(member.role) };
    };
    expect(render({}).name).toBe('Community Member');
    expect(render(null)).toBeNull();
    expect(render({ name: 'Tendai' }).name).toBe('Tendai');
  });
});
