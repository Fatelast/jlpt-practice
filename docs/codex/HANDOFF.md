# HANDOFF.md

## 当前交接摘要

本项目当前处于 MVP 功能闭环推进阶段。数据库、后端、小程序端均已能构建；微信登录与错题本闭环已经完成主要实现。近期问题多集中在小程序构建产物未刷新、页面注册和后端模块依赖注入。

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

## 继续开发前建议

1. 先运行 `git status --short`，确认当前未提交变更范围。
2. 若微信开发工具出现页面找不到，先执行 `npm --workspace apps/miniapp run build:weapp` 并确认开发工具加载的是 `apps/miniapp/dist`。
3. 若后端启动依赖注入报错，先检查对应模块是否导入了提供依赖的 module，尤其是使用 `UserJwtGuard` 时必须导入 `AuthModule`。
4. 涉及 UI 页面大改前，向用户确认是否提供对应 HTML 设计稿。

## 推荐下一步

优先补齐“学习进度页”真实功能，因为底部导航已有入口，当前页面仍是基础占位统计。可考虑后端新增进度统计接口，前端展示累计答题、正确率、错题数、题型掌握趋势、连续练习天数等。
