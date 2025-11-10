import { motion } from 'framer-motion'
import { Plus, Home } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { cn } from '@/lib/utils'
import { Server } from '@/lib/types'

const ServerList = () => {
  const { servers, currentServer, setCurrentServer, setCurrentChannel, channels } = useApp()

  const handleServerClick = (server: Server) => {
    setCurrentServer(server)
    const firstChannel = channels.find(c => c.serverId === server.id)
    if (firstChannel) {
      setCurrentChannel(firstChannel)
    }
  }

  const ServerIcon = ({ server, isActive }: { server: Server; isActive: boolean }) => (
    <motion.button
      whileHover={{ borderRadius: '16px' }}
      whileTap={{ scale: 0.95 }}
      onClick={() => handleServerClick(server)}
      className={cn(
        'relative w-12 h-12 flex items-center justify-center rounded-[24px] transition-all duration-200 group',
        isActive ? 'bg-discord-blue rounded-[16px]' : 'bg-discord-gray hover:bg-discord-blue hover:rounded-[16px]'
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeServer"
          className="absolute -left-3 w-1 h-10 bg-white rounded-r-full"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      {server.icon ? (
        <img src={server.icon} alt={server.name} className="w-full h-full rounded-[inherit]" />
      ) : (
        <span className="text-white font-semibold text-lg">
          {server.name.substring(0, 2).toUpperCase()}
        </span>
      )}
      
      {/* Tooltip */}
      <div className="absolute left-full ml-3 px-3 py-2 bg-discord-darker rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        {server.name}
      </div>
    </motion.button>
  )

  return (
    <div className="w-[72px] bg-discord-darker flex flex-col items-center py-3 gap-2 scrollbar-thin overflow-y-auto">
      {/* Home Button */}
      <motion.button
        whileHover={{ borderRadius: '16px' }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setCurrentServer(null)}
        className={cn(
          'relative w-12 h-12 flex items-center justify-center rounded-[24px] transition-all duration-200 group',
          !currentServer ? 'bg-discord-blue rounded-[16px]' : 'bg-discord-gray hover:bg-discord-blue hover:rounded-[16px]'
        )}
      >
        {!currentServer && (
          <motion.div
            layoutId="activeServer"
            className="absolute -left-3 w-1 h-10 bg-white rounded-r-full"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <Home className="w-6 h-6 text-white" />
        
        <div className="absolute left-full ml-3 px-3 py-2 bg-discord-darker rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
          Домой
        </div>
      </motion.button>

      <div className="w-8 h-[2px] bg-discord-gray rounded-full" />

      {/* Server List */}
      {servers.map((server) => (
        <ServerIcon
          key={server.id}
          server={server}
          isActive={currentServer?.id === server.id}
        />
      ))}

      {/* Add Server Button */}
      <motion.button
        whileHover={{ borderRadius: '16px', backgroundColor: '#23a559' }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 flex items-center justify-center rounded-[24px] bg-discord-gray transition-all duration-200 group"
      >
        <Plus className="w-6 h-6 text-discord-green group-hover:text-white transition-colors" />
        
        <div className="absolute left-full ml-3 px-3 py-2 bg-discord-darker rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl">
          Добавить сервер
        </div>
      </motion.button>
    </div>
  )
}

export default ServerList

