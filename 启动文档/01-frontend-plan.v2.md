# 01-frontend-plan.v2.md

# 日语考试刷题小程序前端规划文档 v2

## 1. 文档定位

本文档用于指导 `jlpt-practice` 项目的前端开发，包含：

- 小程序端 `apps/miniapp`
- 管理后台前端 `apps/admin-web`

当前版本以 `PROJECT_STARTUP.md` 为总纲，目标已经收敛为：

> 专注 JLPT 日语考试刷题，不做背单词、课程学习、社区、支付会员等泛学习功能。

---

## 2. 项目前端目标

## 2.1 小程序端目标

小程序端面向普通用户，核心目标是完成刷题闭环：

1. 选择 JLPT 等级；
2. 选择题目分类；
3. 开始练习；
4. 完成答题；
5. 查看结果；
6. 查看解析；
7. 自动沉淀错题；
8. 支持收藏题目；
9. 支持题目反馈；
10. 查看基础答题统计。

## 2.2 管理后台目标

管理后台面向运营 / 管理员，核心目标是维护题库：

1. 管理员登录；
2. 题目列表；
3. 新增题目；
4. 编辑题目；
5. 题目审核；
6. 题目上架 / 下架；
7. 标签管理；
8. 用户反馈处理。

---

## 3. 明确不做的功能

MVP 阶段不做以下内容：

```txt
1. 背单词
2. 单词本
3. 单词记忆曲线
4. 每日单词
5. 学习课程
6. 视频课程
7. 社区讨论
8. 支付会员
9. AI 自动出题并自动上线
10. 听力题正式入口
```

说明：

- `moji_goi` 表示 JLPT 考试中的“文字词汇题型”，不是背单词功能。
- `listening` 仅作为预留类型，MVP 阶段前端不开放听力入口。

---

## 4. 技术栈

## 4.1 小程序端

```txt
Taro + Vue3 + TypeScript + Pinia + SCSS
```

## 4.2 管理后台

```txt
Vue3 + Vite + TypeScript + Element Plus + Pinia
```

---

## 5. Monorepo 前端目录

```txt
jlpt-practice/
├── apps/
│   ├── miniapp/
│   └── admin-web/
├── packages/
│   └── shared/
└── docs/
```

---

# 6. 小程序端规划

## 6.1 小程序端目录结构

```txt
apps/miniapp/
├── src/
│   ├── app.config.ts
│   ├── app.ts
│   ├── app.scss
│   ├── pages/
│   │   ├── home/
│   │   ├── practice/
│   │   ├── question/
│   │   ├── result/
│   │   ├── wrong-book/
│   │   ├── favorites/
│   │   ├── profile/
│   │   └── login/
│   ├── components/
│   │   ├── QuestionCard/
│   │   ├── OptionList/
│   │   ├── AnswerAnalysis/
│   │   ├── LevelSelector/
│   │   ├── CategorySelector/
│   │   ├── PracticeModeSelector/
│   │   ├── QuestionFeedbackPopup/
│   │   ├── EmptyState/
│   │   └── LoadingView/
│   ├── services/
│   │   ├── request.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── question.ts
│   │   ├── practice.ts
│   │   ├── wrongBook.ts
│   │   ├── favorite.ts
│   │   └── feedback.ts
│   ├── stores/
│   │   ├── user.ts
│   │   ├── practice.ts
│   │   └── app.ts
│   ├── types/
│   │   ├── common.ts
│   │   ├── user.ts
│   │   ├── question.ts
│   │   ├── practice.ts
│   │   └── feedback.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── storage.ts
│   │   ├── route.ts
│   │   ├── format.ts
│   │   └── enumText.ts
│   └── assets/
├── package.json
└── project.config.json
```

---

## 6.2 小程序页面清单

| 页面 | 路径 | 说明 |
|---|---|---|
| 首页 | `/pages/home/index` | 刷题入口、等级入口、统计概览 |
| 练习配置页 | `/pages/practice/index` | 选择等级、分类、模式、题量 |
| 做题页 | `/pages/question/index` | 核心做题页面 |
| 结果页 | `/pages/result/index` | 本次练习结果 |
| 错题本 | `/pages/wrong-book/index` | 查看和重练错题 |
| 收藏题 | `/pages/favorites/index` | 查看和重练收藏题 |
| 我的 | `/pages/profile/index` | 用户信息和统计 |
| 登录页 | `/pages/login/index` | 微信登录 |

---

# 7. 小程序页面详细规划

## 7.1 首页

### 页面目标

首页只做刷题入口和用户学习概览，不做学习课程、背单词、社区入口。

### 展示内容

1. 当前学习等级；
2. 等级切换：N5 / N4；
3. 专项练习入口：
   - 文字词汇
   - 语法
   - 阅读
4. 模拟测试入口；
5. 错题本入口；
6. 收藏题入口；
7. 简单统计：
   - 累计答题数
   - 正确率
   - 错题数
   - 收藏数

### 交互规则

