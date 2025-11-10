import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Hash, Send, Plus, Smile, Gift, MoreVertical, Pencil, Trash2, X, Check } from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useApp } from '@/contexts/AppContext'
import { messageService } from '@/services/messageService'
import { formatTime } from '@/lib/utils'
import { Message } from '@/lib/types'

const ChatArea = () => {
  const { currentChannel, messages, setMessages, currentUser, sendMessage } = useApp()
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showActionsForMessageId, setShowActionsForMessageId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const channelMessages = messages.filter(m => m.channelId === currentChannel?.id)

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id)
    setEditContent(message.content)
    setShowActionsForMessageId(null)
  }

  const handleSaveEdit = async (messageId: string) => {
    if (!editContent.trim()) return

    try {
      const updatedMessage = await messageService.updateMessage(messageId, editContent.trim())
      setMessages(messages.map(msg => 
        msg.id === messageId 
          ? { ...updatedMessage, timestamp: new Date(updatedMessage.createdAt || updatedMessage.timestamp) }
          : msg
      ))
      setEditingMessageId(null)
      setEditContent('')
    } catch (error) {
      console.error('Failed to edit message:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditContent('')
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Вы уверены, что хотите удалить это сообщение?')) {
      return
    }

    try {
      await messageService.deleteMessage(messageId)
      setMessages(messages.filter(msg => msg.id !== messageId))
      setShowActionsForMessageId(null)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const MessageItem = ({ message }: { message: Message }) => {
    const isOwn = message.author.id === currentUser?.id
    const isEditing = editingMessageId === message.id
    const showActions = showActionsForMessageId === message.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="px-4 py-2 hover:bg-discord-dark/30 transition-colors group relative"
        onMouseEnter={() => isOwn && setShowActionsForMessageId(message.id)}
        onMouseLeave={() => setShowActionsForMessageId(null)}
      >
        <div className="flex gap-4">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-discord-blue flex items-center justify-center flex-shrink-0 mt-0.5">
            {message.author.avatar ? (
              <img src={message.author.avatar} alt={message.author.username} className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-sm font-semibold text-white">
                {message.author.username.substring(0, 2).toUpperCase()}
              </span>
            )}
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
              {message.updatedAt && message.updatedAt !== message.createdAt && (
                <span className="text-xs text-discord-textmuted/70">(изменено)</span>
              )}
            </div>
            
            {isEditing ? (
              <div className="mt-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSaveEdit(message.id)
                    } else if (e.key === 'Escape') {
                      handleCancelEdit()
                    }
                  }}
                  className="w-full bg-discord-lightgray text-white px-3 py-2 rounded border border-discord-mid/30 focus:border-discord-blurple focus:outline-none"
                  autoFocus
                />
                <div className="flex gap-2 mt-2 text-xs text-discord-textmuted">
                  <button
                    onClick={() => handleSaveEdit(message.id)}
                    className="text-discord-link hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    сохранить
                  </button>
                  <span>•</span>
                  <button
                    onClick={handleCancelEdit}
                    className="text-discord-textmuted hover:text-white"
                  >
                    отмена (Esc)
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-discord-text mt-0.5 break-words prose prose-invert prose-sm max-w-none">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="m-0">{children}</p>,
                    a: ({ children, href }) => (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-discord-link hover:underline">
                        {children}
                      </a>
                    ),
                    code: ({ children, className }) => {
                      const isInline = !className
                      return isInline ? (
                        <code className="bg-discord-darker px-1.5 py-0.5 rounded text-sm font-mono">
                          {children}
                        </code>
                      ) : (
                        <code className="block bg-discord-darker p-2 rounded text-sm font-mono overflow-x-auto">
                          {children}
                        </code>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions */}
          {isOwn && !isEditing && (
            <div className={`absolute top-0 right-4 flex items-center gap-1 bg-discord-gray border border-discord-mid/30 rounded shadow-lg transition-opacity ${showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <motion.button
                whileHover={{ backgroundColor: '#1e1f22' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEditMessage(message)}
                className="p-2 text-discord-text hover:text-white transition-colors"
                title="Редактировать"
              >
                <Pencil className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ backgroundColor: '#1e1f22' }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDeleteMessage(message.id)}
                className="p-2 text-discord-text hover:text-red-400 transition-colors"
                title="Удалить"
              >
                <Trash2 className="w-4 h-4" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  const handleSend = async () => {
    if (inputValue.trim() && !isSending) {
      setIsSending(true)
      try {
        await sendMessage(inputValue.trim())
        setInputValue('')
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setIsSending(false)
      }
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
          
          {/* Auto-scroll target */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              searchPlaceHolder="Поиск эмодзи..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

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
                title="Прикрепить файл"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded hover:bg-discord-gray text-discord-textmuted hover:text-discord-text transition-colors"
                title="Отправить подарок"
              >
                <Gift className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 rounded hover:bg-discord-gray transition-colors ${
                  showEmojiPicker 
                    ? 'text-discord-blurple' 
                    : 'text-discord-textmuted hover:text-discord-text'
                }`}
                title="Выбрать эмодзи"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!inputValue.trim() || isSending}
              className="p-1.5 rounded bg-discord-blue hover:bg-discord-blue/80 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Отправить"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Markdown hint */}
        <div className="mt-2 text-xs text-discord-textmuted/70">
          Поддерживается Markdown: **жирный**, *курсив*, `код`, [ссылка](url)
        </div>
      </div>
    </div>
  )
}

export default ChatArea

