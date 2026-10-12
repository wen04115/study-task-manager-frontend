import { useEffect,useState } from 'react'
import './App.css'

function TaskItem(props) {
  function handleToggle() {
    props.onToggle(props.task.id)
  }

  function handleDelete() {
    props.onDelete(props.task.id)
  }
  
  function handleEdit(){  /*编辑按钮*/
    props.onEdit(props.task)
  }
  return (
    <li className={`task-item ${props.task.done ? 'done' : ''}`}>
      <span>
        {props.task.name} - {props.task.done ? '已完成' : '未完成'}
        {' ｜ '}
        优先级：{props.task.priority}
        {' ｜ '}
        截止：{props.task.due_date || '未设置'}
      </span>

      <div className="task-actions">
        <button className="toggle-button" onClick={handleToggle}>
          切换状态
        </button>

        <button onClick={handleEdit}>编辑</button>

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
          onEdit={props.onEdit}
        />
      ))}
    </ul>
  )
}

function TaskForm(props) {
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    const name = newTask.trim()

    if (name === '') {
      setError('任务名称不能为空')
      return
    }

    props.onAdd(name, priority, dueDate)
    setNewTask('')
    setError('')
    setPriority('medium')
    setDueDate('')
  }

  return (
    <section className="task-form">
      <input
        value={newTask}
        onChange={(event) => setNewTask(event.target.value)}
        placeholder="输入新任务"
      />

      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
        >
        <option value="low">低优先级</option>
        <option value="medium">中优先级</option>
        <option value="high">高优先级</option>  
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
      />

      <button className="add-button" onClick={handleAdd}>
        添加任务
      </button>

      {error && <p className="error-message">{error}</p>}
    </section>
  )
}

  function EditTaskForm(props) {
     const [name, setName] = useState(props.task.name)
     const [priority, setPriority] = useState(props.task.priority || 'medium')
     const [dueDate, setDueDate] = useState(props.task.due_date || '')
     const [error, setError] = useState('')

     function handleSave() {
        const trimmedName = name.trim()

        if (trimmedName === '') {
           setError('任务名称不能为空')
           return
        }

      props.onSave(
         props.task.id,
         trimmedName,
         priority,
        dueDate
      )
  }

  return (
    <section className="edit-form">
      <h3>编辑任务</h3>

      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="输入任务名称"
      />

      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
      >
        <option value="low">低优先级</option>
        <option value="medium">中优先级</option>
        <option value="high">高优先级</option>
      </select>

      <input
        type="date"
        value={dueDate}
        onChange={(event) => setDueDate(event.target.value)}
      />

      {error && <p className="error-message">{error}</p>}

      <div className="edit-actions">
        <button onClick={handleSave}>保存修改</button>
        <button onClick={props.onCancel}>取消</button>
      </div>
    </section>
  )
}

