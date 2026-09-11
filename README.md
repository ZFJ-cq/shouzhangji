# 薄荷手账 · Mint Accounting

一个围绕「真实时薪」展开的纯前端个人记账 Web 应用。把每一笔花销换算成「耗掉了多少小时」，帮你更踏实地做花钱与攒钱的选择。

> 奶油薄荷手账风格，移动端优先，纯静态部署（无后端、无数据库）。

## ✨ 功能

- **今日驾驶舱**：真实时薪、最近支出（按工时换算）、随手记一笔
- **记账**：今日/本月支出、本月等价工时（横排正方形格子）、分类饼图、记录增删改
- **时薪**：6 个工时参数 → 名义时薪 vs 真实时薪，附完整计算过程
- **规划**（菜单 + 子页面）：月度总结、月度预算、自由基金、有趣发现
- **深色模式**：一键切换，偏好持久化
- **数据自持**：全部存浏览器 `localStorage`，支持导出 / 导入 / 清空（清空为两步确认，防误删）

## 🛠 技术栈

- [Vite 6](https://vitejs.dev/) + [React 19](https://react.dev/) + TypeScript 5
- [Tailwind CSS v4](https://tailwindcss.com/)（纯 CSS 变量主题，含深色模式）
- 运行时依赖仅 `react` / `react-dom` / `clsx` / `tailwind-merge`
- 包管理器：**pnpm**

## 🚀 本地运行

```bash
pnpm install      # 安装依赖（必须用 pnpm）
pnpm dev          # 开发模式，访问 http://localhost:5000
```

## 📦 构建与部署

```bash
pnpm build        # 产出纯静态文件到 dist/
pnpm preview      # 本地预览构建产物
```

部署到任意静态托管即可（Nginx / Vercel / Netlify / 对象存储 / CDN）。
产物使用相对路径（`base: './'`），放在子路径下也能正常加载。

### GitHub Pages（自动）

仓库已就绪时，把代码推到 `main`，并开启 Pages（Source = GitHub Actions）即可自动发布；
或本地执行：

```bash
pnpm deploy       # 使用 gh-pages 推送到 gh-pages 分支
```

## 📁 目录结构

```
index.html · vite.config.ts · package.json · tsconfig.json
src/
├── main.tsx            # 入口（渲染前设置深色模式防闪烁）
├── App.tsx             # 顶层 Tab 切换
├── globals.css         # 主题变量（浅色 :root / 深色 .dark）与全局样式
├── components/
│   ├── TabBar.tsx
│   ├── tabs/           # DashboardTab / RecordTab / WageTab / PlanTab
│   └── plan/           # 规划子页面（菜单 + 月度总结/预算/自由基金）
└── lib/                # AppContext（状态+主题）/ store（localStorage）/ types / utils
```

## 📝 说明

- 数据保存在本机浏览器，换设备 / 清缓存会丢失，重要数据记得「导出」备份。
- `ZCOOL XiaoWei` 标题字体通过 `@import` 谷歌字体加载，离线时回退为系统衬线体。
- 详见 [AGENTS.md](./AGENTS.md)。
