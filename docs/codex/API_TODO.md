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

### 学习进度页

- `GET /progress/summary`：返回当前用户学习进度汇总。
- 返回项类型：`ProgressSummary`，包含 `overview`、`recentDays`、`categoryMastery`。
- 当前统计口径：
  - `totalAnswered`、`correctCount`、`accuracy` 来自 `AnswerRecord`。
  - `wrongQuestionCount` 来自未掌握且题目已发布未删除的 `WrongQuestion`。
  - `recentDays` 固定补齐最近 7 天。
  - `categoryMastery` 当前展示文字词汇、语法、阅读三类。
  - `streakDays` 按服务端 UTC 日期向前连续有答题记录的天数计算。

### 收藏题

- `GET /favorites`：返回当前用户收藏题列表，只包含已发布且未删除题目，按 `createdAt desc` 排序。
- `POST /favorites/:questionId`：收藏题目，只允许收藏已发布且未删除题目。
- `DELETE /favorites/:questionId`：取消收藏，接口对未收藏题保持幂等。
- 收藏练习复用 `GET /questions/practice?mode=favorite` 的既有筛选逻辑。


### 题目反馈

- `POST /feedback`：当前用户提交题目反馈，要求题目已发布且未删除。
- `GET /feedback/my`：返回当前用户提交过的反馈记录，按 `createdAt desc` 排序。
- 反馈类型：`stem_error`、`option_error`、`answer_error`、`explanation_error`、`translation_error`、`other`。
- 反馈状态：`pending`、`processing`、`resolved`、`closed`。
## 待确认或待开发 API

### 管理端反馈处理

- 用户端题目反馈闭环已完成。
- 管理端反馈列表、处理备注和状态流转尚未开发。

### 管理端

- `apps/admin-web` 存在但当前不是主开发重点。
- 若开始管理端开发，需要先重新梳理题库录入、审核、发布、反馈处理接口。
