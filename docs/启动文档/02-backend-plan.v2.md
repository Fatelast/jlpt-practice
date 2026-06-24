# 02-backend-plan.v2.md

# 日语考试刷题小程序后端规划文档 v2

## 1. 文档定位

本文档用于指导 `jlpt-practice` 项目的后端服务开发。

后端项目路径：

```txt
server/
```

当前版本以 `PROJECT_STARTUP.md` 为总纲，后端只围绕刷题业务设计，不实现背单词、课程、社区、支付会员等非 MVP 功能。

---

## 2. 后端目标

后端负责提供以下能力：

1. 微信小程序登录；
2. 管理员登录；
3. 用户信息管理；
4. 题库查询；
5. 练习题生成；
6. 练习记录；
7. 答题判题；
8. 错题本；
9. 收藏题；
10. 题目反馈；
11. 管理后台题目维护；
12. 标签管理；
13. 题目审核和上下架。

---

## 3. 明确不做的后端能力

MVP 阶段不做：

```txt
1. 背单词模块
2. 单词本模块
3. 单词记忆曲线
4. 课程模块
5. 社区模块
6. 支付会员模块
7. AI 自动出题并自动发布
8. 听力资源上传和音频处理
```

说明：

- `moji_goi` 是考试题型，不是背单词模块。
- `listening` 字段和枚举可以预留，但不开放正式业务流程。

---

## 4. 技术栈

```txt
Node.js + NestJS + TypeScript + Prisma + MySQL
```

可选后续扩展：

```txt
Redis      缓存题目池、登录态扩展
BullMQ     批量导入、AI 生成任务队列
COS/OSS    后续音频、图片资源存储
```

MVP 阶段不强制引入 Redis、队列、对象存储。

---

## 5. 后端目录结构

```txt
server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   └── utils/
│   ├── config/
│   │   ├── config.module.ts
│   │   └── env.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── questions/
│   │   ├── practice-records/
│   │   ├── wrong-questions/
│   │   ├── favorites/
│   │   ├── tags/
│   │   ├── feedback/
│   │   └── admin/
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   └── types/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── package.json
├── Dockerfile
├── .env.example
└── README.md
```

---

# 6. 后端模块设计

## 6.1 Auth 模块

### 目标

负责用户和管理员认证。

### 功能

1. 微信小程序登录；
2. 管理员登录；
3. JWT 签发；
4. JWT 校验；
5. 获取当前登录身份。

### 接口

#### 微信登录

```txt
POST /api/auth/wechat-login
```

请求：

```ts
interface WechatLoginDto {
  code: string;
  nickname?: string;
  avatarUrl?: string;
}
```

返回：

```ts
interface WechatLoginResult {
  token: string;
  user: {
    id: string;
    nickname?: string;
    avatarUrl?: string;
    currentLevel: string;
  };
}
```

流程：

```txt
小程序 wx.login 获取 code
  ↓
前端发送 code 到后端
  ↓
后端请求微信接口换取 openid
  ↓
根据 openid 查询用户
  ↓
不存在则创建用户
  ↓
签发 JWT
  ↓
返回 token 和用户信息
```

#### 管理员登录

```txt
POST /api/auth/admin-login
```

请求：

```ts
interface AdminLoginDto {
  username: string;
  password: string;
}
```

返回：

```ts
interface AdminLoginResult {
  token: string;
  admin: {
    id: string;
    username: string;
    role: 'admin' | 'editor' | 'reviewer';
  };
}
```

---

## 6.2 Users 模块

### 目标

管理小程序用户信息和用户统计。

### 接口

#### 获取当前用户

```txt
GET /api/users/me
```

#### 更新当前学习等级

```txt
PATCH /api/users/current-level
```

请求：

```ts
interface UpdateCurrentLevelDto {
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
}
```

#### 获取用户统计

```txt
GET /api/users/stats
```

返回：

```ts
interface UserStats {
  totalAnswered: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  wrongQuestionCount: number;
  favoriteCount: number;
}
```

说明：

- 统计只围绕刷题；
- 不统计背单词、课程学习、打卡等内容。

---

## 6.3 Questions 模块

### 目标

负责小程序端题目查询和管理后台题库维护的基础能力。

### 题目分类

```ts
type QuestionCategory =
  | 'moji_goi'
  | 'grammar'
  | 'reading'
  | 'listening';
```

### 题目类型

```ts
type QuestionType =
  | 'single_choice'
  | 'kanji_reading'
  | 'word_context'
  | 'paraphrase'
  | 'usage'
  | 'grammar_choice'
  | 'sentence_order'
  | 'text_grammar'
  | 'reading_choice'
  | 'listening_choice';
```

### 题目状态

```ts
type QuestionStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'offline'
  | 'rejected';
```

### 题目来源

```ts
type SourceType =
  | 'original'
  | 'authorized'
  | 'public_license';
```

禁止将以下内容直接入库：

```txt
1. 真题 PDF
2. 网上下载题库
3. 论坛整理题库
4. 网盘资源
5. 来源不明题目
6. 第三方题库爬取内容
7. 官方真题搬运内容
```

