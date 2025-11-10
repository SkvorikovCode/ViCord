import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import AuthLayout from '@/layouts/AuthLayout'
import { authService } from '@/services/authService'
import { useApp } from '@/contexts/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const { setCurrentUser, setIsAuthenticated } = useApp()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { user } = await authService.login(email, password)
      setCurrentUser(user)
      setIsAuthenticated(true)
      navigate('/app')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа. Проверьте данные.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      title="С возвращением!"
      subtitle="Рады видеть вас снова в ViCord"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-discord-text uppercase mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-discord-text/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-discord-darker text-white pl-11 pr-4 py-3 rounded-md border border-discord-mid/30 focus:border-discord-blurple focus:outline-none transition-colors"
              placeholder="example@vicord.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-discord-text uppercase mb-2">
            Пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-discord-text/50" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-discord-darker text-white pl-11 pr-4 py-3 rounded-md border border-discord-mid/30 focus:border-discord-blurple focus:outline-none transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-discord-blurple hover:bg-discord-blurple/80 text-white font-semibold py-3 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Вход...
            </>
          ) : (
            'Войти'
          )}
        </button>

        {/* Forgot password - placeholder */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-discord-link hover:underline"
            onClick={() => alert('Функция восстановления пароля будет добавлена позже')}
          >
            Забыли пароль?
          </button>
        </div>

        {/* Register link */}
        <div className="text-sm text-discord-text text-center">
          Нужен аккаунт?{' '}
          <Link to="/register" className="text-discord-link hover:underline">
            Зарегистрироваться
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login

