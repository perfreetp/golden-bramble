# 宠物水疗康复中心 · 三维场地布置编辑器

面向康复师与带教老师共用的 Three.js + Svelte (WebGL2) 场地布置工具。全部尺寸以**米**为单位按真实比例建模。

## 启动

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 生产构建（输出 dist/）
npm test           # 纯逻辑单元测试（node --test，13 项）
```

## 功能与实现对照

| 需求 | 实现 |
| --- | --- |
| 真实尺寸地面网格与标尺 | `SceneEngine.buildRoom`：0.5m 次线 / 1m 主线矩形网格，边界墙脚，X/Z 双向每米刻度 Sprite |
| 器材库拖入（泳池/缓坡道/水下跑台/防滑垫/围栏/栓柱） | `EquipPalette` 拖拽或点击；`SceneEngine.handleLibraryDrop` 按射线与地面求交落点 |
| 射线拾取高亮 | `Raycaster` 命中 mesh → 选中描边框 + 自发光（黄） |
| 框选 / Shift 多选 | 左键空白拖框（屏幕投影包含判定）；Shift+点选切换选择集 |
| 平移/旋转/缩放手柄 + 0.1m / 15° 吸附 | 自建 gizmo（箭头/环/立方体/拾取盘），位置吸附 0.1m，旋转吸附 15°，缩放每 0.5m 拖动 = 0.1 档 |
| 包围盒相交整体标红并拒绝落位 | `rules.checkPlacement`：水平 SAT(OBB) + 竖直区间；多选手势任一冲突则整组回滚，顶部 Toast 提示 |
| 靠近地面/器材顶面自动贴合 | `nearestSupportY` / `nearestLocal`：0.2m 吸附半径，贴合地面 y=0 或支撑物顶面 |
| 俯视正交 / 斜45°漫游切换 | `OrthographicCamera`（顶视，仅平移缩放）与 `PerspectiveCamera`（OrbitControls 漫游） |
| 俯视图标长宽与相邻间距 | `rebuildOverlay`：每件 L/W 标注 + `gapsBetween` 净距虚线（橙） |
| 一键导出俯视 PNG | `exportTopPNG`：2048px 正交离屏渲染 → data URL 下载 |
| 器材清单（型号/数量/水面面积） | 右侧清单表 + `buildInventoryCsv`（UTF-8 BOM，Excel 直开） |
| 换型号三维尺寸同步 | 型号变化触发 group 以新 `L/W/H` 重建（`sig` 变化检测） |
| 老师按场地尺寸+必摆件数出题 | `workflow.createAssignment`，localStorage 持久化 |
| 学员提交自动查重叠/越界/未贴地 | `gradeSubmission`：重叠 -8、越界 -6、悬空 -5、缺件每件 -4 |
| 老师复核打分 | `GradeBook`：载入回看、评语、百分制成绩、已复核状态 |
| 成绩与常见错误汇总成表 | 成绩册表格 + `errorSummary` 四类错误计数 |

## 目录结构

```
src/
  lib/
    catalog.js       器材型号目录（6 类、多型号，含水面标记）
    rules.js         纯逻辑：OBB/SAT 碰撞、越界、贴地、吸附、评分、CSV
    stores.js        Svelte stores：场地、实例、选择集、角色、作业
    SceneEngine.js   Three.js/WebGL2 引擎：场景、拾取、框选、gizmo、标注、PNG
    workflow.js      出题/提交/复核/成绩持久化（localStorage）
  components/
    EquipPalette.svelte      器材库
    PropertyPanel.svelte     场地设置、属性编辑、实时校验、清单
    AssignmentPanel.svelte   出题与提交
    GradeBook.svelte         复核打分与错误汇总
  App.svelte         三栏布局、视图/角色切换、HUD
test/rules.test.js   13 项纯逻辑测试
scripts/cdp-*.cjs    基于 Chrome DevTools Protocol 的运行时验证（需本机 Chrome）
```

## 操作说明

- **左键**：点选/拖动物体、空白处框选；**Shift+左键**：多选切换
- **右键**：斜视角旋转 / 俯视平移；**中键/滚轮**：缩放
- 选中后出现手柄：红/绿/蓝箭头平移（蓝为竖直）、黄色环旋转、紫色立方体缩放、粉色圆盘快速平移
- 碰撞或越界的器材整体红框高亮，拖动到非法位置会自动弹回上一合法位置
- 俯视图下自动显示每件器材长宽（蓝）与相邻净距（橙虚线）
