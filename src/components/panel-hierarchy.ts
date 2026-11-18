import type { Bone, Project } from '../core/types.js';
import { h, clear, SHARED_CSS, toast } from './dom.js';
import { canReparent } from '../skeleton/skeleton.js';
import { PART_LABELS } from '../skeleton/presets.js';
import { uid } from '../core/math.js';

interface HierarchyEvents {
  onSelect: (boneId: string | null) => void;
  onChange: () => void;
}

export class PanelHierarchy extends HTMLElement {
  private project: Project | null = null;
  private selectedId: string | null = null;
  private events: HierarchyEvents | null = null;
  private treeHost!: HTMLDivElement;
  private inspector!: HTMLDivElement;

  connectedCallback(): void {
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = /* html */ `
      <style>
        ${SHARED_CSS}
        :host { display: flex; flex-direction: column; height: 100%; }
        .head {
          padding: 10px 12px; border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between; flex: none;
        }
        .head b { font-size: 13px; }
        .body { flex: 1; overflow: auto; padding: 8px; }
        .tree-node { user-select: none; }
        .row {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 8px; border-radius: var(--radius-sm);
          cursor: pointer; font-size: 13px;
        }
        .row:hover { background: var(--bg-panel-2); }
        .row.sel { background: var(--accent-soft); color: var(--accent); }
        .dot { width: 9px; height: 9px; border-radius: 2px; flex: none; }
        .row .name { flex: 1; }
        .row .part { font-size: 10px; color: var(--fg-faint); }
        .inspector {
          border-top: 1px solid var(--border); padding: 12px;
          flex: none; max-height: 46%; overflow: auto;
        }
        .inspector h4 { margin: 0 0 10px; font-size: 12px; color: var(--fg-dim); }
        .field { margin-bottom: 10px; display: flex; flex-direction: column; gap: 4px; }
        .field .row-inline { display: flex; gap: 6px; align-items: center; }
        .field input[type="number"], .field select { width: 100%; }
        .lim-row { display: flex; gap: 6px; }
        .lim-row input { width: 0; flex: 1; }
        .actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .empty { color: var(--fg-faint); font-size: 12px; padding: 16px; text-align: center; }
      </style>
      <div class="head">
        <b>🧩 部件与骨骼层级</b>
        <button class="ghost" id="add-bone" title="为选中骨骼添加子骨骼">+ 子骨骼</button>
      </div>
      <div class="body" id="tree"></div>
      <div class="inspector" id="inspector"></div>
    `;
    this.treeHost = root.querySelector('#tree')!;
    this.inspector = root.querySelector('#inspector')!;
    root.querySelector('#add-bone')!.addEventListener('click', () => this.addChild());
  }

  setProject(project: Project): void {
    this.project = project;
    this.render();
  }

  setSelected(boneId: string | null): void {
    this.selectedId = boneId;
    this.render();
  }

  setEvents(events: HierarchyEvents): void {
    this.events = events;
  }

  private render(): void {
    if (!this.project) return;
    clear(this.treeHost);
    const roots = this.project.skeleton.filter((b) => b.parentId === null);
    if (roots.length === 0) {
      this.treeHost.appendChild(h('div', { class: 'empty', textContent: '暂无骨骼' }));
    }
    roots.forEach((b) => this.treeHost.appendChild(this.renderNode(b, 0)));
    this.renderInspector();
  }

  private renderNode(bone: Bone, depth: number): HTMLElement {
    const node = h('div', { class: 'tree-node' });
    const row = h('div', {
      class: `row${this.selectedId === bone.id ? ' sel' : ''}`,
      style: `padding-left:${8 + depth * 14}px`,
    }, [
      h('span', { class: 'dot', style: `background:#${(bone.color >>> 8).toString(16).padStart(6, '0')}` }),
      h('span', { class: 'name', textContent: bone.name }),
      h('span', { class: 'part', textContent: PART_LABELS[bone.part] }),
    ]);
    row.addEventListener('click', () => {
      this.selectedId = bone.id;
      this.events?.onSelect(bone.id);
      this.render();
    });
    node.appendChild(row);
    this.project!.skeleton
      .filter((c) => c.parentId === bone.id)
      .forEach((c) => node.appendChild(this.renderNode(c, depth + 1)));
    return node;
  }

  private selectedBone(): Bone | undefined {
    return this.project?.skeleton.find((b) => b.id === this.selectedId);
  }

