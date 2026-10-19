import { useState } from 'react'

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 切换登录和注册表单
  function switchMode() {
    setIsRegister(!isRegister)
    setPassword('')
    setError('')
    setNotice('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (submitting) return

    setError('')
    setNotice('')
    setSubmitting(true)

    try {
      const endpoint = isRegister ? 'register' : 'login'

      const response = await fetch(
        `http://127.0.0.1:8000/auth/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data.detail === 'string'
            ? data.detail
            : '提交失败，请检查用户名和密码格式'
        )
      }

      // 注册成功不代表已登录，切回登录表单
      if (isRegister) {
        setIsRegister(false)
        setPassword('')
        setNotice('注册成功，请输入密码登录')
        return
      }

      if (typeof data.access_token !== 'string' || !data.access_token) {
        throw new Error('登录响应缺少凭证')
      }

      setPassword('')
      onLogin(data.access_token)
    } catch (error) {
      setError(
        error instanceof TypeError
          ? '无法连接后端，请检查后端服务和网络'
          : error.message
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isRegister ? '注册账号' : '登录'}</h2>

      {isRegister && (
        <p>用户名为 3～50 位字母、数字或下划线，密码为 8～128 个字符。</p>
      )}

      <label>
        用户名
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          minLength={isRegister ? 3 : 1}
          maxLength={50}
          pattern={isRegister ? '[a-zA-Z0-9_]+' : undefined}
          disabled={submitting}
          required
        />
      </label>

      <label>
        密码
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          minLength={isRegister ? 8 : 1}
          maxLength={128}
          disabled={submitting}
          required
        />
      </label>

      {error && <p className="error-message">{error}</p>}
      {notice && <p role="status">{notice}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? '正在提交...' : isRegister ? '注册' : '登录'}
      </button>

      <button
        type="button"
        onClick={switchMode}
        disabled={submitting}
      >
        {isRegister ? '已有账号，去登录' : '没有账号，去注册'}
      </button>
    </form>
  )
}