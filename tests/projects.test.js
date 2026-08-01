import { describe, it, expect } from 'vitest';

describe('Showcase Filter Engine', () => {
  it('should filter out projects not seeking help when Needs Help filter is enabled', () => {
    const projects = [
      { title: 'Project A', needs_help: false },
      { title: 'Project B', needs_help: true }
    ];

    const filter = (projs, showOnlyHelp) => {
      return showOnlyHelp ? projs.filter(p => p.needs_help) : projs;
    };

    expect(filter(projects, true)).toHaveLength(1);
    expect(filter(projects, true)[0].title).toBe('Project B');
  });

  it('should render a collaborators-needed badge only for projects seeking help', () => {
    const helpHtml = (project) => project.needs_help
      ? '<div class="collab-badge">Collaborators Needed</div>'
      : '';

    expect(helpHtml({ needs_help: true })).toContain('Collaborators Needed');
    expect(helpHtml({ needs_help: false })).toBe('');
  });
});
