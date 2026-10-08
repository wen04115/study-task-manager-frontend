# AI 学习任务管理系统

学习任务管理小项目

记录要学的内容，比如学习 React、FastAPI、刷算法题。这个项目可以添加任务、修改任务、删除任务、标记完成，还可以按优先级和截止日期筛选任务。

任务数据不是只放在网页里，而是保存到了 SQLite 数据库中，刷新页面后数据还在。

## 目前实现的功能

- 添加任务
- 给任务设置优先级
- 给任务设置截止日期
- 修改任务名称、优先级和截止日期
- 切换任务的完成和未完成状态
- 删除任务
- 按完成状态筛选任务
- 按优先级筛选任务
- 按截止日期筛选任务
- 显示任务总数、已完成数量和未完成数量
- 页面加载中、请求失败、空任务列表时有提示
- 刷新浏览器后任务数据不会丢失

## 我用了什么技术

前端部分：

- React
- Vite
- JavaScript
- CSS
- Fetch API

后端部分：

- Python
- FastAPI
- SQLite
- Pydantic
- Uvicorn

## 项目文件大概是这样

```text
ai-study-react/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md

day7_api/
├── main.py
└── tasks.db

App.jsx 主要负责页面显示、任务状态和调用后端接口。
main.py 主要负责 FastAPI 接口和 SQLite 数据库操作。


怎么运行

启动前端
进入前端项目目录：
cd D:\codex_create\ai-study-react

第一次运行时先安装依赖：
npm install

启动前端：
npm run dev

浏览器打开：
http://localhost:5173

启动后端
打开一个新的终端，进入后端项目目录：
cd D:\VSC_project\day7_api

启动后端：
uvicorn main:app --reload

后端启动后，可以访问：
http://127.0.0.1:8000
FastAPI 自动生成的接口测试页面：
http://127.0.0.1:8000/docs

接口说明
获取全部任务
GET /tasks
页面刚打开时，React 会调用这个接口，从数据库拿到全部任务。

添加任务
POST /tasks
添加任务时，会把任务名称、优先级和截止日期发送给后端。
请求内容示例：
{
  "name": "学习 React",
  "done": false,
  "priority": "high",
  "due_date": "2026-10-10"
}

修改任务
PATCH /tasks/{task_id}
修改任务名称、优先级、截止日期，或者切换完成状态时，会调用这个接口。

删除任务
DELETE /tasks/{task_id}
根据任务 id 删除一条任务。
一条任务的数据长什么样
{
  "id": 1,
  "name": "学习 FastAPI",
  "done": false,
  "priority": "medium",
  "due_date": "2026-10-10"
}
- id：任务编号
- name：任务名称
- done：任务是否完成
- priority：优先级，有低、中、高三种
- due_date：截止日期；不填写时就是空

前后端是怎么配合的
页面打开后：
React 请求 FastAPI
→ FastAPI 从 SQLite 读取任务
→ 把任务数据返回给 React
→ React 把任务显示在页面上

用户添加、编辑、删除或切换任务状态时：
React 把操作发给 FastAPI
→ FastAPI 修改 SQLite 里的数据
→ FastAPI 返回结果
→ React 更新页面

做这个项目时处理过的问题
- 前端和后端端口不同，所以配置了 CORS
- 页面刚加载时会显示“正在加载任务”
- 后端没启动或请求失败时，页面会显示错误提示
- 添加空任务、编辑空任务时会提示任务名称不能为空
- 修改任务后刷新页面，数据仍然从 SQLite 中正常读取