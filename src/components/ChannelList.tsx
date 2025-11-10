import { motion } from 'framer-motion'
import { Hash, Volume2, ChevronDown, Settings, Plus, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/contexts/AppContext'
import { authService } from '@/services/authService'
import { cn } from '@/lib/utils'
import { Channel } from '@/lib/types'

const ChannelList = () => {
  const navigate = useNavigate()
  const { currentServer, channels, currentChannel, setCurrentChannel, currentUser, setIsAuthenticated, setCurrentUser } = useApp()

  const handleLogout = async () => {
    try {
      await authService.logout()
      setIsAuthenticated(false)
      setCurrentUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const serverChannels = channels.filter(c => c.serverId === currentServer?.id)

  const textChannels = serverChannels.filter(c => c.type === 'text')
  const voiceChannels = serverChannels.filter(c => c.type === 'voice')

  const ChannelItem = ({ channel }: { channel: Channel }) => {
    const isActive = currentChannel?.id === channel.id
    const Icon = channel.type === 'text' ? Hash : Volume2

    return (
      <motion.button
        whileHover={{ x: 2 }}
        onClick={() => setCurrentChannel(channel)}
        className={cn(
          'w-full px-2 py-1.5 flex items-center gap-2 rounded group transition-colors',
          isActive
            ? 'bg-discord-lightgray text-white'
            : 'text-discord-textmuted hover:bg-discord-lightgray hover:text-discord-text'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{channel.name}</span>
      </motion.button>
    )
  }

  const ChannelCategory = ({ title, channels, icon }: { title: string; channels: Channel[]; icon?: React.ReactNode }) => (
    <div className="mb-2">
      <button className="w-full px-2 py-1 flex items-center gap-1 text-discord-textmuted hover:text-discord-text transition-colors group">
        <ChevronDown className="w-3 h-3" />
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
        {icon && (
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
      </button>
      <div className="mt-1 space-y-0.5">
        {channels.map((channel) => (
          <ChannelItem key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  )

  if (!currentServer) {
    return (
      <div className="w-60 bg-discord-gray flex flex-col">
        <div className="h-12 px-4 flex items-center border-b border-discord-darker shadow-md">
          <span className="font-semibold text-white">Личные сообщения</span>
        </div>
        <div className="flex-1 p-2">
          <div className="text-discord-textmuted text-sm text-center mt-8">
            Выберите сервер или начните личную переписку
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-60 bg-discord-gray flex flex-col">
      {/* Server Header */}
      <motion.button
        whileHover={{ backgroundColor: '#1e1f22' }}
        className="h-12 px-4 flex items-center justify-between border-b border-discord-darker shadow-md transition-colors"
      >
        <span className="font-semibold text-white truncate">{currentServer.name}</span>
        <ChevronDown className="w-5 h-5 text-discord-text flex-shrink-0" />
      </motion.button>

      {/* Channel List */}
      <div className="flex-1 p-2 overflow-y-auto scrollbar-thin">
        {textChannels.length > 0 && (
          <ChannelCategory
            title="Текстовые каналы"
            channels={textChannels}
            icon={<Plus className="w-4 h-4" />}
          />
        )}
        {voiceChannels.length > 0 && (
          <ChannelCategory
            title="Голосовые каналы"
            channels={voiceChannels}
            icon={<Plus className="w-4 h-4" />}
          />
        )}
      </div>

      {/* User Panel */}
      <div className="h-[52px] bg-discord-dark px-2 flex items-center gap-2">
        <div className="relative">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-discord-blue flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {currentUser?.username?.[0]?.toUpperCase() || 'V'}
              </span>
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-discord-green rounded-full border-2 border-discord-dark" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            {currentUser?.username || 'ViCordUser'}
          </div>
          <div className="text-xs text-discord-textmuted truncate">в сети</div>
        </div>
        <motion.button
          whileHover={{ backgroundColor: '#1e1f22' }}
          whileTap={{ scale: 0.9 }}
          className="p-1.5 rounded hover:text-discord-text text-discord-textmuted transition-colors"
          title="Настройки"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ backgroundColor: '#1e1f22' }}
          whileTap={{ scale: 0.9 }}
          onClick={handleLogout}
          className="p-1.5 rounded hover:text-red-400 text-discord-textmuted transition-colors"
          title="Выход"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}

export default ChannelList