1. 首次进入如果未选择等级，默认 `N5`；
2. 切换等级后更新用户当前等级；
3. 点击分类入口进入练习配置页；
4. 点击模拟测试进入练习配置页，模式默认 `mock_exam`；
5. 点击错题本进入错题列表；
6. 点击收藏题进入收藏列表。

---

## 7.2 练习配置页

### 页面目标

让用户在开始刷题前选择练习条件。

### 配置项

```ts
interface PracticeConfig {
  level: 'N5' | 'N4';
  category: 'moji_goi' | 'grammar' | 'reading' | 'mixed';
  mode: 'sequence' | 'random' | 'wrong' | 'favorite' | 'mock_exam';
  count: 10 | 20 | 30 | 50;
}
```

### 分类说明

| 分类 | 含义 | MVP 是否开放 |
|---|---|---|
| `moji_goi` | 文字词汇题型 | 是 |
| `grammar` | 语法题型 | 是 |
| `reading` | 阅读题型 | 是 |
| `mixed` | 混合题型，用于模拟测试 | 是 |
| `listening` | 听力题型 | 否 |

### 练习模式

| 模式 | 含义 |
|---|---|
| `sequence` | 顺序练习 |
| `random` | 随机练习 |
| `wrong` | 错题练习 |
| `favorite` | 收藏题练习 |
| `mock_exam` | 模拟测试 |

### 启动练习流程

```txt
用户选择条件
  ↓
点击开始练习
  ↓
调用 GET /api/questions/practice
  ↓
获取题目列表
  ↓
调用 POST /api/practice-records 创建练习记录
  ↓
进入做题页
```

---

## 7.3 做题页

### 页面目标

完成单次练习中的题目展示、答题、判题、解析、收藏、反馈。

### 展示内容

1. 当前题号 / 总题数；
2. 题型名称；
3. 题干；
4. 阅读文章，阅读题时展示；
5. 选项列表；
6. 提交答案按钮；
7. 答题结果；
8. 正确答案；
9. 解析；
10. 收藏按钮；
11. 题目反馈按钮；
12. 下一题按钮。

### 做题流程

```txt
进入做题页
  ↓
展示当前题
  ↓
用户选择答案
  ↓
点击提交
  ↓
POST /api/practice-records/:id/answers
  ↓
后端返回判题结果
  ↓
展示正确答案和解析
  ↓
用户点击下一题
  ↓
最后一题完成后 POST /api/practice-records/:id/finish
  ↓
进入结果页
```

### 做题页状态

```ts
interface QuestionPageState {
  practiceRecordId: string;
  questions: Question[];
  currentIndex: number;
  selectedAnswer: string;
  isSubmitted: boolean;
  answerResult?: SubmitAnswerResult;
  startAnswerTime: number;
}
```

---

## 7.4 结果页

### 页面目标

展示本次刷题结果。

### 展示内容

1. 总题数；
2. 正确数；
3. 错误数；
4. 正确率；
5. 用时；
6. 查看错题；
7. 再练一次；
8. 返回首页。

### 数据结构

```ts
interface PracticeResult {
  practiceRecordId: string;
  totalCount: number;
  correctCount: number;
  wrongCount: number;
  accuracy: number;
  durationSeconds: number;
}
```

---

## 7.5 错题本

### 页面目标

展示用户错题，并支持重新练习。

### 功能

1. 按等级筛选；
2. 按分类筛选；
3. 查看错题列表；
4. 重新练习错题；
5. 标记已掌握；
6. 移出错题本。

### 交互规则

1. 默认展示未掌握错题；
2. 用户答错题目后由后端自动写入错题本；
3. 标记已掌握后不在默认错题列表中展示；
4. 错题练习时只从未掌握错题中抽题。

---

## 7.6 收藏题

### 页面目标

展示用户收藏的题目，并支持重新练习。

### 功能

1. 按等级筛选；
2. 按分类筛选；
3. 查看收藏题列表；
4. 取消收藏；
5. 重新练习收藏题。

---

## 7.7 我的页面

### 页面目标

展示用户信息和简单统计。

### 功能

1. 微信头像；
2. 用户昵称；
3. 当前学习等级；
4. 累计答题数；
5. 正确率；
6. 错题数；
7. 收藏数；
8. 退出登录。

---

# 8. 小程序端核心类型

## 8.1 题目类型

```ts
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type QuestionCategory =
  | 'moji_goi'
  | 'grammar'
  | 'reading'
  | 'listening';

export type QuestionType =
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

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  level: JLPTLevel;
  category: QuestionCategory;
  type: QuestionType;
  stem: string;
  passage?: string;
  options: QuestionOption[];
  answer?: string;
  explanation?: string;
  translation?: string;
  audioUrl?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags: string[];
  isFavorite?: boolean;
}
```

说明：

- MVP 使用后端判题；
- 小程序端不依赖 `answer` 判题；
- `answer` 可在提交后由后端返回；
- `audioUrl` 预留，不开放听力入口。

