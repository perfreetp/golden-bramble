# 瓶型曲面建模与标签展开工作台

面向日化包装瓶厂的塑料瓶型设计工具：设计师在二维视口用样条曲线绘制瓶身半剖轮廓，
绕轴旋转生成瓶身曲面，经等距偏移生成标签安全区与出血边界，最后按柱面展开成平面标签稿。
工单驱动全流程：前台接单 → 设计师建模 → 质检抽查（可打回返工）→ 看板统计。

技术栈：**SolidJS + Canvas2D + OffscreenCanvas（Web Worker）+ TypeScript + Vite**，无任何 3D 引擎依赖。

## 启动

```bash
npm install
npm run dev        # 开发服务器
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览构建产物
```

## 四个界面

| 界面 | 职责 |
| --- | --- |
| 前台接单 | 录入品名/目标容量/材质/客户，生成工单并分派给设计师；待分派与设计中工单分表管理 |
| 设计工作台 | 半剖样条编辑、旋转曲面预览、工艺参数、柱面展开标签稿，三画布随轮廓自动联动重算 |
| 质检抽查 | 曲率/接缝/伸长率三项检查清单，通过即结案，不合格必填原因打回并累计返工次数 |
| 生产看板 | 工单总量、完成量、返工率、一次通过率 KPI，状态分布、设计师负荷与质量、最近质检结论 |

数据通过 `localStorage` 持久化，刷新不丢失；内置 4 条种子工单演示完整状态流转。

## 核心几何能力（`src/lib/geometry.ts`）

- **半剖样条**：向心参数化 Catmull-Rom 插值，端点幻影点外推，包络钳制消除过冲
- **曲率/切向角**：中心差分计算平面参数曲线曲率 κ 与相对 z 轴的切向角 θ
- **鲁棒曲率告警**：取控制点弧长邻域窗口的曲率中位数，滤除端部数值尖峰，超阈值控制点标红
- **等距偏移**：顶点平均法线法向偏移，正距离外扩（出血）、负距离内缩（安全区），量值可调
- **旋转曲面**：弧长重采样后绕 z 轴生成 rows×rings 网格
- **容量**：盘克森积分 V = π∫r²dz（mm³ → ml），实时对比工单目标容量
- **柱面展开**：标签高度区间逐行切片，弧长加权平均半径为参考，逐行计算展开弧长与伸长率

## 渲染架构

- `SplineEditor.tsx` / `UnrollCanvas.tsx`：主线程 Canvas2D，DPR 适配 + ResizeObserver
- `surfaceRender.ts`：纯绘制函数，Worker 与主线程降级共用同一套实现
- `surfaceWorker.ts`：OffscreenCanvas 在 Worker 内 `requestAnimationFrame` 合并高频重绘，
  不支持 `transferControlToOffscreen` 的环境自动回退主线程渲染（界面徽章显示当前模式）

## 测试

```bash
npm test                 # 几何 + Solid 响应式链路单测
npm run test:e2e         # Playwright 端到端（自管理 Vite 子进程，截图输出到 e2e-shots/）
```

- `scripts/geom-smoke.ts`：样条单调性、曲率、偏移量、旋转网格、容量解析解、展开/伸长率
- `scripts/reactive-smoke.ts`：轮廓/参数信号变化驱动全部下游 memo 自动重算
  （需 `--conditions=browser`，否则 Node 会命中 solid-js 的 worker/server 构建）
- `scripts/e2e-check.mjs`：四界面工单全流程（接单→分派→提交→打回→复检→看板→持久化）

## 目录结构

```
src/
  types.ts              领域类型
  store.ts              Solid Store：工单状态机 + 工作台轮廓 + 持久化
  lib/
    geometry.ts         几何核心（纯函数）
    surfaceRender.ts    旋转曲面 Canvas2D 渲染器
    surfaceWorker.ts    OffscreenCanvas Worker
    materials.ts        塑料材质库
    canvas.ts           Canvas DPR/ResizeObserver 辅助
  components/           SplineEditor / SurfacePreview / UnrollCanvas / StatusBadge
  views/                Intake / Workbench / QC / Dashboard
```
