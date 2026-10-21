import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import App from './App'

let fetchMock

function reply(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }
}

beforeEach(() => {
      sessionStorage.clear()
  // 所有请求均被模拟，不连接真实后端。
  fetchMock = vi.fn(async (url, options = {}) => {
    const path = new URL(url, 'http://localhost').pathname
    const method = options.method || 'GET'

    if (path === '/api/auth/login' && method === 'POST') {
      return reply({ access_token: 'test-token' })
    }

    if (path === '/api/tasks' && method === 'GET') {
      return reply({
        items: [],
        total: 0,
        page: 1,
        size: 2,
        total_pages: 0,
      })
    }

    throw new Error(`未配置的模拟请求：${method} ${path}`)
  })

  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  cleanup()
  sessionStorage.clear()
  vi.unstubAllGlobals()
})

async function openTaskPage() {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText('用户名'), 'test_user')
  await user.type(screen.getByLabelText('密码'), 'TestPassword123!')
  await user.click(screen.getByRole('button', { name: '登录' }))

  await screen.findByText('暂无任务，添加一个开始。')

  // 后面只统计登录完成后的请求。
  fetchMock.mockClear()
  return user
}

test('空任务名称不会发送新增请求', async () => {
  const user = await openTaskPage()

  await user.click(screen.getByRole('button', { name: '添加任务' }))

  expect(screen.getByText('任务名称不能为空')).toBeInTheDocument()
  expect(fetchMock).not.toHaveBeenCalled()
})

test('新增失败时保留输入并恢复按钮', async () => {
  const user = await openTaskPage()
  const input = screen.getByPlaceholderText('输入新任务')

  fetchMock.mockRejectedValueOnce(new TypeError('模拟断网'))

  await user.type(input, '保留这条任务')
  await user.click(screen.getByRole('button', { name: '添加任务' }))

  await screen.findByText('添加任务失败，请检查输入内容和后端连接')

  expect(input).toHaveValue('保留这条任务')
  expect(
    screen.getByRole('button', { name: '添加任务' })
  ).toBeEnabled()
})

test('新增成功后清空输入并重新读取列表', async () => {
  const user = await openTaskPage()
  const input = screen.getByPlaceholderText('输入新任务')

  fetchMock.mockResolvedValueOnce(reply({ id: 1 }, 201))

  await user.type(input, '学习测试')
  await user.click(screen.getByRole('button', { name: '添加任务' }))

  await waitFor(() => {
    expect(input).toHaveValue('')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  const [url, options] = fetchMock.mock.calls[1]
  expect(new URL(url, 'http://localhost').pathname).toBe('/api/tasks')
  expect(options?.method || 'GET').toBe('GET')
})

test('新增请求未完成时禁止重复提交', async () => {
  const user = await openTaskPage()
  const input = screen.getByPlaceholderText('输入新任务')

  let complete
  const pending = new Promise((resolve) => {
    complete = resolve
  })
  fetchMock.mockReturnValueOnce(pending)

  await user.type(input, '只提交一次')
  await user.dblClick(
    screen.getByRole('button', { name: '添加任务' })
  )

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(
    screen.getByRole('button', { name: '正在添加...' })
  ).toBeDisabled()
  expect(input).toBeDisabled()

  await act(async () => {
    complete(reply({ id: 1 }, 201))
  })

  await waitFor(() => {
    expect(input).toHaveValue('')
    expect(
      screen.getByRole('button', { name: '添加任务' })
    ).toBeEnabled()
  })
})

test('重新挂载页面后恢复登录', async () => {
  await openTaskPage()

  expect(sessionStorage.getItem('study_task_token')).toBe('test-token')

  // 卸载并重新挂载，模拟页面重新初始化。
  cleanup()
  render(<App />)

  await screen.findByText('暂无任务，添加一个开始。')
  expect(
    screen.getByRole('button', { name: '退出登录' })
  ).toBeInTheDocument()
})

test('退出登录后清除保存的凭证', async () => {
  const user = await openTaskPage()

  await user.click(
    screen.getByRole('button', { name: '退出登录' })
  )

  expect(sessionStorage.getItem('study_task_token')).toBeNull()
  expect(
    screen.getByRole('button', { name: '登录' })
  ).toBeInTheDocument()
})

test('恢复的凭证收到401后清除并返回登录页', async () => {
  sessionStorage.setItem('study_task_token', 'expired-token')
  fetchMock.mockResolvedValueOnce(reply({}, 401))

  render(<App />)

  await screen.findByText('登录状态已失效，请重新登录')

  expect(sessionStorage.getItem('study_task_token')).toBeNull()
  expect(
    screen.getByRole('button', { name: '登录' })
  ).toBeInTheDocument()
})