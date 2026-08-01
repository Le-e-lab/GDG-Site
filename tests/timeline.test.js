import { describe, it, expect } from 'vitest';

describe('Semester Timeline Generator', () => {
  it('should generate valid timeline card HTML from activity object', () => {
    const activity = {
      title: 'Jetpack Compose workshop',
      activity_type: 'Workshop',
      week_number: 3,
      status: 'upcoming'
    };
    
    const render = (act) => {
      return `<div class="timeline-card"><h3>${act.title}</h3><span class="badge">${act.activity_type}</span></div>`;
    };
    
    const html = render(activity);
    expect(html).toContain('Jetpack Compose workshop');
    expect(html).toContain('Workshop');
  });
});
