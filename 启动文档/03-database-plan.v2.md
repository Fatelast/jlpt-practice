# 03-database-plan.v2.md

# 日语考试刷题小程序数据库规划文档 v2

## 1. 文档定位

本文档用于指导 `jlpt-practice` 项目的数据库设计和 Prisma 建模。

数据库服务用于支撑：

1. 用户；
2. 管理员；
3. 题库；
4. 选项；
5. 标签；
6. 练习记录；
7. 答题明细；
8. 错题本；
9. 收藏题；
10. 题目反馈；
11. 用户刷题统计。

当前版本只围绕刷题业务设计，不设计背单词、课程、社区、支付会员等非 MVP 数据表。

---

## 2. 数据库技术选型

```txt
MySQL 8.x
Prisma ORM
utf8mb4 字符集
```

---

## 3. 数据库设计原则

```txt
1. 题目和选项拆表。
2. 题目必须有来源类型。
3. 题目必须有状态。
4. 小程序端只展示 published 题目。
5. 题目使用软删除。
6. 答题记录保存 correctAnswer 快照。
7. 错题本按 user_id + question_id 唯一。
8. 收藏题按 user_id + question_id 唯一。
9. 标签和题目是多对多关系。
10. MVP 不建立背单词相关表。
11. 听力字段预留，但不建立复杂音频资源表。
```

---

# 4. 核心枚举

## 4.1 JLPT 等级

```txt
N5
N4
N3
N2
N1
```

MVP 阶段开放：

```txt
N5
N4
```

---

## 4.2 题目分类 category

```txt
moji_goi    文字词汇题型
grammar     语法题型
reading     阅读题型
listening   听力题型，MVP 预留
```

说明：

- `moji_goi` 是 JLPT 文字词汇考试题型；
- 不代表背单词功能；
- 不建立单词本、单词记忆记录等表。

---

## 4.3 题目类型 type

```txt
single_choice       普通单选
kanji_reading       汉字读音
word_context        文脉规定
paraphrase          近义表达
usage               用法
grammar_choice      语法选择
sentence_order      句子排序
text_grammar        文章语法
reading_choice      阅读选择
listening_choice    听力选择，MVP 预留
```

---

## 4.4 练习模式 mode

```txt
sequence     顺序练习
random       随机练习
wrong        错题练习
favorite     收藏练习
mock_exam    模拟测试
```

---

## 4.5 题目状态 status

```txt
draft             草稿
pending_review    待审核
published         已发布
offline           已下架
rejected          已驳回
```

---

## 4.6 来源类型 source_type

```txt
original          原创
authorized        已授权
public_license    公开许可
```

禁止来源：

```txt
真题 PDF
网上下载
论坛整理
网盘资源
来源不明
官方真题搬运
第三方题库爬取
```

---

# 5. 数据表清单

MVP 阶段需要以下表：

```txt
users
admins
questions
question_options
tags
question_tags
practice_records
answer_records
wrong_questions
favorite_questions
feedback
user_daily_stats
```

暂不建立：

```txt
words
word_books
word_memory_records
courses
lessons
payments
memberships
communities
audio_resources
```

---

# 6. 表结构设计

## 6.1 users 用户表

```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信 openid',
  unionid VARCHAR(100) NULL COMMENT '微信 unionid',
  nickname VARCHAR(100) NULL COMMENT '用户昵称',
  avatar_url VARCHAR(500) NULL COMMENT '头像地址',
  current_level VARCHAR(10) NOT NULL DEFAULT 'N5' COMMENT '当前练习等级',
  status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active/disabled',
  last_login_at DATETIME NULL COMMENT '最后登录时间',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) COMMENT='小程序用户表';
```

索引：

```sql
CREATE UNIQUE INDEX idx_users_openid ON users(openid);
CREATE INDEX idx_users_current_level ON users(current_level);
```

---

## 6.2 admins 管理员表

```sql
CREATE TABLE admins (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) NOT NULL UNIQUE COMMENT '管理员用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  role VARCHAR(30) NOT NULL DEFAULT 'editor' COMMENT 'admin/editor/reviewer',
  status VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active/disabled',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) COMMENT='管理员表';
```

索引：

```sql
CREATE UNIQUE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_admins_role ON admins(role);
```

---

## 6.3 questions 题目表

