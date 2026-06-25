# PROJECT_CONTEXT.md

## 项目概览

- 项目名：`jlpt-practice`，日语 JLPT 刷题小程序 monorepo。
- 包管理：npm workspaces。
- Node 要求：`>=20.0.0`。
- 主要工作区：
  - `apps/miniapp`：Taro 4 + Vue 3 + Pinia 微信小程序端。
  - `apps/admin-web`：管理端，当前不是主开发重点。
  - `server`：NestJS 10 + Prisma + MySQL 后端 API。
  - `packages/shared`：前后端共享 TypeScript 类型。

## 启动与构建命令

- 数据库：`docker compose up -d mysql`
- Prisma 生成：`npm run prisma:generate`
- 数据迁移：`npm run prisma:migrate`
- 种子数据：`npm run prisma:seed`
- 后端开发：`npm run dev:server`
- 小程序开发构建监听：`npm run dev:miniapp`
- 小程序生产构建：`npm run build:miniapp`
- 服务端类型检查：`npm run typecheck:server`
- 小程序类型检查：`npm --workspace apps/miniapp run typecheck`

## 小程序端结构

- 页面注册位于 `apps/miniapp/src/app.config.ts`。
- 当前注册页面：登录、首页、练习配置、做题、结果、进度、错题本、收藏、个人中心。
- 微信开发工具应打开/加载 `apps/miniapp/dist` 构建产物。
- 若新增页面后运行时报 `page ... is not found`，先确认 `src/app.config.ts` 和 `dist/app.json` 是否一致，并重新执行 `npm --workspace apps/miniapp run build:weapp`。
- 底部导航组件：`apps/miniapp/src/components/BottomTabBar/index.vue`。
- 图标组件：`apps/miniapp/src/components/AppIcon/index.vue`。
- 当前 UI 方向：绿色学习产品风格，底部导航包含学习、复盘、进度、我的。

## 后端结构

- 根模块：`server/src/app.module.ts`。
- 已注册模块：`AuthModule`、`UsersModule`、`QuestionsModule`、`WrongQuestionsModule`、`PracticeRecordsModule`、`PrismaModule`。
- 鉴权：受保护用户接口使用 `UserJwtGuard`，依赖 `AuthModule` 导出的 `JwtModule`。
- 新增使用 `UserJwtGuard` 的模块必须导入 `AuthModule`，否则运行时会出现 `JwtService` 依赖解析失败。

## 数据模型要点

- 数据库：MySQL 8，Prisma schema 位于 `server/prisma/schema.prisma`。
- 用户错题表：`WrongQuestion`，关键字段包括 `wrongCount`、`lastWrongAnswer`、`lastWrongAt`、`mastered`、`masteredAt`。
- 答错题时由 `PracticeRecordsService.submitAnswer` 写入或更新 `wrong_questions`。
- 题目返回结构通过 `server/src/modules/questions/question-presenter.ts` 的 `formatQuestion` 统一格式化。

## 已完成的重要功能

- 微信登录：已接入真实 `code2Session`，同时保留游客体验码本地 openid 逻辑。
- 小程序核心页面：登录、首页、练习配置、做题、结果、错题本、进度、个人中心基础页。
- 错题本闭环：后端提供错题列表和标记掌握接口；前端错题本接入真实数据；练习配置开放错题模式；结果页可跳转错题本。
- 进度页当前为基础占位统计页，页面已注册，入口需要依赖最新 `dist/app.json`。

## 最近验证记录

- `npm --workspace server run typecheck` 通过。
- `npm --workspace server run test -- wrong-questions.service.spec.ts` 通过。
- `npm --workspace server run build` 通过。
- 后端编译产物短启并请求 `/api/health` 返回 200。
- `npm --workspace apps/miniapp run typecheck` 通过。
- `npm --workspace apps/miniapp run build:weapp` 通过。

## 注意事项

- 当前仓库有未提交变更，继续开发前应先查看 `git status --short`，不要回滚用户或其他会话的改动。
- 展示中文文案必须用 `t('中文')` 包裹。
- 当前部分历史文件曾出现乱码显示，修改时优先保持新增内容为正常 UTF-8 中文。
- 删除文件前必须先征求用户确认。
