# vue-vant-h5

Vue 3 + TypeScript + Vite 的移动端 H5 项目，使用 Vant 4 构建交互组件，Tailwind CSS v4 管理基础样式能力，Axios 统一请求，`vite-plugin-mock` + Mock.js 提供本地 mock。

当前业务页面包括充值、帐单列表、帐单详情。`/` 默认跳转到充值页。

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Vant 4
- Tailwind CSS v4
- Axios
- Mock.js
- vite-plugin-mock

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务：

```bash
npm run dev
```

开发模式默认读取 `.env.development`：

```env
VITE_APP_TITLE=Recharge example
VITE_API_BASE_URL=/api
VITE_ENABLE_MOCK=true
```

开发服务启动后访问：

```text
http://127.0.0.1:5173/recharge
```

## 常用命令

```bash
npm run dev
npm run dev:prod
npm run typecheck
npm run build
npm run build:dev
npm run build:prod
npm run preview
```

命令说明：

- `npm run dev`：使用 development mode 启动 Vite，本地 mock 生效。
- `npm run dev:prod`：使用 production mode 启动 Vite。
- `npm run typecheck`：执行 `vue-tsc --noEmit`。
- `npm run build`：执行生产构建，等同于 `npm run build:prod`。
- `npm run preview`：预览最近一次 `dist/` 构建结果。

## 目录结构

```text
.
├── mock/                  # 本地 mock 接口和 mock 数据
├── public/                # 直接由浏览器访问的静态资源
├── src/
│   ├── api/               # Axios 接口封装
│   ├── app/               # 应用根组件
│   ├── assets/            # 由源码导入的资源
│   ├── components/        # 可复用组件
│   ├── config/            # 环境变量和运行时配置
│   ├── layouts/           # 页面布局
│   ├── router/            # 路由配置
│   ├── services/          # 业务服务编排
│   ├── styles/            # 全局样式、Tailwind token、Vant 覆盖
│   ├── types/             # 共享类型
│   ├── utils/             # 通用工具函数
│   └── views/             # 页面
└── vite.config.ts
```

页面目录：

```text
src/views/recharge/RechargeView.vue
src/views/bills/BillsView.vue
src/views/bills/BillDetailView.vue
```

## 路由

路由集中在 `src/router/index.ts`。

| Path | Name | Page |
| --- | --- | --- |
| `/` | - | redirect to `recharge-center` |
| `/recharge` | `recharge-center` | 充值 |
| `/bills` | `bills` | 帐单列表 |
| `/bills/:id` | `bill-detail` | 帐单详情 |

页面标题通过 `router.afterEach` 根据 `route.meta.title` 和 `VITE_APP_TITLE` 自动设置。

## API 开发约定

请求基础能力在 `src/api/http.ts`：

- 自动读取 `VITE_API_BASE_URL`
- 自动附加本地 `access_token`
- 统一处理 `{ code, data, message }` 响应结构
- 统一处理错误 toast

业务接口按领域放在 `src/api/` 中。例如钱包接口：

```ts
fetchWalletBalanceApi(tenantId)
submitWalletRechargeApi(params)
```

注意：API 封装中不要写 `/api` 前缀。开发环境 `VITE_API_BASE_URL=/api` 会自动补齐。例如：

```ts
post('/capital/wallet/recharge', params)
```

对应 mock 地址需要包含 `/api`：

```ts
url: '/api/capital/wallet/recharge'
```

## Mock 开发

本地 mock 由 `vite-plugin-mock` 加载，配置在 `vite.config.ts`：

```ts
viteMockServe({
  mockPath: 'mock',
  enable: command === 'serve',
  logger: true,
})
```

当前 mock 内容：

- `mock/index.ts`
  - `GET /api/capital/wallet/:tenantId/balance`
  - `POST /api/capital/wallet/recharge`
  - 用户登录/用户信息示例接口
- `mock/list.ts`
  - `bills`：最近 3 个月，每月 36 条，共 108 条帐单数据
  - 同时提供平铺 `list` 和按月聚合 `groups`

Mock 响应建议保持统一格式：

```ts
{
  code: 200,
  message: 'ok',
  data: {}
}
```

## 充值页面说明

充值页位于 `src/views/recharge/RechargeView.vue`，包含：

- Vant `NavBar`
- 余额查询
- 跳转帐单列表入口
- 固定金额选择，默认从 `50` 开始
- Vant `NumberKeyboard` 金额输入
- mock 充值成功提示

充值成功后会用接口返回的余额更新页面展示。

## 类型约定

共享类型放在 `src/types/` 并通过 `src/types/index.ts` 统一导出。

新增接口时建议同步增加：

1. 请求参数类型
2. 响应数据类型
3. API 函数泛型约束
4. mock 响应字段

## 样式约定

- 全局入口：`src/styles/index.css`
- Tailwind token：`src/styles/tailwind/theme.css`
- 基础样式：`src/styles/tailwind/base.css`
- Vant 覆盖工具类：`src/styles/utilities/vant.css`
- 通用工具类：`src/styles/utilities/common.css`

页面开发优先使用当前项目已有 token 和组件风格。移动端页面需要重点检查窄屏宽度下的文字换行、按钮尺寸和固定区域遮挡。

## 验证流程

提交前至少执行：

```bash
npm run typecheck
npm run build
```

涉及 UI 或路由时，再执行：

```bash
npm run dev
```

并手动验证关键路径，例如：

- `/recharge`
- `/bills`
- `/bills/:id`

涉及 mock 接口时，可以在开发服务启动后直接请求：

```bash
curl http://127.0.0.1:5173/api/capital/wallet/demo-tenant/balance
```

## 提交规范

使用英文 Conventional Commits，并保持单个提交聚焦。

示例：

```text
feat(recharge): implement wallet top-up workflow
feat(billing): add bill views and grouped mock data
chore(project): bootstrap Vue Vant H5 application
```

非平凡提交建议添加 body，说明行为变化、影响范围和验证结果。

## 配置和安全

- 不提交 `.env`。
- 浏览器可见变量必须以 `VITE_` 开头。
- 环境变量读取集中在 `src/config/env.ts`。
- 真实接口地址、密钥、令牌不要写入源码或 mock 数据。