```sql
CREATE TABLE questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  level VARCHAR(10) NOT NULL COMMENT 'JLPT 等级 N5/N4/N3/N2/N1',
  category VARCHAR(30) NOT NULL COMMENT 'moji_goi/grammar/reading/listening',
  type VARCHAR(30) NOT NULL COMMENT '题目类型',

  stem TEXT NOT NULL COMMENT '题干',
  passage TEXT NULL COMMENT '阅读文章',
  translation TEXT NULL COMMENT '中文翻译',
  explanation TEXT NOT NULL COMMENT '解析',

  answer VARCHAR(20) NOT NULL COMMENT '正确答案 A/B/C/D',
  difficulty TINYINT NOT NULL DEFAULT 1 COMMENT '难度 1-5',

  audio_url VARCHAR(500) NULL COMMENT '听力音频地址，MVP 预留',
  image_url VARCHAR(500) NULL COMMENT '图片地址，预留',

  source_type VARCHAR(30) NOT NULL COMMENT 'original/authorized/public_license',
  source_remark VARCHAR(500) NULL COMMENT '来源说明',
  copyright_status VARCHAR(30) NOT NULL DEFAULT 'clear' COMMENT 'clear/pending/risk',

  status VARCHAR(30) NOT NULL DEFAULT 'draft' COMMENT 'draft/pending_review/published/offline/rejected',
  reject_reason VARCHAR(500) NULL COMMENT '驳回原因',

  created_by BIGINT NULL COMMENT '创建管理员 ID',
  reviewed_by BIGINT NULL COMMENT '审核管理员 ID',
  reviewed_at DATETIME NULL COMMENT '审核时间',
  published_at DATETIME NULL COMMENT '发布时间',

  total_attempts INT NOT NULL DEFAULT 0 COMMENT '总答题次数',
  correct_attempts INT NOT NULL DEFAULT 0 COMMENT '正确次数',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) COMMENT='题目表';
```

索引：

```sql
CREATE INDEX idx_questions_level_category ON questions(level, category);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_status ON questions(status);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_source_type ON questions(source_type);
CREATE INDEX idx_questions_deleted_at ON questions(deleted_at);
```

说明：

- `listening` 题目类型字段预留；
- MVP 不发布听力题；
- 阅读题可直接使用 `passage` 字段；
- 后续如果多题共用文章，再拆 `reading_passages` 表。

---

## 6.4 question_options 题目选项表

```sql
CREATE TABLE question_options (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL COMMENT '题目 ID',
  option_key VARCHAR(10) NOT NULL COMMENT 'A/B/C/D',
  option_text TEXT NOT NULL COMMENT '选项内容',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_question_options_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
) COMMENT='题目选项表';
```

索引：

```sql
CREATE INDEX idx_question_options_question_id ON question_options(question_id);
CREATE UNIQUE INDEX uk_question_option_key ON question_options(question_id, option_key);
```

---

## 6.5 tags 标签表

```sql
CREATE TABLE tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '标签名称',
  category VARCHAR(30) NULL COMMENT 'moji_goi/grammar/reading/listening',
  description VARCHAR(500) NULL COMMENT '标签说明',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) COMMENT='标签表';
```

索引：

```sql
CREATE UNIQUE INDEX uk_tags_name ON tags(name);
CREATE INDEX idx_tags_category ON tags(category);
```

---

## 6.6 question_tags 题目标签关联表

```sql
CREATE TABLE question_tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_question_tags_question
    FOREIGN KEY (question_id) REFERENCES questions(id),

  CONSTRAINT fk_question_tags_tag
    FOREIGN KEY (tag_id) REFERENCES tags(id)
) COMMENT='题目标签关联表';
```

索引：

```sql
CREATE UNIQUE INDEX uk_question_tags ON question_tags(question_id, tag_id);
CREATE INDEX idx_question_tags_tag_id ON question_tags(tag_id);
```

---

## 6.7 practice_records 练习记录表

```sql
CREATE TABLE practice_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户 ID',

  level VARCHAR(10) NOT NULL COMMENT '练习等级',
  category VARCHAR(30) NOT NULL COMMENT 'moji_goi/grammar/reading/mixed',
  mode VARCHAR(30) NOT NULL COMMENT 'sequence/random/wrong/favorite/mock_exam',

  total_count INT NOT NULL DEFAULT 0 COMMENT '总题数',
  correct_count INT NOT NULL DEFAULT 0 COMMENT '正确数',
  wrong_count INT NOT NULL DEFAULT 0 COMMENT '错误数',
  accuracy DECIMAL(5,2) NOT NULL DEFAULT 0 COMMENT '正确率',
  duration_seconds INT NOT NULL DEFAULT 0 COMMENT '练习总耗时',

  status VARCHAR(20) NOT NULL DEFAULT 'in_progress' COMMENT 'in_progress/finished',

  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_practice_records_user
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='练习记录表';
```

