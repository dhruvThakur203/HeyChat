import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import './chat.css' 

export default function Chat({ onLogout }) {
  const [user, setUser] = useState(null)
  const [token] = useState(localStorage.getItem('token'))
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [chats, setChats] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [content, setContent] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true }), [])

  useEffect(() => {
    socket.emit('setup', 'self')
    socket.on('connected', () => {})
    socket.on('typing', () => setTyping(true))
    socket.on('stop typing', () => setTyping(false))
    socket.on('message received', (m) => {
      if (m.chat === selectedChat?._id) setMessages((prev) => [...prev, m])
    })
    return () => socket.disconnect()
  }, [socket, selectedChat])

  useEffect(() => {
    if (!token) return
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    axios.get('/chats').then(({ data }) => setChats(data))
  }, [token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const doSearch = async () => {
    const { data } = await axios.get(`/users?search=${encodeURIComponent(search)}`)
    setUsers(data)
  }

  const openChat = async (userId) => {
    const { data } = await axios.post('/chats', { userId })
    setSelectedChat(data)
    const res = await axios.get(`/messages/${data._id}`)
    setMessages(res.data)
    socket.emit('join chat', data._id)
  }

  const sendMessage = async () => {
    if (!content.trim() || !selectedChat) return
    const { data } = await axios.post('/messages', { content, chatId: selectedChat._id })
    setMessages((prev) => [...prev, data])
    setContent('')
    socket.emit('stop typing', selectedChat._id)
    socket.emit('new message', { ...data, chat: selectedChat._id, recipients: selectedChat.users?.map(u => u._id) })
  }

  const onChangeContent = (e) => {
    setContent(e.target.value)
    if (selectedChat) socket.emit('typing', selectedChat._id)
  }

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h3>Chats</h3>
          <button className="logout-button" onClick={onLogout}>Logout</button>
        </div>
        
        <div className="search-container">
          <input 
            className="search-input"
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search users" 
          />
          <button onClick={doSearch} className="send-button">Search</button>
        </div>

        <div className="chat-list">
          {users.map(u => (
            <div key={u._id} className="chat-item" onClick={() => openChat(u._id)}>
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
            </div>
          ))}
          
          {chats.map(c => (
            <div 
              key={c._id} 
              className="chat-item" 
              onClick={() => openChat(c.users.find(u => u._id !== user?._id)?._id)}
            >
              {c.isGroupChat ? c.chatName : (c.users.find(u => u._id !== user?._id)?.name || 'Chat')}
            </div>
          ))}
        </div>
      </aside>

      <main className="chat-area">
        <div className="chat-header">
          <strong>
            {selectedChat ? (selectedChat.isGroupChat ? selectedChat.chatName : 'Direct Chat') : 'Select a chat'}
          </strong>
        </div>

        <div className="messages-container">
          {messages.map(m => (
            <div 
              key={m._id} 
              className={`message ${m.sender?._id === user?._id ? 'outgoing' : 'incoming'}`}
            >
              <div className="message-sender">{m.sender?.name}</div>
              <div>{m.content}</div>
              <div className="message-time">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          {typing && <div className="typing-indicator">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <input 
            value={content} 
            onChange={onChangeContent}
            placeholder="Type a message"
            className="message-input"
          />
          <button onClick={sendMessage} className="send-button">Send</button>
        </div>
      </main>
    </div>
  )
}


