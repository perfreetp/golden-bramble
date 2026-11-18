# 滑道喷涂模板矢量编辑器

面向水上乐园玻璃钢滑道喷涂施工的矢量图形编辑器，用 **SolidJS + PixiJS** 实现。
在画布上绘制海星、水母、浪花等单元图形，支持布尔运算、节点级编辑、边缘吸附、
沿滑道弧长排布、图层管理、分色打样导出，以及版本提交 / 审核批注 / 两版差异对比。

## 快速开始

```bash
npm install --ignore-scripts   # 本机无 VS C++ 工具链，跳过 pixi 的可选原生依赖 gl（浏览器运行不需要）
npm run dev                    # 启动开发服务器
npm run build                  # 生产构建
npm run typecheck              # TypeScript 类型检查
```

> 依赖说明：`pixijs@7`（渲染）、`polygon-clipping`（布尔运算）、`solid-js@1`（响应式 UI）。

## 功能清单与实现位置

| 需求 | 实现 |
| --- | --- |
| 海星 / 水母 / 浪花单元图形 | `src/lib/shape-factory.ts`，全部为带三次贝塞尔控制柄的 `PathData` |
| 多选并集 / 差集 / 交集 | `src/lib/boolean.ts` + `store.createCompoundFromSelection`，基于 polygon-clipping |
| 运算结果保留原路径节点、可继续拖拽 | 复合节点（`CompoundNode`）实时求值，源形状不打平、不删除；双击结果或点「进入编辑」即可拖源节点，结果即时重算；可「烘焙」固化或「分离」 |
| 闭合路径填充与描边宽度 | `PropertiesPanel` 的 `StyleSection`，样式存于 `StyleData` |
| 边缘参考线 + 端点/中点/切点吸附 | `pixi-stage.ts` 的 `computeSnap`，Alt 临时关闭、按钮全局开关 |
| 撤销 / 重做 ≥50 步并可回退到打开时 | `store.ts` 快照式历史栈，上限 200 步；`baseline` 钉住打开文件状态，「回到打开时」一键连续回退 |
| 图层锁定 / 重命名 / 调序 | `LayersPanel.tsx`，锁定后不可选中或拖动，双击重命名，↑↓ 调整叠放 |
| 成组图形沿滑道弧长排布、指定间距 | `ArcLayout` + `doc-utils.effectiveGroupPaths`，可设弧长间距、起始偏移、是否随切线旋转 |
| 导出 SVG | `exporters.buildSvg`，保留贝塞尔 C 命令与闭合 Z |
| 分色打样图 | `exporters.buildColorProofs`，按实际用色逐色输出独立单色 SVG |
| 每次提交生成新版本 | `store.commitVersion`，快照文档与批注，存 localStorage |
| 审核人圈选批注 | 批注工具在画面手绘圈选，弹窗录入意见，红色/绿色轮廓渲染 |
| 制作方逐条回复处理 | `AnnotationsPanel`，每条批注下回复、标记已解决/重开 |
| 两版叠加对比差异 | `VersionsPanel` + `pixi-stage.drawCompare`，旧版橙色虚线半透明叠加，可调透明度，可导出差异 SVG |

## 架构

```
src/
├── types.ts            # 全部领域模型（纯数据，可 JSON 序列化）
├── store.ts            # Solid store：文档状态、快照历史、所有文档动作、版本/批注
├── lib/
│   ├── geometry.ts     # 贝塞尔采样、点测试、包围盒、最近点、弧长取点
│   ├── shape-factory.ts# 三种单元图形路径工厂 + uid
│   ├── boolean.ts      # 曲线打平 → polygon-clipping 交并差 → 转回路径节点
│   ├── doc-utils.ts    # 复合节点/弧排布的有效路径求值、树查询
│   ├── exporters.ts    # SVG / 分色打样 / 差异叠加
│   ├── storage.ts      # localStorage 持久化、项目文件下载
│   └── clone.ts        # JSON 深拷贝（Solid 代理不能用 structuredClone）
├── canvas/pixi-stage.ts# PixiJS 画布：渲染、命中、拖拽、吸附、框选、批注、版本叠加
└── components/         # Solid UI：工具栏、图层、属性、批注、版本、模态框
```

### 关键设计

- **文档即纯数据**：所有节点都是可 JSON 序列化的普通对象，历史栈直接做深拷贝快照，
  避免命令模式的复杂度，回退到任意状态都可靠。
- **布尔运算不破坏源路径**：复合节点只存 `childIds` 与运算符，渲染时实时求值。
  曲线先按 1.5px 弧长打平成交多边形参与运算，结果是直线段节点；但源形状的贝塞尔
  节点始终保留，编辑源节点后结果立即重算。需要落地时再「烘焙」。
- **拖拽事务**：`beginInteraction` 冻结快照，拖拽过程只走 `updateLive`（不入栈），
  松手时 `endInteraction` 一次性入栈，保证一次拖动 = 一条历史记录。
- **吸附**：拖动时计算被选图形包围盒特征点与静止图形的端点/段中点/路径最近点，
  在屏幕像素阈值内吸附并画十字参考线；按住 Alt 全程临时禁用。

## 操作速查

- 工具：`V` 选择 · `A` 节点 · `H` 平移 · `G` 圈选批注
- `Ctrl+Z` 撤销 · `Ctrl+Y` / `Ctrl+Shift+Z` 重做 · `Delete` 删除
- `Shift` 点选 / 框选多选 · `Alt` 拖动时临时关吸附 · 滚轮以光标为中心缩放
- 节点工具下拖锚点或橙色控制柄，**双击线段**在中点插入节点
- 双击布尔结果进入源节点编辑；双击组进入弧排布上下文

## 自动化验证（headless Chrome + CDP）

先 `npm run dev`，再运行：

```bash
npm run test:smoke    # 10 大业务链路端到端（布尔/样式/编组/历史/批注/版本/打样/锁定）
npm run test:deep     # 60 步历史、连续撤销重做、节点工具、吸附开关
npm run test:snap     # 像素级验证吸附参考线出现、Alt 临时关闭
npm run test:node     # 双击插入节点、锚点拖拽
npm run test:svg      # 拦截下载，校验 SVG/分色/差异文件内容
npm run test:visual   # 布尔与弧排布截图
```

> 测试通过 `window.__spray` / `window.__stage` 只读钩子读取实时状态，仅用于 headless 自动化，无生产副作用。

## 已知边界

- 布尔结果为打平后的直线段路径（多边形运算的固有特性），源曲线节点仍保留可编辑。
- 持久化基于浏览器 localStorage；「保存」会额外下载 `.spray.json` 项目文件，可用「打开」恢复。
- PixiJS v7 无原生虚线，参考线/滑道/选框的虚线由 `dashedTrace` 按弧长分段绘制。