索引：

```sql
CREATE INDEX idx_practice_records_user_id ON practice_records(user_id);
CREATE INDEX idx_practice_records_level_category ON practice_records(level, category);
CREATE INDEX idx_practice_records_mode ON practice_records(mode);
CREATE INDEX idx_practice_records_created_at ON practice_records(created_at);
```

---

## 6.8 answer_records 答题明细表

```sql
CREATE TABLE answer_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  practice_record_id BIGINT NOT NULL COMMENT '练习记录 ID',
  user_id BIGINT NOT NULL COMMENT '用户 ID',
  question_id BIGINT NOT NULL COMMENT '题目 ID',

  selected_answer VARCHAR(20) NOT NULL COMMENT '用户选择答案',
  correct_answer VARCHAR(20) NOT NULL COMMENT '正确答案快照',
  is_correct BOOLEAN NOT NULL COMMENT '是否正确',
  duration_seconds INT NOT NULL DEFAULT 0 COMMENT '单题耗时',

  answered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_answer_records_practice
    FOREIGN KEY (practice_record_id) REFERENCES practice_records(id),

  CONSTRAINT fk_answer_records_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  CONSTRAINT fk_answer_records_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
) COMMENT='答题明细表';
```

索引：

```sql
CREATE INDEX idx_answer_records_user_id ON answer_records(user_id);
CREATE INDEX idx_answer_records_question_id ON answer_records(question_id);
CREATE INDEX idx_answer_records_practice_id ON answer_records(practice_record_id);
CREATE INDEX idx_answer_records_answered_at ON answer_records(answered_at);
```

说明：

- `correct_answer` 必须保存快照；
- 这样题目答案后续修改时，不影响历史答题记录。

---

## 6.9 wrong_questions 错题本表

```sql
CREATE TABLE wrong_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  user_id BIGINT NOT NULL COMMENT '用户 ID',
  question_id BIGINT NOT NULL COMMENT '题目 ID',

  wrong_count INT NOT NULL DEFAULT 1 COMMENT '答错次数',
  last_wrong_answer VARCHAR(20) NULL COMMENT '最近一次错误答案',
  mastered BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已掌握',

  first_wrong_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_wrong_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mastered_at DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_wrong_questions_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  CONSTRAINT fk_wrong_questions_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
) COMMENT='错题本表';
```

索引：

```sql
CREATE UNIQUE INDEX uk_wrong_user_question ON wrong_questions(user_id, question_id);
CREATE INDEX idx_wrong_questions_user_id ON wrong_questions(user_id);
CREATE INDEX idx_wrong_questions_question_id ON wrong_questions(question_id);
CREATE INDEX idx_wrong_questions_mastered ON wrong_questions(mastered);
CREATE INDEX idx_wrong_questions_last_wrong_at ON wrong_questions(last_wrong_at);
```

---

## 6.10 favorite_questions 收藏题表

```sql
CREATE TABLE favorite_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  user_id BIGINT NOT NULL COMMENT '用户 ID',
  question_id BIGINT NOT NULL COMMENT '题目 ID',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_favorite_questions_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  CONSTRAINT fk_favorite_questions_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
) COMMENT='收藏题表';
```

索引：

```sql
CREATE UNIQUE INDEX uk_favorite_user_question ON favorite_questions(user_id, question_id);
CREATE INDEX idx_favorite_questions_user_id ON favorite_questions(user_id);
CREATE INDEX idx_favorite_questions_question_id ON favorite_questions(question_id);
```

---

## 6.11 feedback 题目反馈表

```sql
CREATE TABLE feedback (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  user_id BIGINT NOT NULL COMMENT '用户 ID',
  question_id BIGINT NULL COMMENT '题目 ID',

  type VARCHAR(50) NOT NULL COMMENT 'wrong_answer/unclear_explanation/typo/difficulty/other',
  content TEXT NOT NULL COMMENT '反馈内容',

  status VARCHAR(30) NOT NULL DEFAULT 'pending' COMMENT 'pending/processing/resolved/ignored',
  handler_id BIGINT NULL COMMENT '处理人管理员 ID',
  handler_remark VARCHAR(500) NULL COMMENT '处理备注',
  handled_at DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_feedback_user
    FOREIGN KEY (user_id) REFERENCES users(id),

  CONSTRAINT fk_feedback_question
    FOREIGN KEY (question_id) REFERENCES questions(id)
) COMMENT='用户反馈表';
```

