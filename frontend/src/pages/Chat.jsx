import { useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

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
    <div className="h-screen grid grid-cols-[340px_1fr] bg-slate-50 dark:bg-slate-900">
      <aside className="border-r border-slate-200 dark:border-slate-800 p-3 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Chats</h3>
          <button className="text-sm text-slate-600 dark:text-slate-300 hover:text-red-600" onClick={onLogout}>Logout</button>
        </div>
        <div className="mt-3">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
          <button onClick={doSearch} className="mt-2 w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2">Search</button>
        </div>
        <div className="mt-3 space-y-1 overflow-auto">
          {users.map(u => (
            <button key={u._id} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => openChat(u._id)}>
              <div className="font-medium text-slate-800 dark:text-slate-100">{u.name}</div>
              <div className="text-xs text-slate-500">{u.email}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 border-t border-slate-200 dark:border-slate-800 pt-3 overflow-auto">
          {chats.map(c => (
            <button key={c._id} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => openChat(c.users.find(u => u._id !== user?._id)?._id)}>
              {c.isGroupChat ? c.chatName : (c.users.find(u => u._id !== user?._id)?.name || 'Chat')}
            </button>
          ))}
        </div>
      </aside>
      <main className="flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <strong className="text-slate-800 dark:text-slate-100">{selectedChat ? (selectedChat.isGroupChat ? selectedChat.chatName : 'Direct Chat') : 'Select a chat'}</strong>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map(m => (
            <div key={m._id} className="max-w-[75%] rounded-2xl px-4 py-2 bg-white dark:bg-slate-800 shadow text-slate-800 dark:text-slate-100">
              <div className="text-xs text-slate-500 mb-1">{m.sender?.name}</div>
              <div>{m.content}</div>
            </div>
          ))}
          {typing && <div className="text-xs text-slate-500">Typing...</div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input value={content} onChange={onChangeContent} placeholder="Type a message" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100" />
          <button onClick={sendMessage} className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2">Send</button>
        </div>
      </main>
    </div>
  )
}


