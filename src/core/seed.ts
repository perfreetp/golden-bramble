import type { Klass, Project, Submission, Task } from './types.js';
import { uid } from './math.js';
import { buildRobotSkeleton } from '../skeleton/presets.js';
import { autoGrade, putKeyframe } from '../anim/timeline.js';
import type { EasingKind } from './types.js';

export function seedKlasses(): Klass[] {
  const names = ['陈思远', '林晓彤', '王梓豪', '赵一诺', '孙明哲', '周雨桐'];
  return [
    {
      id: 'k1',
      name: '机器人舞蹈班 2026 秋 (1)班',
      students: names.map((name, i) => ({ id: `s${i + 1}`, name })),
    },
  ];
}

export function seedTasks(): Task[] {
  return [
    {
      id: 't1',
      title: '机器人挥手舞蹈',
      desc: '为机器人编排一段 6 秒的挥手舞蹈：右臂抬起并连续摆动 3 次以上，腰部配合轻微转动，动作需流畅无速度突变。要求至少 12 个关键帧，关节摆动范围不小于 80°。',
      rubric: {
        minKeyframes: 12,
        angleRangeDeg: 80,
        durationSec: 6,
        jumpTolerance: 14,
      },
      deadline: '2026-11-30',
      createdAt: Date.now() - 7 * 86400_000,
    },
    {
      id: 't2',
      title: '机器人转身亮相',
      desc: '编排一段 4 秒的转身亮相动作：基座旋转、双臂展开并定格。至少 8 个关键帧。',
      rubric: {
        minKeyframes: 8,
        angleRangeDeg: 60,
        durationSec: 4,
        jumpTolerance: 16,
      },
      deadline: '2026-12-15',
      createdAt: Date.now() - 2 * 86400_000,
    },
  ];
}

/** 构造一个挥手舞蹈示例工程 */
function buildWaveProject(studentId: string, taskId: string, polished: boolean): Project {
  const skeleton = buildRobotSkeleton();
  const byName = new Map(skeleton.map((b) => [b.name, b]));
  const project: Project = {
    id: uid('proj'),
    taskId,
    studentId,
    name: polished ? '挥手舞蹈-完整版' : '挥手舞蹈-练习稿',
    fps: 12,
    frameCount: 72,
    skeleton,
    keyframes: [],
    updatedAt: Date.now() - 86400_000,
    submitted: polished,
  };

  const kf = (boneName: string, frame: number, angle: number, easing: EasingKind = 'easeInOut'): void => {
    const bone = byName.get(boneName);
    if (bone) putKeyframe(project, bone.id, frame, angle, easing);
  };

  // 右臂抬起（大臂局部角：180 下垂 → -60 上举）
  kf('右大臂', 0, 180, 'linear');
  kf('右大臂', 12, -60, 'easeInOut');
  kf('右大臂', 66, -60, 'linear');
  kf('右大臂', 71, 180, 'easeInOut');

  // 小臂挥手摆动
  kf('右小臂', 0, 0);
  kf('右小臂', 12, -40);
  kf('右小臂', 20, -100, polished ? 'easeInOut' : 'linear');
  kf('右小臂', 28, -30);
  kf('右小臂', 36, -100);
  kf('右小臂', 44, -30);
  kf('右小臂', 52, -95);
  kf('右小臂', 60, -35);
  kf('右小臂', 66, -40);
  kf('右小臂', 71, 0);

  // 腕部配合
  kf('右腕', 12, 0);
  kf('右腕', 20, polished ? 25 : 45, 'bezier');
  kf('右腕', 28, -20);
  kf('右腕', 36, 25);
  kf('右腕', 44, -20);
  kf('右腕', 52, 20);
  kf('右腕', 60, -15);
  kf('右腕', 71, 0);

  // 夹爪
  kf('右夹爪', 12, 0);
  kf('右夹爪', 36, 12);
  kf('右夹爪', 60, -12);
  kf('右夹爪', 71, 0);

  // 腰部轻微转动
  kf('腰', 0, 0);
  kf('腰', 12, 12);
  kf('腰', 36, -12);
  kf('腰', 60, 10);
  kf('腰', 71, 0);

  // 头部跟随
  kf('头部', 0, 0);
  kf('头部', 24, 15);
  kf('头部', 48, -15);
  kf('头部', 71, 0);

  // 练习稿故意制造跳变：在第 30 帧插入突兀角度
  if (!polished) {
    kf('右腕', 30, -55, 'linear');
  }
  return project;
}

export interface SeedBundle {
  tasks: Task[];
  klasses: Klass[];
  projects: Project[];
  submissions: Submission[];
}

export function buildSeedBundle(): SeedBundle {
  const tasks = seedTasks();
  const klasses = seedKlasses();
  const task = tasks[0];

  const polished = buildWaveProject('s1', task.id, true);
  const draft = buildWaveProject('s2', task.id, false);

  const projects = [polished, draft];
  const submissions: Submission[] = [];

  // s1 已提交且已复核
  {
    const grade = autoGrade(polished, task.rubric);
    submissions.push({
      id: uid('sub'),
      projectId: polished.id,
      taskId: task.id,
      studentId: 's1',
      klassId: 'k1',
      status: 'reviewed',
      autoScore: grade.total,
      autoMax: 60,
      autoItems: grade.items,
      jumpFrames: grade.jumpFrames,
      teacherScore: 36,
      teacherMax: 40,
      errors: [],
      teacherComment: '挥手节奏清晰，腰部联动自然，整体流畅。',
      submittedAt: Date.now() - 20 * 3600_000,
      reviewedAt: Date.now() - 10 * 3600_000,
    });
  }

  // s2 已提交待复核（含跳变）
  {
    const grade = autoGrade(draft, task.rubric);
    submissions.push({
      id: uid('sub'),
      projectId: draft.id,
      taskId: task.id,
      studentId: 's2',
      klassId: 'k1',
      status: 'submitted',
      autoScore: grade.total,
      autoMax: 60,
      autoItems: grade.items,
      jumpFrames: grade.jumpFrames,
      teacherScore: null,
      teacherMax: 40,
      errors: [],
      teacherComment: '',
      submittedAt: Date.now() - 3 * 3600_000,
      reviewedAt: null,
    });
  }

  return { tasks, klasses, projects, submissions };
}