索引：

```sql
CREATE INDEX idx_feedback_user_id ON feedback(user_id);
CREATE INDEX idx_feedback_question_id ON feedback(question_id);
CREATE INDEX idx_feedback_status ON feedback(status);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
```

---

## 6.12 user_daily_stats 用户每日刷题统计表

```sql
CREATE TABLE user_daily_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,

  user_id BIGINT NOT NULL COMMENT '用户 ID',
  stat_date DATE NOT NULL COMMENT '统计日期',

  answered_count INT NOT NULL DEFAULT 0 COMMENT '答题数',
  correct_count INT NOT NULL DEFAULT 0 COMMENT '正确数',
  wrong_count INT NOT NULL DEFAULT 0 COMMENT '错误数',
  duration_seconds INT NOT NULL DEFAULT 0 COMMENT '刷题时长',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_user_daily_stats_user
    FOREIGN KEY (user_id) REFERENCES users(id)
) COMMENT='用户每日刷题统计表';
```

索引：

```sql
CREATE UNIQUE INDEX uk_user_daily_stats ON user_daily_stats(user_id, stat_date);
CREATE INDEX idx_user_daily_stats_date ON user_daily_stats(stat_date);
```

---

# 7. Prisma Schema 参考

```prisma
model User {
  id           BigInt   @id @default(autoincrement())
  openid       String   @unique
  unionid      String?
  nickname     String?
  avatarUrl    String?  @map("avatar_url")
  currentLevel String   @default("N5") @map("current_level")
  status       String   @default("active")
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  practiceRecords   PracticeRecord[]
  answerRecords     AnswerRecord[]
  wrongQuestions    WrongQuestion[]
  favoriteQuestions FavoriteQuestion[]
  feedbacks         Feedback[]

  @@map("users")
}

model Admin {
  id           BigInt   @id @default(autoincrement())
  username     String   @unique
  passwordHash String   @map("password_hash")
  role         String   @default("editor")
  status       String   @default("active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  deletedAt    DateTime? @map("deleted_at")

  @@map("admins")
}

model Question {
  id              BigInt   @id @default(autoincrement())

  level           String
  category        String
  type            String

  stem            String   @db.Text
  passage         String?  @db.Text
  translation     String?  @db.Text
  explanation     String   @db.Text

  answer          String
  difficulty      Int      @default(1)

  audioUrl        String?  @map("audio_url")
  imageUrl        String?  @map("image_url")

  sourceType      String   @map("source_type")
  sourceRemark    String?  @map("source_remark")
  copyrightStatus String   @default("clear") @map("copyright_status")

  status          String   @default("draft")
  rejectReason    String?  @map("reject_reason")

  createdBy       BigInt?  @map("created_by")
  reviewedBy      BigInt?  @map("reviewed_by")
  reviewedAt      DateTime? @map("reviewed_at")
  publishedAt     DateTime? @map("published_at")

  totalAttempts   Int      @default(0) @map("total_attempts")
  correctAttempts Int      @default(0) @map("correct_attempts")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  deletedAt       DateTime? @map("deleted_at")

  options           QuestionOption[]
  questionTags      QuestionTag[]
  answerRecords     AnswerRecord[]
  wrongQuestions    WrongQuestion[]
  favoriteQuestions FavoriteQuestion[]
  feedbacks         Feedback[]

  @@index([level, category])
  @@index([type])
  @@index([status])
  @@index([sourceType])
  @@map("questions")
}

model QuestionOption {
  id         BigInt   @id @default(autoincrement())
  questionId BigInt  @map("question_id")
  optionKey  String  @map("option_key")
  optionText String  @db.Text @map("option_text")
  sortOrder  Int     @default(0) @map("sort_order")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  question   Question @relation(fields: [questionId], references: [id])

  @@unique([questionId, optionKey])
  @@index([questionId])
  @@map("question_options")
}

model Tag {
  id          BigInt   @id @default(autoincrement())
  name        String   @unique
  category    String?
  description String?
  status      String   @default("active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  questionTags QuestionTag[]

  @@map("tags")
}

model QuestionTag {
  id         BigInt   @id @default(autoincrement())
  questionId BigInt  @map("question_id")
  tagId      BigInt  @map("tag_id")
  createdAt  DateTime @default(now()) @map("created_at")

  question   Question @relation(fields: [questionId], references: [id])
  tag        Tag      @relation(fields: [tagId], references: [id])

  @@unique([questionId, tagId])
  @@index([tagId])
  @@map("question_tags")
}

model PracticeRecord {
  id              BigInt   @id @default(autoincrement())
  userId          BigInt   @map("user_id")

  level           String
  category        String
  mode            String

  totalCount      Int      @default(0) @map("total_count")
  correctCount    Int      @default(0) @map("correct_count")
  wrongCount      Int      @default(0) @map("wrong_count")
  accuracy        Decimal  @default(0) @db.Decimal(5, 2)
  durationSeconds Int      @default(0) @map("duration_seconds")

  status          String   @default("in_progress")
  startedAt       DateTime @default(now()) @map("started_at")
  finishedAt      DateTime? @map("finished_at")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user            User     @relation(fields: [userId], references: [id])
  answerRecords   AnswerRecord[]

  @@index([userId])
  @@index([level, category])
  @@index([mode])
  @@map("practice_records")
}

model AnswerRecord {
  id               BigInt   @id @default(autoincrement())

  practiceRecordId BigInt   @map("practice_record_id")
  userId           BigInt   @map("user_id")
  questionId       BigInt   @map("question_id")

  selectedAnswer   String   @map("selected_answer")
  correctAnswer    String   @map("correct_answer")
  isCorrect        Boolean  @map("is_correct")
  durationSeconds  Int      @default(0) @map("duration_seconds")

  answeredAt       DateTime @default(now()) @map("answered_at")

  practiceRecord   PracticeRecord @relation(fields: [practiceRecordId], references: [id])
  user             User           @relation(fields: [userId], references: [id])
  question         Question       @relation(fields: [questionId], references: [id])

  @@index([practiceRecordId])
  @@index([userId])
  @@index([questionId])
  @@map("answer_records")
}

model WrongQuestion {
  id              BigInt   @id @default(autoincrement())

  userId          BigInt   @map("user_id")
  questionId      BigInt   @map("question_id")

  wrongCount      Int      @default(1) @map("wrong_count")
  lastWrongAnswer String?  @map("last_wrong_answer")
  mastered        Boolean  @default(false)

  firstWrongAt    DateTime @default(now()) @map("first_wrong_at")
  lastWrongAt     DateTime @default(now()) @map("last_wrong_at")
  masteredAt      DateTime? @map("mastered_at")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user            User     @relation(fields: [userId], references: [id])
  question        Question @relation(fields: [questionId], references: [id])

  @@unique([userId, questionId])
  @@index([userId])
  @@index([questionId])
  @@index([mastered])
  @@map("wrong_questions")
}

model FavoriteQuestion {
  id         BigInt   @id @default(autoincrement())
  userId     BigInt  @map("user_id")
  questionId BigInt  @map("question_id")
  createdAt  DateTime @default(now()) @map("created_at")

  user       User     @relation(fields: [userId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])

  @@unique([userId, questionId])
  @@index([userId])
  @@index([questionId])
  @@map("favorite_questions")
}

model Feedback {
  id            BigInt   @id @default(autoincrement())

  userId        BigInt   @map("user_id")
  questionId    BigInt?  @map("question_id")

  type          String
  content       String   @db.Text

  status        String   @default("pending")
  handlerId     BigInt?  @map("handler_id")
  handlerRemark String?  @map("handler_remark")
  handledAt     DateTime? @map("handled_at")

  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  user          User     @relation(fields: [userId], references: [id])
  question      Question? @relation(fields: [questionId], references: [id])

  @@index([userId])
  @@index([questionId])
  @@index([status])
  @@map("feedback")
}

model UserDailyStat {
  id              BigInt   @id @default(autoincrement())

  userId          BigInt   @map("user_id")
  statDate        DateTime @map("stat_date") @db.Date

  answeredCount   Int      @default(0) @map("answered_count")
  correctCount    Int      @default(0) @map("correct_count")
  wrongCount      Int      @default(0) @map("wrong_count")
  durationSeconds Int      @default(0) @map("duration_seconds")

  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user            User     @relation(fields: [userId], references: [id])

  @@unique([userId, statDate])
  @@index([statDate])
  @@map("user_daily_stats")
}
```

