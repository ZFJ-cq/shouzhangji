# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本
│   ├── dev.sh              # 开发环境启动脚本
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   ├── components/ui/      # Shadcn UI 组件库
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   └── utils.ts        # 通用工具函数 (cn)
│   └── server.ts           # 自定义服务端入口
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象、`catch` 错误在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。

### next.config 配置规范

- 配置的路径不要写死绝对路径，必须使用 path.resolve(__dirname, ...)、import.meta.dirname 或 process.cwd() 动态拼接。

### Hydration 问题防范

1. 严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。**必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染**；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
2. **禁止使用 head 标签**，优先使用 metadata，详见文档：https://nextjs.org/docs/app/api-reference/functions/generate-metadata
   1. 三方 CSS、字体等资源可在 `globals.css` 中顶部通过 `@import` 引入或使用 next/font
   2. preload, preconnect, dns-prefetch 通过 ReactDOM 的 preload、preconnect、dns-prefetch 方法引入
   3. json-ld 可阅读 https://nextjs.org/docs/app/guides/json-ld

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**

## 薄荷手账应用说明

### 核心定位
个人财务驾驶舱，围绕"真实时薪"展开记账与财务规划。

### 页面结构（单页长滚动）
1. **今日驾驶舱** — 标题+日期+深色模式+月度提示+导出/导入/清示例
2. **真实时薪卡片** — 显示真实时薪与名义时薪对比
3. **今天也要算清楚** — Hero 区域，带小猪存钱罐 SVG
4. **刚刚花掉的时光** — 最近3笔支出卡片，显示金额和换算工时
5. **现在记一笔** — 极简记账表单（金额+分类+随手一句）
6. **我的时薪** — 工作时间参数设置+名义/真实时薪计算+计算过程
7. **10 秒记账** — 今日/本月支出统计+等价工时+记账表单
8. **最近记录** — 交易列表，带编辑/删除
9. **月度总结** — 填写本月账页+月度记录列表+平均存款
10. **自由基金** — 目标设置+完成率+预计达成+安全垫
11. **有趣发现** — 白干时间+通勤加班+支出折算+存款排行

### 组件结构
- `DashboardHeader.tsx` — 顶部标题区+操作按钮
- `RealHourlyCard.tsx` — 真实时薪展示
- `RecentSpending.tsx` — 最近支出卡片
- `QuickRecord.tsx` — 极简记账表单
- `MyHourlyWage.tsx` — 时薪参数与计算
- `TenSecondRecord.tsx` — 10秒记账统计+表单
- `RecentRecords.tsx` — 最近记录列表
- `MonthlySummarySection.tsx` — 月度总结
- `FreedomFundSection.tsx` — 自由基金
- `FunInsights.tsx` — 有趣发现

### 数据层
- **类型定义**：`src/lib/types.ts` — Transaction, WorkParams, MonthlySummary, FreedomFund, AppData
- **存储操作**：`src/lib/store.ts` — localStorage 读写、CRUD、时薪计算、格式化

### 设计风格
- 奶油薄荷手账风，详见 `DESIGN.md`
- 主色：薄荷绿 `#7BC8A4`，底色：奶油白 `#FFFDF7`
- 标题字体：ZCOOL XiaoWei（手写感中文衬线体）
- 所有组件使用 `'use client'` 指令，纯客户端渲染