function App() {
  const [tasks, setTasks] = useState([])
  const [loading,setLoading]= useState(true)  /* 是否正在加载  正在加载返回true  加载结束返回false*/
  const [loadError,setLoadError] = useState('')   /* 加载失败*/
  const [actionError, setActionError] = useState('')  /* 保存“添加、删除、切换状态”等操作失败*/
  const [statusFilter, setStatusFilter] = useState('all') /*按什么完成状态筛选*/ 
  const [priorityFilter, setPriorityFilter] = useState('all') /*优先级*/
  const [dueDateFilter, setDueDateFilter] = useState('') /*截止日期*/
  const [editingTask, setEditingTask] = useState(null)  /*正在编辑的任务*/
  const [currentPage, setCurrentPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const totalCount =tasks.length
  const completedCount = tasks.filter((task) => task.done).length
  const unfinishedCount = tasks.filter((task) => !task.done).length

  const filteredTasks = tasks.filter((task) =>{  /*filteredTasks筛选后的任务列表*/
     if (statusFilter === 'done' && !task.done){
      return false
     }

     if (statusFilter === 'unfinished' && task.done){
      return false
     }

     if (priorityFilter !== 'all' && task.priority !== priorityFilter){
      return false
     }

     if (dueDateFilter !== '' && task.due_date !== dueDateFilter) {
        return false
     }

     return true
  })
  
  
  useEffect(() => {
    async function loadTasks(){
      try{
             const params = new URLSearchParams({
                 page: String(currentPage),
                 size: "2",
                 sort_by: "due_date",
                 sort_order: "asc",
            })

             if (statusFilter === "done") {
              params.set("done", "true")
             }

            if (statusFilter === "unfinished") {
              params.set("done", "false")
            }

            if (priorityFilter !== "all") {
              params.set("priority", priorityFilter)
            }

            if (dueDateFilter !== "") {
              params.set("due_date", dueDateFilter)
            }

            const response = await fetch(
              `http://127.0.0.1:8000/tasks?${params.toString()}`
            )        

        if(!response.ok){
          throw new Error('读取任务失败')
        }

        const data =await response.json()
        setTasks(data.items)
        setTotal(data.total)
        setTotalPages(data.total_pages)
      }catch{
        setLoadError('任务加载失败，请确认后端是否已启动')
      }finally{
        setLoading(false)
      }
    }

    loadTasks()
  },[currentPage, statusFilter, priorityFilter, dueDateFilter])

  async  function addTask(name, priority, dueDate) {
     setActionError('')
     try{
         const response = await fetch('http://127.0.0.1:8000/tasks',{
         method :'POST',
         headers:{
            'Content-Type':'application/json',
         },      
         body: JSON.stringify({
            name:name,
            done:false,
            priority: priority,
            due_date: dueDate === '' ? null : dueDate,
           

        }),
     })
     
     if (!response.ok) {
      throw new Error('添加任务失败')
     } 

       const newTask=await response.json()
    
      setTasks([...tasks, newTask])
     }catch{
     setActionError('添加任务失败，请确认后端是否已启动')
    }
  }

  async function deleteTask(id) {
    setActionError('')
    try{
         const response = await fetch(
           `http://127.0.0.1:8000/tasks/${id}`,
           {
             method: 'DELETE',
          }
         )
         if (!response.ok) {
             throw new Error('删除任务失败')
     }
  
         setTasks(tasks.filter((task) => task.id !== id))
      }catch{
        setActionError('删除任务失败，请确认后端是否已启动')
      } 
    }
    

  async function toggleTask(id) {
    const currentTask = tasks.find((task) => task.id ===id)

    if (!currentTask){
      throw new Error('切换状态失败')
    }
    setActionError('')
    try{
           const response = await fetch(
                `http://127.0.0.1:8000/tasks/${id}`,
                {
                    method :'PATCH',
                    headers:{
                       'Content-Type': 'application/json',
                     },
                    body:JSON.stringify({
                       done:!currentTask.done,
                     }),
                }
            )
    
    
           if (!response.ok){
                  throw new Error('切换状态失败')
              }

           const updatedTask = await response.json()

           setTasks(
                tasks.map((task) =>{
                if (task.id===id){
                     return { ...task, ...updatedTask }
                }
                return task
                })
              ) 
           }catch{
            setActionError('切换状态失败，请确认后端是否已启动')
           }
    } 
  
  function startEdit(tasks){
    setEditingTask(tasks)
  }  
  
  async function updateTask(id, name, priority, dueDate) {
     setActionError('')

   try {
    const response = await fetch(
      `http://127.0.0.1:8000/tasks/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          priority: priority,
          due_date: dueDate === '' ? null : dueDate,
        }),
      }
    )
   if (!response.ok) {
      throw new Error('修改任务失败')
    }
    
   const updatedTask = await response.json()
  
   setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          return { ...task, ...updatedTask }
        }

        return task
      })
    )

    setEditingTask(null)
   } catch {
    setActionError('修改任务失败，请确认后端是否已启动')
   }
}

  return (
    <main className="app">
      <h1>学习任务管理系统</h1>
      <p className="subtitle">管理今天的学习任务</p>
      <p className="task-summary">
          共 {totalCount} 项任务｜已完成 {completedCount} 项｜未完成 {unfinishedCount} 项
      </p>
      <TaskForm onAdd={addTask} />

      {editingTask && (
        <EditTaskForm
          key={editingTask.id}
          task={editingTask}
          onSave={updateTask}
          onCancel={() => setEditingTask(null)}
        />
      )}

      <section className="filter-panel">
         <label>
            状态
            <select
               value={statusFilter}
               onChange={(event)=>{
                    setStatusFilter(event.target.value)
                    setCurrentPage(1)
                  }} 
                   

               
            >
               <option value="all">全部</option>
               <option value="done">已完成</option>
               <option value="unfinished">未完成</option>
              </select>
          </label>

         <label>
            优先级
            <select
               value={priorityFilter}
               onChange={(event) => {
                    setPriorityFilter(event.target.value)
                    setCurrentPage(1)
                  }}
            >
               <option value="all">全部</option>
               <option value="low">低</option>
               <option value="medium">中</option>
               <option value="high">高</option>
            </select>
          </label>  

         <label>
            截止日期
            <input        /*  <input />输入框   */
               type="date" /*普通输入框变成日期选择器*/
               value={dueDateFilter}
               onChange={(event) => {
                    setDueDateFilter(event.target.value)
                    setCurrentPage(1)
                  }}  
            />
          </label>  
      </section>
      {actionError && <p className="error-message">{actionError}</p>}

      <h2>今日任务</h2>

      {loading && <p className="loading-message">正在加载任务...</p>}
      {loadError && <p className="error-message">{loadError}</p>}
      {!loading && !loadError &&  tasks.length === 0 && (
        <p className="empty-message">暂无任务，添加一个开始。</p>
      )}
      {!loading && !loadError &&  tasks.length > 0 &&filteredTasks.length === 0 && (
        <p className="empty-message">没有符合筛选条件的任务。</p>
      )}
      {!loading && !loadError && filteredTasks.length > 0 && (
        <TaskList
          tasks={filteredTasks}
          onDelete={deleteTask}
          onToggle={toggleTask}
          onEdit={startEdit}
        />
      )}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            上一页
          </button>

          <span>
             第 {currentPage} / {totalPages} 页（共 {total} 条）
          </span>

          <button
               type="button"
               disabled={currentPage === totalPages}
               onClick={() => setCurrentPage(currentPage + 1)}
          >
            下一页
          </button>
       </div>
      )}
    </main>
  )
}

export default App