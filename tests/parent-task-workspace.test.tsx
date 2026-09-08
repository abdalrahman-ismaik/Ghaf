import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function source(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf8');
}

describe('default-off Parent task workspace candidate', () => {
  it('keeps create outside lifecycle conditions and provides all-children and native rails', () => {
    const route = source('app/parent/index.tsx');
    const workspace = source('src/components/r002a/parent/ParentTaskWorkspace.tsx');
    expect(route).toContain('<ParentTaskWorkspace');
    expect(route).toContain('taskWorkspaceFeatureFlag');
    expect(workspace).toContain('testID="parent-tasks-create-task"');
    expect(workspace).toContain("'all'");
    expect(workspace).toContain('<FlatList');
    expect(workspace).toContain('horizontal');
    expect(workspace).not.toContain('autoPlay');
  });

  it('keeps saved Parent templates out of Child routes and preserves the sole executable task', () => {
    const child = source('app/child/index.tsx') + source('app/child/task.tsx');
    const composer = source('src/components/family-growth/ParentTaskComposer.tsx');
    expect(child).not.toMatch(/savedTaskTemplate|saved-task-template/u);
    expect(composer).toContain('selectedTemplateId === P0_RECYCLING_TEMPLATE.id');
    expect(composer).toContain('savedTaskTemplates');
  });

  it('defaults the independent candidate flag to off', () => {
    const flag = source('src/config/taskWorkspaceFeatureFlag.ts');
    expect(flag).toContain('=== true');
    expect(flag).toContain("=== 'true'");
    expect(flag).not.toMatch(/\?\?\s*true/u);
  });
});
