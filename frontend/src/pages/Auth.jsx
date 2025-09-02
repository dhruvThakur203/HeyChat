import { useState } from 'react'
import axios from 'axios'

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 text-center">
          {isLogin ? 'Welcome back' : 'Create your account'}
        </h2>
        {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}
        <form onSubmit={submit} className="mt-6 space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Name</label>
              <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Email</label>
            <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="you@email.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">Password</label>
            <input className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="••••••••" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 transition">
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          {isLogin ? 'No account?' : 'Have an account?'}{' '}
          <button type="button" className="text-brand-600 hover:underline" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}