---

## 6.4 小程序题目接口

### 获取练习题

```txt
GET /api/questions/practice
```

查询参数：

```ts
interface GetPracticeQuestionsQuery {
  level: 'N5' | 'N4';
  category: 'moji_goi' | 'grammar' | 'reading' | 'mixed';
  mode: 'sequence' | 'random' | 'wrong' | 'favorite' | 'mock_exam';
  count: number;
}
```

返回：

```ts
interface PracticeQuestion {
  id: string;
  level: string;
  category: string;
  type: string;
  stem: string;
  passage?: string;
  options: {
    key: string;
    text: string;
  }[];
  explanation?: string;
  translation?: string;
  audioUrl?: string;
  difficulty: number;
  tags: string[];
  isFavorite: boolean;
}
```

说明：

- 小程序端获取题目时，默认不返回 `answer`；
- 用户提交答案后，由后端判题并返回正确答案和解析；
- 这样可以避免前端直接依赖答案字段。

### 获取题目详情

```txt
GET /api/questions/:id
```

---

## 6.5 PracticeRecords 模块

### 目标

负责练习创建、答题、判题、练习完成和练习历史。

### 接口

#### 创建练习记录

```txt
POST /api/practice-records
```

请求：

```ts
interface CreatePracticeRecordDto {
  level: string;
  category: string;
  mode: string;
  questionIds: string[];
}
```

返回：

```ts
interface CreatePracticeRecordResult {
  practiceRecordId: string;
}
```

后端处理：

1. 校验用户登录；
2. 校验题目 ID 是否存在；
3. 校验题目是否 published；
4. 创建练习记录；
5. 初始状态为 `in_progress`。

---

#### 提交单题答案

```txt
POST /api/practice-records/:id/answers
```

请求：

```ts
interface SubmitAnswerDto {
  questionId: string;
  selectedAnswer: string;
  durationSeconds: number;
}
```

返回：

```ts
interface SubmitAnswerResult {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}
```

后端处理：

```txt
1. 校验练习记录属于当前用户
2. 查询题目正确答案
3. 判断 selectedAnswer 是否正确
4. 写入 answer_records
5. 更新 questions.total_attempts
6. 如果正确，更新 questions.correct_attempts
7. 如果错误，写入或更新 wrong_questions
8. 更新 practice_records 当前统计
9. 更新 user_daily_stats
10. 返回判题结果
```

---

#### 完成练习

```txt
POST /api/practice-records/:id/finish
```

返回：

```ts
interface FinishPracticeResult {
  practiceRecordId: string;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  durationSeconds: number;
}
```

#### 获取练习历史

```txt
GET /api/practice-records
```

---

## 6.6 WrongQuestions 模块

### 目标

负责错题本查询和维护。

### 接口

#### 获取错题本

```txt
GET /api/wrong-questions
```

查询参数：

```ts
interface WrongQuestionQuery {
  level?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category?: 'moji_goi' | 'grammar' | 'reading';
  mastered?: boolean;
  page: number;
  pageSize: number;
}
```

#### 移出错题本

```txt
DELETE /api/wrong-questions/:questionId
```

#### 标记已掌握

```txt
POST /api/wrong-questions/:questionId/mastered
```

规则：

1. 用户答错后自动写入错题本；
2. 同一用户同一道题只保留一条错题记录；
3. 再次答错时 `wrong_count + 1`；
4. 标记已掌握后默认不出现在错题练习里；
5. 如果后续再次答错，重新设为未掌握。

---

## 6.7 Favorites 模块

### 目标

负责收藏题目。

### 接口

#### 收藏题目

```txt
POST /api/favorites
```

请求：

```ts
interface CreateFavoriteDto {
  questionId: string;
}
```

#### 取消收藏

```txt
DELETE /api/favorites/:questionId
```

#### 获取收藏列表

```txt
GET /api/favorites
```

规则：

1. 同一用户同一道题只能收藏一次；
2. 重复收藏直接返回成功；
3. 取消不存在的收藏也可以返回成功，避免前端额外处理。

---

## 6.8 Feedback 模块

### 目标

负责用户提交题目反馈，以及管理后台处理反馈。

### 小程序端接口

```txt
POST /api/feedback
```

请求：

```ts
interface CreateFeedbackDto {
  questionId: string;
  type:
    | 'wrong_answer'
    | 'unclear_explanation'
    | 'typo'
    | 'difficulty'
    | 'other';
  content: string;
}
```

### 管理后台接口

```txt
GET /api/admin/feedback
PATCH /api/admin/feedback/:id
```

反馈状态：

```ts
type FeedbackStatus =
  | 'pending'
  | 'processing'
  | 'resolved'
  | 'ignored';
```

---

## 6.9 Tags 模块

### 目标

管理知识点标签。

### 后台接口

```txt
GET /api/admin/tags
POST /api/admin/tags
PATCH /api/admin/tags/:id
DELETE /api/admin/tags/:id
```

默认标签示例：