---

## 8.2 练习类型

```ts
export type PracticeMode =
  | 'sequence'
  | 'random'
  | 'wrong'
  | 'favorite'
  | 'mock_exam';

export interface CreatePracticePayload {
  level: JLPTLevel;
  category: QuestionCategory | 'mixed';
  mode: PracticeMode;
  questionIds: string[];
}

export interface SubmitAnswerPayload {
  questionId: string;
  selectedAnswer: string;
  durationSeconds: number;
}

export interface SubmitAnswerResult {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}
```

---

# 9. 小程序端 API 封装

## 9.1 request.ts 规则

统一封装：

1. baseURL；
2. token 注入；
3. loading 控制；
4. 401 跳转登录；
5. 统一错误提示；
6. 统一响应解包。

响应格式：

```ts
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

---

## 9.2 services 文件

```txt
services/
├── auth.ts
├── user.ts
├── question.ts
├── practice.ts
├── wrongBook.ts
├── favorite.ts
└── feedback.ts
```

---

# 10. 小程序状态管理

## 10.1 user store

```ts
interface UserState {
  token: string;
  userInfo: UserInfo | null;
  currentLevel: JLPTLevel;
}
```

方法：

```txt
login
logout
getUserInfo
setCurrentLevel
```

---

## 10.2 practice store

```ts
interface PracticeState {
  practiceRecordId: string;
  questions: Question[];
  currentIndex: number;
  answers: SubmitAnswerResult[];
  config: PracticeConfig | null;
}
```

方法：

```txt
startPractice
submitAnswer
nextQuestion
finishPractice
resetPractice
```

---

# 11. 管理后台前端规划

## 11.1 管理后台目录结构

```txt
apps/admin-web/
├── src/
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   ├── stores/
│   ├── services/
│   │   ├── request.ts
│   │   ├── auth.ts
│   │   ├── question.ts
│   │   ├── tag.ts
│   │   └── feedback.ts
│   ├── views/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── questions/
│   │   │   ├── list.vue
│   │   │   ├── create.vue
│   │   │   └── edit.vue
│   │   ├── tags/
│   │   └── feedback/
│   ├── components/
│   │   ├── QuestionForm/
│   │   ├── OptionEditor/
│   │   └── SearchForm/
│   ├── types/
│   └── utils/
├── package.json
└── vite.config.ts
```

---

## 11.2 后台页面

| 页面 | 功能 |
|---|---|
| 登录页 | 管理员登录 |
| 控制台 | 数据概览 |
| 题目列表 | 查询、筛选、审核、上下架 |
| 新增题目 | 录入原创 / 授权题 |
| 编辑题目 | 修改题目内容 |
| 标签管理 | 知识点标签维护 |
| 反馈管理 | 处理用户反馈 |

---

## 11.3 题目表单字段

```ts
interface QuestionFormModel {
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category: 'moji_goi' | 'grammar' | 'reading' | 'listening';
  type: QuestionType;
  stem: string;
  passage?: string;
  options: {
    key: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  answer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  translation?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tagIds: string[];
  sourceType: 'original' | 'authorized' | 'public_license';
  sourceRemark?: string;
}
```

### 表单校验

1. 题干不能为空；
2. 选项固定为 A/B/C/D；
3. 每个选项文本不能为空；
4. 正确答案必须是 A/B/C/D；
5. 解析不能为空；
6. 来源类型不能为空；
7. 非原创题必须填写来源说明；
8. MVP 阶段不允许发布 `listening` 类型题目。

---

# 12. 前端开发顺序

## 12.1 小程序端

```txt
1. 初始化 Taro + Vue3 + TypeScript 项目
2. 创建页面目录和路由
3. 创建基础类型文件
4. 封装 request
5. 创建 services
6. 创建 user store
7. 创建 practice store
8. 开发首页
9. 开发练习配置页
10. 开发做题页
11. 开发结果页
12. 开发错题本
13. 开发收藏题
14. 开发我的页面
15. 接入反馈弹窗
16. 完成联调
```

## 12.2 管理后台

```txt
1. 初始化 Vue3 + Vite + TypeScript + Element Plus
2. 配置路由
3. 封装 request
4. 实现登录页
5. 实现题目列表
6. 实现题目表单组件
7. 实现新增题目
8. 实现编辑题目
9. 实现审核 / 上下架操作
10. 实现标签管理
11. 实现反馈管理
```

---

# 13. Codex 执行约束

```txt
1. 严格围绕刷题功能开发。
2. 不新增背单词相关页面、组件、接口。
3. 不新增课程、社区、支付、会员入口。
4. 听力类型可以保留，但前端不开放入口。
5. 小程序端不直接访问数据库。
6. 页面业务逻辑不要过重，接口请求统一放 services。
7. 做题页需要支持不同题型的展示差异。
8. 后台题目录入必须校验来源类型。
9. 所有新增类型需要放在 types 目录统一维护。
10. 先完成主流程，再做样式优化。