  private renderInspector(): void {
    clear(this.inspector);
    const bone = this.selectedBone();
    if (!bone) {
      this.inspector.appendChild(h('h4', { textContent: '关节属性' }));
      this.inspector.appendChild(h('div', { class: 'empty', textContent: '在上方选择一根骨骼查看限位与绑定' }));
      return;
    }
    this.inspector.appendChild(h('h4', { textContent: `关节属性 · ${bone.name}` }));

    // 名称
    const nameField = h('div', { class: 'field' }, [
      h('label', { textContent: '部件名称' }),
      h('input', {
        type: 'text',
        value: bone.name,
        onchange: (e: Event) => {
          bone.name = (e.target as HTMLInputElement).value || bone.name;
          this.events?.onChange();
          this.render();
        },
      }),
    ]);
    this.inspector.appendChild(nameField);

    // 父级绑定
    const parentOptions = [h('option', { value: '', textContent: '（根骨骼）' })];
    for (const cand of this.project!.skeleton) {
      if (cand.id === bone.id) continue;
      parentOptions.push(h('option', { value: cand.id, textContent: cand.name, selected: cand.id === bone.parentId }));
    }
    const parentField = h('div', { class: 'field' }, [
      h('label', { textContent: '父骨骼绑定（拖动父骨骼时子骨骼联动）' }),
      h('select', {
        onchange: (e: Event) => {
          const val = (e.target as HTMLSelectElement).value || null;
          if (!canReparent(this.project!.skeleton, bone.id, val)) {
            toast('不能绑定到自身或其子骨骼，会形成循环层级', 'bad');
            this.renderInspector();
            return;
          }
          bone.parentId = val;
          this.events?.onChange();
          this.render();
          toast('层级绑定已更新', 'good');
        },
      }, parentOptions),
    ]);
    this.inspector.appendChild(parentField);

    // 静止角 / 长度
    const restField = h('div', { class: 'field' }, [
      h('label', { textContent: `静止局部角（度）` }),
      h('input', {
        type: 'number',
        value: String(bone.restAngle),
        onchange: (e: Event) => {
          bone.restAngle = Number((e.target as HTMLInputElement).value);
          this.events?.onChange();
        },
      }),
    ]);
    this.inspector.appendChild(restField);

    const lenField = h('div', { class: 'field' }, [
      h('label', { textContent: '骨骼长度（像素）' }),
      h('input', {
        type: 'number',
        min: '8',
        max: '240',
        value: String(bone.length),
        onchange: (e: Event) => {
          bone.length = Math.max(8, Number((e.target as HTMLInputElement).value) || bone.length);
          this.events?.onChange();
        },
      }),
    ]);
    this.inspector.appendChild(lenField);

    // 旋转限位
    const limField = h('div', { class: 'field' }, [
      h('div', { class: 'row-inline' }, [
        h('input', {
          type: 'checkbox',
          checked: bone.limit.enabled,
          id: 'lim-enable',
          onchange: (e: Event) => {
            bone.limit.enabled = (e.target as HTMLInputElement).checked;
            this.events?.onChange();
            this.renderInspector();
          },
        }),
        h('label', { textContent: '启用旋转限位', for: 'lim-enable' }),
      ]),
    ]);
    if (bone.limit.enabled) {
      limField.appendChild(h('div', { class: 'lim-row' }, [
        h('input', {
          type: 'number',
          title: '最小角度',
          value: String(bone.limit.min),
          onchange: (e: Event) => {
            bone.limit.min = Number((e.target as HTMLInputElement).value);
            if (bone.limit.min > bone.limit.max) bone.limit.max = bone.limit.min;
            this.events?.onChange();
            this.renderInspector();
          },
        }),
        h('input', {
          type: 'number',
          title: '最大角度',
          value: String(bone.limit.max),
          onchange: (e: Event) => {
            bone.limit.max = Number((e.target as HTMLInputElement).value);
            if (bone.limit.max < bone.limit.min) bone.limit.min = bone.limit.max;
            this.events?.onChange();
            this.renderInspector();
          },
        }),
      ]));
    }
    this.inspector.appendChild(limField);

    // 删除
    const hasChildren = this.project!.skeleton.some((b) => b.parentId === bone.id);
    const actions = h('div', { class: 'actions' }, [
      h('button', {
        class: 'danger',
        disabled: hasChildren,
        title: hasChildren ? '请先删除或移走子骨骼' : '',
        textContent: '删除该骨骼',
        onclick: () => {
          this.project!.skeleton = this.project!.skeleton.filter((b) => b.id !== bone.id);
          this.project!.keyframes = this.project!.keyframes.filter((k) => k.boneId !== bone.id);
          this.selectedId = null;
          this.events?.onSelect(null);
          this.events?.onChange();
          this.render();
          toast('骨骼及其关键帧已删除', 'warn');
        },
      }),
    ]);
    this.inspector.appendChild(actions);
  }

  private addChild(): void {
    if (!this.project) return;
    const parent = this.selectedBone() ?? this.project.skeleton.find((b) => b.parentId === null);
    const bone: Bone = {
      id: uid('bone'),
      name: `新部件${this.project.skeleton.length + 1}`,
      part: 'gripper',
      parentId: parent?.id ?? null,
      length: 40,
      restAngle: 0,
      thickness: 10,
      color: 0x93a1bdff,
      limit: { enabled: false, min: -90, max: 90 },
    };
    this.project.skeleton.push(bone);
    this.selectedId = bone.id;
    this.events?.onSelect(bone.id);
    this.events?.onChange();
    this.render();
    toast('已添加子骨骼，可在下方修改名称与限位', 'good');
  }
}