---

# 8. 初始种子数据

## 8.1 默认管理员

通过环境变量创建：

```env
ADMIN_INITIAL_USERNAME="admin"
ADMIN_INITIAL_PASSWORD="change_me"
```

要求：

```txt
1. 不要在代码中写死明文密码。
2. 密码必须哈希后入库。
3. 如果管理员已存在，不重复创建。
```

---

## 8.2 默认标签

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
句子排序
文章语法
```

---

## 8.3 示例原创题

```json
{
  "level": "N5",
  "category": "grammar",
  "type": "grammar_choice",
  "stem": "わたしは 毎朝 7時（　）起きます。",
  "options": [
    { "key": "A", "text": "に" },
    { "key": "B", "text": "で" },
    { "key": "C", "text": "を" },
    { "key": "D", "text": "が" }
  ],
  "answer": "A",
  "explanation": "表示具体时间点时使用助词「に」。",
  "translation": "我每天早上 7 点起床。",
  "difficulty": 1,
  "sourceType": "original",
  "tags": ["助词", "时间表达"]
}
```

---

# 9. 关键查询场景

## 9.1 获取随机练习题

```sql
SELECT *
FROM questions
WHERE status = 'published'
  AND deleted_at IS NULL
  AND level = 'N5'
  AND category = 'grammar'
