# 项目上下文：薄荷手账（mint-accounting）

> 个人财务驾驶舱类记账 Web 应用，围绕「真实时薪」做记账与财务规划。奶油薄荷手账风格。

## 技术栈（当前真实状态）

- **构建框架**：Vite 6 + `@vitejs/plugin-react` + `@tailwindcss/vite`
- **视图**：React 19 + TypeScript 5
- **样式**：Tailwind CSS v4（纯 CSS 变量驱动，无 `tailwind.config`）
- **运行时依赖**：仅 4 个 —— `react` / `react-dom` / `clsx` / `tailwind-merge`
- **数据层**：纯浏览器 `localStorage`（key：`mint-accounting-data`），**无后端、无数据库、无 Node 常驻服务**
- **托管**：纯静态产物（`dist/`），可部署到任意静态服务器 / GitHub Pages / CDN
- **包管理器**：pnpm（`package.json` 锁定 `packageManager: pnpm@9`）

## 目录结构

```
index.html              # 静态入口（含 title / viewport / 字体 @import）
vite.config.ts          # Vite 配置（@ 别名 → src，base './'，端口 5000）
src/
├── main.tsx            # 入口：渲染 App；渲染前按 localStorage 设置 dark 类防闪烁
├── App.tsx             # 顶层：activeTab 状态切换 4 个主 Tab + TabBar
├── globals.css         # 全局样式、主题令牌（:root 浅色 / .dark 深色）、动画
├── components/
│   ├── TabBar.tsx                     # 底部导航：首页/记账/时薪/规划
│   ├── tabs/
│   │   ├── DashboardTab.tsx          # 首页驾驶舱（真实时薪、最近支出、快捷记账、清空二次确认）
│   │   ├── RecordTab.tsx             # 记账页（3 个正方形格子 + 分类饼图 + 记录列表）
│   │   ├── WageTab.tsx               # 时薪参数与计算过程
│   │   └── PlanTab.tsx               # 规划页「菜单/子页面」容器（state 切换）
│   └── plan/                         # 规划子页面（菜单 + 3 个独立页面）
│       ├── types.ts
│       ├── PlanMenu.tsx              # 菜单 + 有趣发现
│       ├── MonthlySummaryView.tsx    # 月度总结
│       ├── BudgetView.tsx            # 月度预算
│       └── FreedomFundView.tsx       # 自由基金
└── lib/
    ├── AppContext.tsx   # 全局状态（封装 store 读写 + 派生计算 + 主题 theme/toggleTheme）
    ├── store.ts         # localStorage CRUD + 时薪/格式化计算 + 导入导出清空
    ├── types.ts         # 数据模型 + 分类常量
    └── utils.ts         # cn() 工具（clsx + tailwind-merge）
```

> 历史备注：本项目早期是 Next.js + shadcn/ui + 自定义 Node 服务，已重构为纯 Vite 静态 SPA。
> `DESIGN.md` 与旧 `README.md` 中关于 Next.js / shadcn 的描述已过时，请以本文件为准。

## 常用命令

```bash
pnpm install          # 安装依赖（必须用 pnpm）
pnpm dev              # 开发：http://localhost:5000，热更新
pnpm build            # 生产构建，产物输出到 dist/
pnpm preview          # 本地预览 dist/ 产物
pnpm deploy           # 用 gh-pages 推送到 gh-pages 分支（GitHub Pages）
pnpm typecheck        # tsc --noEmit 类型检查
```

## 开发规范

- TypeScript `strict` 心智：禁止隐式 `any` / `as any`；清理未使用变量与导入。
- 路径别名 `@/` → `src/`（见 `vite.config.ts` 与 `tsconfig.json`）。
- 所有组件为纯客户端渲染，顶部 `'use client'`。
- 无路由库：4 个主 Tab 用 `App` 的 `activeTab` state 切换；规划子页面用 `PlanTab` 内部 state 切换（对静态托管友好）。
- 字体 `ZCOOL XiaoWei` 通过 `globals.css` 顶部 `@import` 谷歌字体加载，离线时该手写体不显示，功能不受影响。

## 主题 / 深色模式

- 组件颜色**不直接写死 hex**，统一引用 CSS 变量 `var(--c-*)`（见 `globals.css` 的 `:root` 与 `.dark`）。
- 浅色在 `:root` 定义，深色在 `.dark` 下重定义；切换只需给 `<html>` 加/去 `dark` 类。
- 主题状态在 `AppContext`（`theme` / `toggleTheme`），持久化到 `localStorage['mint-theme']`；`main.tsx` 渲染前读取以**避免深色模式闪烁**。
- 新增颜色请先在 `globals.css` 增加 `--c-*` 令牌，再在组件用 `bg-[var(--c-xxx)]` 等类引用，**不要写死 hex**。

## 数据层

- 类型：`src/lib/types.ts` —— `Transaction`、`WorkParams`、`MonthlySummary`、`FreedomFund`、`MonthlyBudget`、`AppData`。
- 存储：`src/lib/store.ts` —— localStorage 读写、CRUD、时薪/格式化计算、`exportData` / `importData` / `clearAllData`。
- **`clearAllData()` 是「核武器」**：会重置全部数据为出厂默认（所有记账、月度总结、时薪参数、自由基金、预算全清空，不可恢复）。入口在首页「清空」按钮，已实现**两步确认弹窗**并明确告知严重性，清空前建议先「导出」备份。

## 设计风格

- 奶油薄荷手账风。主色薄荷绿 `#7BC8A4`，危险红 `#E8A0A0`。
- 标题字体 `ZCOOL XiaoWei`（手写感中文衬线），通过 `.font-handwrite` 工具类使用。
- 移动端优先：底部安全区 `env(safe-area-inset-bottom)`，按钮 `min-h-[44px]`，输入框字号 16px 防 iOS 缩放（见 `globals.css`）。
