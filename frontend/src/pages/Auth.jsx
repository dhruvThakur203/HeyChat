import { useState } from 'react'
import axios from 'axios'
import './auth.css' // Import your CSS file here

export default function Auth({ onAuthed }) {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url = isLogin ? '/auth/login' : '/auth/register'
      const { data } = await axios.post(url, form)
      onAuthed(data.token)
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="pattern"></div>
      <div className="auth-container">
        <h2>{isLogin ? 'Welcome back' : 'Create your account'}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={submit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name</label>
              <input 
                placeholder="Jane Doe" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              placeholder="you@email.com" 
              value={form.email} 
              onChange={(e) => setForm({ ...form, email: e.target.value })} 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={form.password} 
              onChange={(e) => setForm({ ...form, password: e.target.value })} 
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
          </button>
        </form>
        <p>
          {isLogin ? 'No account?' : 'Have an account?'}{' '}
          <a href="#" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Login'}
          </a>
        </p>
      </div>
    </>
  )
}