ORDER BY RAND()
LIMIT 10;
```

说明：

- MVP 阶段可以使用 `ORDER BY RAND()`；
- 数据量变大后需要优化为随机 ID 或预生成题目池。

---

## 9.2 获取顺序练习题

```sql
SELECT *
FROM questions
WHERE status = 'published'
  AND deleted_at IS NULL
  AND level = 'N5'
  AND category = 'grammar'
ORDER BY id ASC
LIMIT 10 OFFSET 0;
```

---

## 9.3 获取错题本

```sql
SELECT q.*, w.wrong_count, w.last_wrong_at, w.mastered
FROM wrong_questions w
JOIN questions q ON q.id = w.question_id
WHERE w.user_id = ?
  AND w.mastered = false
  AND q.deleted_at IS NULL
ORDER BY w.last_wrong_at DESC
LIMIT 20 OFFSET 0;
```

---

## 9.4 获取收藏题

```sql
SELECT q.*, f.created_at AS favorite_at
FROM favorite_questions f
JOIN questions q ON q.id = f.question_id
WHERE f.user_id = ?
  AND q.deleted_at IS NULL
ORDER BY f.created_at DESC
LIMIT 20 OFFSET 0;
```

---

# 10. 数据更新规则

## 10.1 用户提交答案

```txt
1. 查询题目正确答案。
2. 判断是否正确。
3. 写入 answer_records。
4. 更新 questions.total_attempts。
5. 如果正确，更新 questions.correct_attempts。
6. 如果错误，新增或更新 wrong_questions。
7. 更新 practice_records 统计字段。
8. 更新 user_daily_stats。
```

---

## 10.2 错题本更新

用户答错时：

```txt
如果 wrong_questions 已存在：
  wrong_count + 1
  last_wrong_answer = 本次错误答案
  last_wrong_at = 当前时间
  mastered = false

如果 wrong_questions 不存在：
  新增错题记录
```

用户标记已掌握：

```txt
mastered = true
mastered_at = 当前时间
```

---

## 10.3 收藏题更新

收藏：

```txt
如果不存在记录，则新增。
如果已存在，直接返回成功。
```

取消收藏：

```txt
删除 favorite_questions 对应记录。
如果不存在，直接返回成功。
```

---

# 11. 后续扩展表

MVP 阶段不建，后续需要时再加。

## 11.1 reading_passages

适用场景：

```txt
多道阅读题共用同一篇文章。
```

## 11.2 audio_resources

适用场景：

```txt
正式开放听力题，并拥有原创或授权音频资源。
```

## 11.3 question_versions

适用场景：

```txt
题目频繁编辑，需要保存题目历史版本。
```

## 11.4 ai_generation_tasks

适用场景：

```txt
后续引入 AI 辅助出题，但所有 AI 题目必须经过人工审核后才能发布。
```

---

# 12. Codex 执行约束

```txt
1. 不创建 words、word_books、word_memory_records 等背单词表。
2. 不创建 courses、lessons、payments、memberships 等非刷题表。
3. questions.category 使用 moji_goi / grammar / reading / listening。
4. listening 只预留，不作为 MVP 发布题型。
5. 所有题目必须记录 source_type。
6. source_type 非 original 时，source_remark 必填。
7. 题目删除优先使用 deleted_at 软删除。
8. 小程序端只查询 published 且 deleted_at 为空的题。
9. answer_records 必须保存 correct_answer 快照。
10. wrong_questions 和 favorite_questions 必须有唯一约束。
11. 数据库使用 utf8mb4。
12. seed.ts 只插入原创示例题，不插入真题或来源不明内容。
