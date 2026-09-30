import { useState } from 'react'
import './App.css'

function TaskItem(props) {
  function handleToggle() {
    props.onToggle(props.task.id)
  }

  function handleDelete() {
    props.onDelete(props.task.id)
  }

  return (
    <li className={`task-item ${props.task.done ? 'done' : ''}`}>
      <span>
        {props.task.name} - {props.task.done ? '已完成' : '未完成'}
      </span>

      <div className="task-actions">
        <button className="toggle-button" onClick={handleToggle}>
          切换状态
        </button>

        <button className="delete-button" onClick={handleDelete}>
          删除
        </button>
      </div>
    </li>
  )
}

function TaskList(props) {
  return (
    <ul className="task-list">
      {props.tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={props.onDelete}
          onToggle={props.onToggle}
        />
      ))}
    </ul>
  )
}

function TaskForm(props) {
  const [newTask, setNewTask] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    const name = newTask.trim()

    if (name === '') {
      setError('任务名称不能为空')
      return
    }

    props.onAdd(name)
    setNewTask('')
    setError('')
  }

  return (
    <section className="task-form">
      <input
        value={newTask}
        onChange={(event) => setNewTask(event.target.value)}
        placeholder="输入新任务"
      />

      <button className="add-button" onClick={handleAdd}>
        添加任务
      </button>

      {error && <p className="error-message">{error}</p>}
    </section>
  )
}

function App() {
  const [tasks, setTasks] = useState([
    { id: 1, name: '学习 React Props', done: false },
    { id: 2, name: '学习 useState', done: false },
    { id: 3, name: '完成 LeetCode 哈希题', done: false },
  ])

  function addTask(name) {
    const task = {
      id: Date.now(),
      name: name,
      done: false,
    }

    setTasks([...tasks, task])
  }

  function deleteTask(id) {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, done: !task.done }
        }

        return task
      })
    )
  }

  return (
    <main className="app">
      <h1>我的 AI 学习管理系统</h1>
      <p className="subtitle">管理今天的学习任务</p>

      <TaskForm onAdd={addTask} />

      <h2>今日任务</h2>

      <TaskList
        tasks={tasks}
        onDelete={deleteTask}
        onToggle={toggleTask}
      />
    </main>
  )
}

export default App