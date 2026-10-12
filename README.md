# 学习任务管理系统前端

基于 React 和 Vite 的学习任务管理系统前端，调用 FastAPI 后端接口完成任务管理。

后端仓库：[study-task-manager-backend](https://github.com/wen04115/study-task-manager-backend)

## 核心功能

- 新增、编辑、删除任务
- 设置任务优先级和截止日期
- 切换已完成 / 未完成状态
- 按状态、优先级、截止日期筛选任务
- 支持排序和分页展示
- 展示任务总数、已完成和未完成数量
- 请求加载、失败和空列表状态提示

## 技术栈

- React
- JavaScript
- Vite
- CSS
- Fetch API

## 前后端协作

React 通过 Fetch API 调用 FastAPI 接口；后端读写 MySQL 后返回任务数据，前端根据响应更新页面。

## 本地运行

启动后端：
```powershell
cd day7_api
uvicorn main:app --reload --port 8000

启动前端：
cd ai-study-react
npm install
npm run dev

浏览器访问：
http://localhost:5173

设计说明
- 前后端端口不同，后端通过 CORS 允许前端请求。
- 任务数据持久化到 MySQL，刷新页面后仍可读取。
- 前端对加载失败、空任务和空名称等情况提供提示。