```txt
助词
动词变形
形容词
名词
副词
时间表达
数量词
汉字读音
词义辨析
基础语法
阅读理解
日常表达
```

---

# 7. Admin 模块

## 7.1 管理后台题目接口

### 题目列表

```txt
GET /api/admin/questions
```

查询参数：

```ts
interface AdminQuestionListQuery {
  level?: string;
  category?: string;
  type?: string;
  status?: string;
  keyword?: string;
  page: number;
  pageSize: number;
}
```

### 新增题目

```txt
POST /api/admin/questions
```

请求：

```ts
interface CreateQuestionDto {
  level: string;
  category: string;
  type: string;
  stem: string;
  passage?: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  translation?: string;
  audioUrl?: string;
  imageUrl?: string;
  difficulty: number;
  tagIds: string[];
  sourceType: 'original' | 'authorized' | 'public_license';
  sourceRemark?: string;
}
```

### 编辑题目

```txt
PATCH /api/admin/questions/:id
```

### 提交审核

```txt
POST /api/admin/questions/:id/submit-review
```

### 审核通过

```txt
POST /api/admin/questions/:id/approve
```

### 审核驳回

```txt
POST /api/admin/questions/:id/reject
```

请求：

```ts
interface RejectQuestionDto {
  reason: string;
}
```

### 上架

```txt
POST /api/admin/questions/:id/publish
```

### 下架

```txt
POST /api/admin/questions/:id/offline
```

---

## 7.2 题目入库校验规则

新增和编辑题目时必须校验：

```txt
1. level 必须合法
2. category 必须合法
3. type 必须合法
4. stem 不能为空
5. options 必须包含 A/B/C/D
6. 每个 option 文本不能为空
7. answer 必须是 A/B/C/D
8. explanation 不能为空
9. difficulty 必须在 1-5
10. sourceType 不能为空
11. sourceType 非 original 时，sourceRemark 必填
12. MVP 阶段不允许发布 listening 题
13. 小程序端只允许查询 published 题目
```

---

# 8. 权限设计

## 8.1 用户角色

```ts
type AdminRole = 'admin' | 'editor' | 'reviewer';
```

| 角色 | 权限 |
|---|---|
| `admin` | 全部后台权限 |
| `editor` | 新增、编辑、提交审核 |
| `reviewer` | 审核、上架、下架、处理反馈 |

## 8.2 权限规则

1. 小程序接口必须校验用户 token；
2. 后台接口必须校验管理员 token；
3. 审核和上下架操作必须校验角色；
4. 用户只能访问自己的错题、收藏、练习记录；
5. 小程序端不能访问草稿、待审核、下架、驳回题目。

---

# 9. 统一响应格式

```ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

成功：

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

失败：

```json
{
  "code": 40000,
  "message": "参数错误",
  "data": null
}
```

---

# 10. 错误码建议

```txt
0       success
40000   请求参数错误
40001   缺少必要参数
40100   未登录
40101   token 无效
40300   无权限
40400   数据不存在
40900   数据冲突
50000   服务端错误
```

---

# 11. 环境变量

```env
NODE_ENV=development
PORT=3000

DATABASE_URL="mysql://root:password@localhost:3306/jlpt_practice"

JWT_SECRET="please_change_this_secret"
JWT_EXPIRES_IN="7d"

WECHAT_APP_ID=""
WECHAT_APP_SECRET=""

ADMIN_INITIAL_USERNAME="admin"
ADMIN_INITIAL_PASSWORD="change_me"
```

---

# 12. 后端开发顺序

```txt
1. 初始化 NestJS 项目
2. 配置 Prisma + MySQL
3. 配置环境变量
4. 创建 PrismaService
5. 创建统一响应拦截器
6. 创建全局异常过滤器
7. 创建参数校验管道
8. 创建 JWT 鉴权
9. 实现 Auth 模块
10. 实现 Users 模块
11. 实现 Questions 模块
12. 实现 PracticeRecords 模块
13. 实现 WrongQuestions 模块
14. 实现 Favorites 模块
15. 实现 Feedback 模块
16. 实现 Admin Questions 接口
17. 实现 Admin Tags 接口
18. 实现 Admin Feedback 接口
19. 编写 seed.ts
20. 和小程序端联调
```

---

# 13. Codex 执行约束

```txt
1. 不创建背单词相关模块。
2. 不创建课程、社区、支付、会员模块。
3. 听力字段可预留，但不实现音频上传和听力主流程。
4. 小程序端题目查询只返回 published 题目。
5. 用户提交答案时由后端判题。
6. 答题记录必须保存 correctAnswer 快照。
7. 答错后必须自动写入或更新错题本。
8. 收藏题需要做用户 + 题目唯一约束。
9. 错题本需要做用户 + 题目唯一约束。
10. 所有题目必须记录 sourceType。
11. 来源不明题目不允许入库。
12. 删除题目优先软删除。
13. Controller 不写复杂业务逻辑，业务逻辑放 Service。
14. Prisma 调用集中在 Service 层。
15. MVP 先保证主刷题流程闭环。
