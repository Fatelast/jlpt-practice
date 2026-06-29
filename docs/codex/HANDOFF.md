# HANDOFF.md

## 当前交接摘要

本项目当前处于 MVP 功能闭环推进阶段。数据库、后端、小程序端均已能构建；微信登录、错题本闭环、学习进度页真实化、收藏题闭环和题目反馈闭环已经完成主要实现。近期问题多集中在小程序构建产物未刷新、页面注册和后端模块依赖注入。

## 最近完成

- 新增 `WrongQuestionsModule`：
  - `GET /wrong-questions`
  - `PATCH /wrong-questions/:questionId/mastered`
- 抽出 `question-presenter.ts`，让练习题和错题接口复用同一题目格式化逻辑。
- 前端 `wrong-book` 页面接入真实错题数据，支持查看解析、标记已掌握、进入错题模式练习。
- `practice` 页面开放 `wrong` 模式，并在错题为空时提示“暂无错题可练习”。
- `result` 页面“复盘错题”跳转错题本。
- 修复后端启动时 `WrongQuestionsModule` 缺少 `AuthModule` 导致 `JwtService` 无法解析的问题。
- 重新构建小程序，修复开发工具中进度页入口报 `pages/progress/index is not found` 的旧产物问题。
- 新增 `ProgressModule` 与 `GET /progress/summary`，统计累计答题、正确率、未掌握错题、今日答题、连续天数、近 7 天趋势和题型掌握度。
- 前端 progress 页面接入真实进度数据，保留无设计稿情况下的现有绿色学习风格。
- 新增 FavoritesModule 与 GET /favorites、POST /favorites/:questionId、DELETE /favorites/:questionId。
- 前端做题页支持收藏/取消收藏，收藏页接入真实数据，练习配置开放收藏模式。
- 新增 FeedbackModule 与 POST /feedback、GET /feedback/my。
- 前端做题页支持提交题目反馈，个人中心反馈记录入口接入真实列表。

## 继续开发前建议

1. 先运行 `git status --short`，确认当前未提交变更范围。
2. 若微信开发工具出现页面找不到，先执行 `npm --workspace apps/miniapp run build:weapp` 并确认开发工具加载的是 `apps/miniapp/dist`。
3. 若后端启动依赖注入报错，先检查对应模块是否导入了提供依赖的 module，尤其是使用 `UserJwtGuard` 时必须导入 `AuthModule`。
4. 涉及 UI 页面大改前，向用户确认是否提供对应 HTML 设计稿。

## 推荐下一步

建议下一步处理“管理端反馈处理”或“练习记录页”。题目反馈用户端闭环已完成，管理端还缺反馈列表、处理备注和状态流转。
