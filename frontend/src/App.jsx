import { useState } from 'react'
import './App.css'
import Auth from './pages/Auth'
import Chat from './pages/Chat'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  if (!token) return <Auth onAuthed={(t) => { localStorage.setItem('token', t); setToken(t); }} />
  return <Chat onLogout={() => { localStorage.removeItem('token'); setToken(null); }} />
}
