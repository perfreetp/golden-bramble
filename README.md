# 琉璃照壁立面过程式生成工作台

面向琉璃瓦厂的照壁立面过程式生成系统：前台录单派工 → 师傅按瓦件规格表一键分格、过程式生成纹样、重算时按位置锚点保留手改件并裁决冲突 → 料单导出 → 质检打回 → 生产看板。

技术栈：**SolidJS + SVG + D3（d3-shape / d3-zoom / d3-selection）+ Vite**，纯前端、localStorage 持久化，无后端依赖。

## 启动

```bash
npm install
npm run dev        # 开发服务器（默认 http://127.0.0.1:5173，端口被占自动顺延）
npm run build      # 生产构建
npm test           # 领域层 10 项 + 工作流 12 项单元测试
npm run smoke      # 无头 Chrome 端到端冒烟（需本机装有 Chrome）
```

## 业务流程与功能对照

| 角色 | 功能 | 实现位置 |
| --- | --- | --- |
| 前台 | 录入宽高、设色等级（1–5 等釉色）、交期，分派师傅 | `components/Dispatcher.jsx` |
| 师傅 | 按开间数/柱距/檐口高度/设色等级**一键生成**整面立面分区 | `domain/layout.js` `generateLayout` |
| 师傅 | 檐下斗拱层、枋心、岔角、裙板、边框、收边件各占一块 | 六分区定义见 `domain/constants.js` `ZONES` |
| 师傅 | 按瓦件规格表分格、标准件自动均分，余量落**收边件单独 S 编号** | `layout.js` `tileLine / tileRect / tileChajiao` |
| 师傅 | 岔角卷草、枋心花板等**种子 + 参数过程式纹样**，同种子同参数逐位复现 | `domain/motif.js` + `domain/rng.js`（FNV-1a 哈希 + mulberry32） |
| 师傅 | 点选构件换种子、调参数、改设色、单件/整片区域锁定 | `components/Inspector.jsx`、`domain/store.js` |
| 师傅 | 改开间/柱距重算：锁定与手改件按**位置锚点**留原位，冲突在图上标红并二选一 | `domain/merge.js` `regenerate / resolveConflict` |
| 师傅 | 构件编号/规格/设色汇总料单并导出 CSV（带 BOM，Excel 直开） | `domain/bom.js`、`components/BOMPanel.jsx` |
| 质检 | 抽查通过结案；不合格打回，**返工次数累加**并记录原因 | `components/QCStation.jsx` |
| 管理 | 看板：每位师傅完成量、返工率、在制单数 | `components/Dashboard.jsx` |

## 确定性设计（可复现的核心）

- 生成链路不使用 `Math.random` / `Date.now`；所有随机来自 `mulberry32(seed)`，种子由
  订单号 + 分区 + 位置锚点 + 纹样族经 FNV-1a 哈希派生（`domain/rng.js`）。
- 位置锚点签名：`分区:开间b:行r:列c:角点`（`anchorSignature`）。重算时凭签名匹配旧件：
  - 锁定件 / 整片锁定区：几何与样式原样保留，不参与重算；
  - 手改未锁件：锚点命中则跟随新几何、保留纹样种子与设色；锚点消失则作孤儿件原位保留；
  - 保留件与新排布几何重叠 → 生成冲突记录，图上脉冲标红，师傅选「保留旧件 / 采用新排布」。
- 重算会重置顺序号，与保留旧件撞号的新件自动加 `-G` 后缀，保证构件编号唯一。

## 目录结构

```
src/
  domain/
    constants.js   分区、瓦件规格表、五等釉色板、纹样参数定义、状态字典
    rng.js         确定性哈希与伪随机
    layout.js      分区几何 + 瓦件分格（纯函数）
    motif.js       六族过程式纹样（卷草/花板/斗拱/回纹/如意/素面）
    merge.js       重算锚点合并与冲突裁决
    bom.js         料单聚合、CSV 导出、看板统计
    store.js       Solid store 业务动作与 localStorage 持久化
  components/      派单、工作台、SVG 画布、检查器、冲突条、料单、质检、看板
test/              领域测试、store 工作流测试、无头浏览器冒烟
```

## 规格表说明

瓦件公称规格集中在 `src/domain/constants.js` 的 `TILE_SPECS`，调整规格后重新生成即按新表排料；
任何无法被标准件整除的余量都进入收边件（编号带 `S`），料单中单独列示实测尺寸。
