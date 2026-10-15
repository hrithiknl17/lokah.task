import { describe, expect, it } from 'vitest';
import type { DescribeImageTask } from '../types';
import { TASKS } from './tasks';

// Lists files only; nothing is imported.
const IMAGE_FILES = Object.keys(import.meta.glob('/public/images/*')).map((path) =>
  path.replace('/public', ''),
);

const imageTasks = TASKS.filter((t): t is DescribeImageTask => t.kind === 'describe_image');

describe('Describe an Image task data', () => {
  it('has three image tasks', () => {
    expect(imageTasks.map((t) => t.id)).toEqual(['di-01', 'di-02', 'di-03']);
  });

  it.each(imageTasks.map((t) => [t.id, t] as const))('%s: image file exists', (_id, task) => {
    expect(IMAGE_FILES).toContain(task.imageSrc);
  });

  it.each(imageTasks.map((t) => [t.id, t] as const))('%s: declares 640×480', (_id, task) => {
    expect([task.imageWidth, task.imageHeight]).toEqual([640, 480]);
  });

  it.each(imageTasks.map((t) => [t.id, t] as const))(
    '%s: alt text is written in English and Kannada',
    (_id, task) => {
      expect(task.imageAlt.en.length).toBeGreaterThan(20);
      expect(task.imageAlt.kn?.length ?? 0).toBeGreaterThan(20);
      expect(task.imageAlt.en).not.toMatch(/TODO/);
    },
  );
});
