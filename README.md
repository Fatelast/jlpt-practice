# jlpt-practice

日语考试刷题小程序，专注 JLPT 备考刷题。

## 项目结构

- `apps/miniapp`：小程序端，Taro + Vue3 + TypeScript
- `apps/admin-web`：管理后台，Vue3 + Vite + TypeScript + Element Plus
- `server`：后端 API 服务，NestJS + Prisma
- `packages/shared`：共享类型
- `docs`：项目文档

## MVP 范围

- N5 / N4 刷题
- 文字词汇、语法、阅读专项练习
- 模拟测试
- 错题本
- 收藏题
- 答题记录
- 题目解析和反馈
- 管理后台题库维护

MVP 阶段不做背单词、课程、社区、支付会员和听力正式入口。

## 本地启动

安装依赖前请先确认 Node.js 版本，建议使用 Node.js 20 LTS。

```bash
npm install
```

启动 MySQL：

```bash
docker compose up -d
```

启动后端：

```bash
cd server
cp .env.example .env
npx prisma generate
npm run start:dev
```

启动小程序端：

```bash
cd apps/miniapp
npm run dev:weapp
```

启动管理后台：

```bash
cd apps/admin-web
npm run dev
```

## 下一步开发顺序

1. 后端基础工程
2. 数据库模型
3. 后端题库接口
4. 后端刷题接口
5. 小程序端刷题主流程
6. 错题本和收藏题
7. 管理后台题目维护
8. 题目反馈
9. 部署配置
10. 上线前检查

## 后端基础验证

```bash
npm install
npm run prisma:generate
npm run prisma:validate
npm run build:server
npm run typecheck:server
npm run test:server
```

数据库迁移和种子数据：

```bash
docker compose up -d
cd server
cp .env.example .env
npm run prisma:migrate
npm run prisma:seed
```
