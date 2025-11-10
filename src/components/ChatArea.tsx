import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hash, Send, Plus, Smile, Gift } from 'lucide-react'
import { useApp } from '@/contexts/AppContext'
import { formatTime, formatDate } from '@/lib/utils'
import { Message } from '@/lib/types'

const ChatArea = () => {
  const { currentChannel, messages, currentUser } = useApp()
  const [inputValue, setInputValue] = useState('')

  const channelMessages = messages.filter(m => m.channelId === currentChannel?.id)

  const MessageItem = ({ message }: { message: Message }) => {
    const isOwn = message.author.id === currentUser.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="px-4 py-2 hover:bg-discord-dark/30 transition-colors group"
      >
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-discord-blue flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-sm font-semibold text-white">
              {message.author.username.substring(0, 2).toUpperCase()}
            </span>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className={`font-semibold text-sm ${isOwn ? 'text-discord-blue' : 'text-white'}`}>
                {message.author.username}
              </span>
              <span className="text-xs text-discord-textmuted">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className="text-discord-text mt-0.5 break-words">
              {message.content}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const handleSend = () => {
    if (inputValue.trim()) {
      // TODO: Implement message sending
      console.log('Sending message:', inputValue)
      setInputValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!currentChannel) {
    return (
      <div className="flex-1 bg-discord-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-discord-textmuted text-lg mb-2">Добро пожаловать в ViCord!</div>
          <div className="text-discord-textmuted text-sm">Выберите канал, чтобы начать общение</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-discord-dark flex flex-col">
      {/* Channel Header */}
      <div className="h-12 px-4 flex items-center gap-2 border-b border-discord-darker shadow-sm">
        <Hash className="w-6 h-6 text-discord-textmuted" />
        <span className="font-semibold text-white">{currentChannel.name}</span>
        <div className="mx-2 w-px h-6 bg-discord-textmuted/20" />
        <span className="text-sm text-discord-textmuted">
          Добро пожаловать в #{currentChannel.name}!
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="py-4">
          {/* Channel Start */}
          <div className="px-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-discord-gray flex items-center justify-center mb-2">
              <Hash className="w-10 h-10 text-discord-text" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">
              Добро пожаловать в #{currentChannel.name}!
            </h3>
            <p className="text-discord-textmuted">
              Это начало канала #{currentChannel.name}.
            </p>
          </div>

          {/* Messages */}
          <AnimatePresence>
            {channelMessages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4">
        <div className="bg-discord-lightgray rounded-lg">
          <div className="px-4 py-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Написать в #${currentChannel.name}`}
              className="w-full bg-transparent text-discord-text placeholder-discord-textmuted outline-none"
            />
          </div>
          <div className="px-2 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded hover:bg-discord-gray text-discord-textmuted hover:text-discord-text transition-colors"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded hover:bg-discord-gray text-discord-textmuted hover:text-discord-text transition-colors"
              >
                <Gift className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded hover:bg-discord-gray text-discord-textmuted hover:text-discord-text transition-colors"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="p-1.5 rounded bg-discord-blue hover:bg-discord-blue/80 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatArea

