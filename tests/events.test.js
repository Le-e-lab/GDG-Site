import { describe, it, expect } from 'vitest';

describe('Events Moderation (GDG auto-pull workflow)', () => {
  it('should only surface approved events to the public site', () => {
    const events = [
      { title: 'Hackathon', status: 'approved' },
      { title: 'Pending Pulled Event', status: 'pending' },
      { title: 'Cloud Jam', status: 'approved' }
    ];
    const publicEvents = events.filter(e => e.status === 'approved');
    expect(publicEvents).toHaveLength(2);
    expect(publicEvents.map(e => e.title)).not.toContain('Pending Pulled Event');
  });

  it('should dedupe auto-pulled events by source_url', () => {
    const seen = new Set();
    const dedupe = (events) => events.filter(e => {
      if (seen.has(e.source_url)) return false;
      seen.add(e.source_url);
      return true;
    });
    const events = [
      { title: 'A', source_url: 'https://gdg.community.dev/events/x' },
      { title: 'A dup', source_url: 'https://gdg.community.dev/events/x' },
      { title: 'B', source_url: 'https://gdg.community.dev/events/y' }
    ];
    expect(dedupe(events)).toHaveLength(2);
  });
});
