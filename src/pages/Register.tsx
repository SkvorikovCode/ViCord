import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, AlertCircle, Loader2, CheckCircle } from 'lucide-react'
import AuthLayout from '@/layouts/AuthLayout'
import { authService } from '@/services/authService'

const Register = () => {
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    if (username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа')
      return false
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return false
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return false
    }

    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await authService.register({ email, username, password })
      
      // Show success and redirect to login
      navigate('/login', { 
        state: { message: 'Регистрация успешна! Теперь вы можете войти.' }
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка регистрации. Попробуйте еще раз.')
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    if (!password) return null
    
    const length = password.length
    const hasNumbers = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    
    let strength = 0
    if (length >= 6) strength++
    if (length >= 10) strength++
    if (hasNumbers) strength++
    if (hasSpecial) strength++
    if (hasUpper) strength++
    
    if (strength <= 2) return { label: 'Слабый', color: 'bg-red-500', width: '33%' }
    if (strength <= 4) return { label: 'Средний', color: 'bg-yellow-500', width: '66%' }
    return { label: 'Сильный', color: 'bg-green-500', width: '100%' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Присоединяйтесь к ViCord и начните общение"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-xs font-semibold text-discord-text uppercase mb-2">
            Имя пользователя
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-discord-text/50" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-discord-darker text-white pl-11 pr-4 py-3 rounded-md border border-discord-mid/30 focus:border-discord-blurple focus:outline-none transition-colors"
              placeholder="cooluser123"
              required
              disabled={isLoading}
              minLength={3}
            />
          </div>
        </div>

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
              minLength={6}
            />
          </div>
          
          {/* Password strength indicator */}
          {passwordStrength && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-discord-text">
                  Надежность пароля
                </span>
                <span className="text-xs font-semibold text-white">
                  {passwordStrength.label}
                </span>
              </div>
              <div className="h-1 bg-discord-mid/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: passwordStrength.width }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${passwordStrength.color}`}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-discord-text uppercase mb-2">
            Подтвердите пароль
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-discord-text/50" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-discord-darker text-white pl-11 pr-4 py-3 rounded-md border border-discord-mid/30 focus:border-discord-blurple focus:outline-none transition-colors"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
            {confirmPassword && password === confirmPassword && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
            )}
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
              Создание аккаунта...
            </>
          ) : (
            'Зарегистрироваться'
          )}
        </button>

        {/* Login link */}
        <div className="text-sm text-discord-text text-center">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-discord-link hover:underline">
            Войти
          </Link>
        </div>

        {/* Terms */}
        <p className="text-xs text-discord-text/70 text-center">
          Регистрируясь, вы соглашаетесь с нашими Условиями использования и Политикой конфиденциальности
        </p>
      </form>
    </AuthLayout>
  )
}

export default Register

