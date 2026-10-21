# 学习任务管理系统前端

基于 React 和 Vite，调用 FastAPI 后端完成用户认证与任务管理。

后端：[study-task-manager-backend](https://github.com/wen04115/study-task-manager-backend)

## 核心功能

- 用户注册、登录和退出
- 请求自动携带 JWT 登录凭证
- 登录凭证失效时返回登录页面并提示
- 新增、编辑、删除任务，切换完成状态
- 设置优先级和截止日期
- 按状态、优先级、截止日期筛选及分页展示
- 展示当前页任务数量和完成情况

## 技术栈

- React、JavaScript、Vite
- CSS、Fetch API
- ESLint：代码检查
- Vitest、React Testing Library、user-event、jest-dom：交互测试
- jsdom：模拟浏览器 DOM 环境
- GitHub Actions：持续集成

## 本地运行方式

- 开发模式：前端通过 Vite 启动，代理 /api 请求到本机后端。
- 容器模式：Docker Compose 启动 Nginx 前端和 FastAPI 后端。
- Nginx 提供前端静态页面，并将 /api 请求转发到后端。
- MySQL 独立运行在宿主机，不包含在应用容器中。

容器页面：http://127.0.0.1:8080

完整构建与启动步骤见 [后端部署说明](https://github.com/wen04115/study-task-manager-backend#docker-compose-本地部署)。

## 本地运行

先按照后端 README 启动 MySQL 和 FastAPI，后端地址为：

http://127.0.0.1:8000

在前端项目根目录安装依赖并启动：
推荐使用 Node.js 24，与 CI 保持一致。已有依赖时，日常启动只需执行 npm run dev。

```powershell
npm ci
npm run dev
```

浏览器打开终端实际显示的 Local 地址。

如果端口被占用，Vite 可能选择其他端口；开发环境通过 Vite 代理访问后端；后端地址变化时，需要调整 vite.config.js 的代理目标。

## 登录与数据隔离

- 没有账号时，可在登录页面切换到注册表单
- 注册成功后，使用新账号登录
- JWT 使用 sessionStorage 保存，同一标签页刷新后恢复登录
- 点击退出登录或接口返回 401 时清除保存的凭证
- 刷新页面不会延长 JWT 有效期
- 浏览器恢复会话可能恢复 sessionStorage，关闭标签页不等于服务端注销
- 退出不会在服务端立即作废已签发的 JWT
- token 可被页面 JavaScript 读取，需要防范 XSS
- 任务归属由后端根据当前登录用户确定
- 用户隔离由后端执行，不依赖前端隐藏数据

## 手动验证

1. 注册并登录账号 A，创建一条测试任务。
2. 验证编辑、切换状态和删除功能。
3. 退出后登录账号 B，确认看不到账号 A 的任务。
4. 刷新页面，确认登录恢复；退出登录后再次刷新，确认仍停留在登录页。

## 自动化测试与构建

在前端项目根目录执行：

```powershell
npm test
npm run lint
npm run build
```

- npm test：运行 Vitest 交互测试，执行完退出。
- npm run lint：执行 ESLint 代码检查。
- npm run build：生成 dist 生产构建产物。

当前包含 7 项交互测试：

1. 空任务名称不会发送新增请求。
2. 新增失败保留输入，并恢复按钮。
3. 新增成功清空输入，并重新读取列表。
4. 请求未完成时禁止重复提交。
5. 页面重新初始化后恢复登录。
6. 退出登录清除保存的凭证。
7. 恢复的凭证收到 401 后清除并返回登录页。

测试通过 jsdom 模拟页面，所有网络请求均被模拟，
不需要启动真实后端，也不会创建真实任务。

这些测试不是完整浏览器端到端测试。

## 持续集成 CI

工作流文件：.github/workflows/ci.yml。

推送到 main、向 main 发起 Pull Request 或手动触发时，自动执行：

1. 使用 npm ci 安装锁定的依赖。
2. ESLint 检查。
3. 前端交互测试。
4. 生产构建。

结果可在本仓库的 Actions 页面查看。
CI 通过不代表生产环境部署、真实网络请求及全部浏览器场景都已验收。

## 当前使用边界

- 前端统一请求相对路径 /api。
- 开发环境通过 Vite 代理到 http://127.0.0.1:8000。
- 容器环境通过 Nginx 转发到后端服务。
- JWT 使用 sessionStorage 保存，刷新不延长凭证有效期。
- 已完成本地容器部署及容器重建后的数据保留验收。
- 尚未完成公网生产部署验收。


## 项目截图

### 登录与注册入口

![登录页面](./login-page.png)

### 任务管理

![任务管理页面](./task-manager-page.png)