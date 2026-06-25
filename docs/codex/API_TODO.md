# API_TODO.md

## 已知接口与字段状态

### 微信登录

- 小程序 AppID：`wx85c6436ed75d4aa0`。
- AppSecret 已在会话中提供过，应只保存在本地环境变量或 `.env`，不要写入仓库文档或源码。
- 后端 `AuthService` 使用真实微信 `code2Session`；游客体验码保留本地 `dev:` openid 逻辑。

### 错题本

- `GET /wrong-questions`：返回当前用户未掌握错题，按 `lastWrongAt desc` 排序。
- `PATCH /wrong-questions/:questionId/mastered`：标记当前用户某题已掌握。
- 返回项类型：`WrongQuestionItem`，包含 `question`、`wrongCount`、`lastWrongAnswer`、`lastWrongAt`、`mastered`。
- `question` 使用 `formatQuestion`，应与 `/questions/practice` 的题目结构保持一致。

## 待确认或待开发 API

### 学习进度页

- 当前没有专门的进度统计 API。
- 需要确认统计口径：累计答题、正确率、错题数、连续天数、按题型掌握度、按等级掌握度、近 7 天趋势等。
- 可考虑新增 `GET /progress/summary` 或 `GET /users/me/progress`。

### 收藏题

- Prisma 已有 `FavoriteQuestion` 模型，前端有收藏入口和收藏页占位，但收藏题 API 尚未闭环。
- 需要确认是否需要：收藏/取消收藏、收藏列表、收藏模式练习。

### 题目反馈

- Prisma 已有 `Feedback` 模型，个人中心有反馈记录入口占位。
- 需要确认用户端提交反馈接口、反馈类型枚举、管理端处理流程。

### 管理端

- `apps/admin-web` 存在但当前不是主开发重点。
- 若开始管理端开发，需要先重新梳理题库录入、审核、发布、反馈处理接口。
