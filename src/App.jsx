import { useState, useEffect } from 'react';
import './App.css';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('todo-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [quote, setQuote] = useState({ text: 'Loading quote...', author: '' });
  const [dateInfo, setDateInfo] = useState({ date: '', names: '' });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    fetch('https://api.allorigins.win/get?url=' + encodeURIComponent('https://zenquotes.io/api/random'))
      .then(res => res.json())
      .then(data => {
        const parsed = JSON.parse(data.contents);
        setQuote({ text: parsed[0].q, author: parsed[0].a });
      })
      .catch(() => setQuote({ text: "Quality is not an act, it is a habit.", author: "Aristotle" }));
  }, []);

  useEffect(() => {
    fetch('https://nameday.abalin.net/api/V1/today')
      .then(res => res.json())
      .then(data => {
        setDateInfo({
          date: new Date().toLocaleDateString('pl-PL'),
          names: data.nameday.pl
        });
      })
      .catch(() => setDateInfo({ date: new Date().toLocaleDateString('pl-PL'), names: '' }));
  }, []);

  const addTask = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;
    const newTask = {
      id: Date.now(),
      text: inputValue,
      description: '',
      completed: false
    };
    setTasks([...tasks, newTask]);
    setInputValue('');
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
    navigate('/');
  };

  return (
    <div className="container">
      <div className="section-title">
        <h1>To do list</h1>
      </div>

      <div className="section-image">
        <img src={`${import.meta.env.BASE_URL}9645.jpg`} alt="Painting" />
      </div>

      <div className="list-section">
        <Routes>
          <Route path="/" element={
            <>
              <div className="quote-container">
                <p>"{quote.text}"</p>
                <small>- {quote.author}</small>
              </div>

              <form onSubmit={addTask}>
                <input 
                  type="text" 
                  placeholder="What needs to be done?"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </form>

              <ul className="todo-items">
                {tasks.map((task) => (
                  <li 
                    key={task.id} 
                    onClick={() => navigate(`/task/${task.id}`)}
                    className={task.completed ? 'completed-item' : ''}
                  >
                    {task.text}
                  </li>
                ))}
              </ul>
            </>
          } />
          
          <Route path="/task/:taskId" element={
            <TaskDetail 
              tasks={tasks} 
              setTasks={setTasks} 
              toggleComplete={toggleComplete} 
              deleteTask={deleteTask} 
            />
          } />
        </Routes>

        <div className="footer-info">
          <p>{dateInfo.date}</p>
          {dateInfo.names && <small>Imieniny: {dateInfo.names}</small>}
        </div>
      </div>
    </div>
  );
}

function TaskDetail({ tasks, setTasks, toggleComplete, deleteTask }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const task = tasks.find(t => t.id === Number(taskId));

  if (!task) {
    return (
      <div className="detail-view">
        <button className="back-btn" onClick={() => navigate('/')}>← Task not found. Back to list</button>
      </div>
    );
  }

  return (
    <div className="detail-view">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to list</button>
      <h2 className={task.completed ? 'completed-text' : ''}>{task.text}</h2>
      <textarea 
        placeholder="Add notes here..."
        value={task.description}
        onChange={(e) => {
          const newDesc = e.target.value;
          setTasks(tasks.map(t => t.id === task.id ? {...t, description: newDesc} : t));
        }}
      />
      <div className="button-group">
        <button onClick={() => toggleComplete(task.id)}>
          {task.completed ? 'Undo' : 'Mark as Done'}
        </button>
        <button className="delete-btn" onClick={() => deleteTask(task.id)}>Delete</button>
      </div>
    </div>
  );
}

export default App;
