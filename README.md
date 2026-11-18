# 机器人剧场走位与地面标线矢量编辑器

面向剧场机器人演出编排的矢量编辑器。基于 **Vue 3 + PixiJS v8 + Pinia + Vite**，纯前端实现，数据保存在浏览器 `localStorage`，无需后端即可运行。

## 启动

```bash
npm install
npm run dev      # 开发，默认 http://127.0.0.1:5180
npm run build    # 生产构建
npm run preview  # 预览构建产物
node --test test # 运行 36 项单元/集成/E2E 测试
```

## 四个界面

| 路由 | 界面 | 职责 |
| --- | --- | --- |
| `/#/shows` | 剧目列表 | 建剧目档案、进入画布、排期发布（冲突拦截） |
| `/#/editor/:id` | 走位画布 | Pixi 矢量编辑主界面 |
| `/#/assets` | 素材库 | 维护表演机器人型号，一键投放到画布 |
| `/#/admin` | 后台 | 冲突检测、排期管理、场次与编排时长统计 |

## 画布能力与操作

- **机器人投放**：素材库选型号 → 画布上点击落点；不同型号半径/颜色不同。
- **形状绘制**：矩形（可设圆角）、圆、逐点多边形、按住自由绘制（首尾闭合落地为区域，否则为路径）。
- **走位路径**：逐点绘制，双击/回车完成（Shift 闭合）；双击路径进入节点编辑，
  蓝点移动节点、黄点调曲率（Shift 断开对称手柄），单击线段上的绿色提示点插入节点，
  曲线插入用 De Casteljau 精确切分、形状不变。
- **布尔运算**：矩形/圆/多边形/自绘轮廓任选两个做并集、交集、差集；
  基于 `polygon-clipping`，结果保留圆角（Catmull-Rom 平滑）并自动 RDP 简化 + 合并重叠节点，孔洞以 evenodd 渲染。
- **四种吸附（12px 内触发并显示黄色参考线）**：网格、端点、中点、等距；优先级 端点 > 中点 > 等距 > 网格，可独立开关。
- **一键镜像**：整条路径沿舞台中轴镜像到另一侧（节点与曲率手柄同步翻转）。
- **撤销/重做**：快照式历史栈（容量 60），`Ctrl+Z` / `Ctrl+Shift+Z`；
  历史只记录文档内容，**图层面板的层内排序不进撤销栈、不受撤销影响**。
- **三层结构**：舞台标线层 `stage` / 机器人位层 `robot` / 走位路径层 `path`，层内可拖拽或按钮排序。
- **标注**：机器人位与路径可标节拍时间、负责演员；区域可命名（如"候场区 A"），画布上直接显示文字。
- **SVG 导出**：只输出干净几何（无手柄/参考线/选中框），三层分组、箭头 marker、`data-cue`/`data-actor`/`data-zone` 元数据齐全。

## 后台业务

- 发布排期时做时间重叠检测（同剧场），冲突会列出撞场的两个节目与重叠分钟数并**阻止发布**，换剧场或改时间即可放行。
- 统计各剧目的场次、单场编排时长、累计舞台时长及全局汇总。

## 目录结构

```
src/
  editor/
    geometry.js      纯几何：采样、布尔后处理、Catmull-Rom、命中、镜像、SVG 路径串
    elements.js      元素模型/默认值/节点手柄
    history.js       撤销重做栈
    snapping.js      四模式吸附引擎 + 参考线
    svg-export.js    干净 SVG 导出
    pixi/
      renderer.js    Pixi v8 渲染（三层/网格/装饰/文字/参考线）
      dash.js        v8 无原生 dash，自实现虚线笔刷
      controller.js  指针交互/绘制/节点编辑/拖拽吸附
  store/             Pinia：show（文档+历史）、asset（剧目/型号/排期）、ui（toast/吸附开关）
  components/        StageCanvas / PropertyPanel / LayerPanel / RobotGlyph
  views/             四个界面
test/                36 个 node:test 用例（几何、吸附、虚线、store、完整 E2E 流程）
```

## 关键技术说明

- PixiJS v8 的 `StrokeStyle` 不支持 `dash`，所有虚线（参考线、虚线路径、橡皮筋）由 `pixi/dash.js` 沿采样折线按 `[on, off]` 笔刷节奏实现。
- 布尔轮廓的孔洞用 v8 `Graphics.cut()` 挖除；平滑环用 Catmull-Rom 转三次贝塞尔渲染与导出。
- Pinia 深度代理无法被 `structuredClone`，历史快照与元素克隆统一走 JSON 安全深拷贝（文档数据均可 JSON 序列化）。
