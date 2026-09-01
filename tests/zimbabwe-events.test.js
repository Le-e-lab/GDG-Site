import { describe, it, expect } from 'vitest';
import { isZimbabweEvent } from '../scripts/sync-gdg-events.mjs';

describe('GDG event sync — Zimbabwe filter', () => {
  it('keeps events from Africa University and Harare/Bulawayo chapters', () => {
    const keep = [
      { source_url: 'https://gdg.community.dev/events/details/google-gdg-harare-presents-devfest-harare' },
      { source_url: 'https://gdg.community.dev/events/details/gdg-on-campus-africa-university-presents-welcome' },
      { source_url: 'https://gdg.community.dev/events/details/google-gdg-bulawayo-presents-meetup' },
    ];
    keep.forEach(ev => expect(isZimbabweEvent(ev), ev.source_url).toBe(true));
  });

  it('rejects events from foreign chapters (Lusaka, Pretoria, global)', () => {
    const drop = [
      { source_url: 'https://gdg.community.dev/events/details/google-gdg-lusaka-presents-devfest-lusaka' },
      { source_url: 'https://gdg.community.dev/events/details/google-gdg-pretoria-presents-wtm-launch' },
      { source_url: 'https://gdg.community.dev/events/details/google-developers-presents-flutter-friends' },
      { title: 'Some random global event without a chapter slug' },
    ];
    drop.forEach(ev => expect(isZimbabweEvent(ev), JSON.stringify(ev)).toBe(false));
  });
});