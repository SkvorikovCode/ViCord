import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Hash,
  Send,
  Smile,
  Pencil,
  Trash2,
  X,
  Check,
  Paperclip,
  File,
  Image as ImageIcon,
  Download,
} from 'lucide-react'
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useApp } from '@/contexts/AppContext'
import { messageService } from '@/services/messageService'
import { socketService } from '@/services/socketService'
import { formatTime } from '@/lib/utils'
import { Message, MessageAttachment } from '@/lib/types'

const ChatArea = () => {
  const { currentChannel, messages, setMessages, currentUser, sendMessage } = useApp()
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showActionsForMessageId, setShowActionsForMessageId] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map())
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const emojiPickerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const previousScrollHeightRef = useRef<number>(0)

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

  // Setup typing indicators
  useEffect(() => {
    if (!currentChannel) return

    const handleTypingStart = (data: { userId: string; username: string }) => {
      if (data.userId !== currentUser?.id) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev)
          newMap.set(data.userId, data.username)
          return newMap
        })
      }
    }

    const handleTypingStop = (data: { userId: string }) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev)
        newMap.delete(data.userId)
        return newMap
      })
    }

    socketService.on('typing:start', handleTypingStart)
    socketService.on('typing:stop', handleTypingStop)

    return () => {
      socketService.off('typing:start', handleTypingStart)
      socketService.off('typing:stop', handleTypingStop)
    }
  }, [currentChannel, currentUser])

  // Reset hasMore when channel changes
  useEffect(() => {
    setHasMore(true)
  }, [currentChannel])

  // Infinite scroll handler
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !currentChannel) return

    const handleScroll = async () => {
      if (container.scrollTop === 0 && !isLoadingMore && hasMore) {
        setIsLoadingMore(true)
        previousScrollHeightRef.current = container.scrollHeight

        try {
          const channelMessages = messages.filter((m) => m.channelId === currentChannel.id)
          if (channelMessages.length === 0) {
            setIsLoadingMore(false)
            return
          }

          const oldestMessage = channelMessages[0]
          const olderMessages = await messageService.getChannelMessages(
            currentChannel.id,
            50,
            oldestMessage.createdAt || oldestMessage.timestamp.toISOString()
          )

          if (olderMessages.length === 0) {
            setHasMore(false)
          } else {
            // Parse attachments and convert timestamps
            const parsedMessages = olderMessages.map((msg: any) => {
              let attachments = msg.attachments
              if (typeof attachments === 'string') {
                try {
                  attachments = JSON.parse(attachments)
                } catch (e) {
                  console.error('Failed to parse attachments:', e)
                  attachments = undefined
                }
              }

              return {
                ...msg,
                timestamp: new Date(msg.createdAt || msg.timestamp),
                attachments,
              }
            })

            // Add older messages to the beginning
            const currentMessages = messages.filter((m) => m.channelId === currentChannel.id)
            const otherMessages = messages.filter((m) => m.channelId !== currentChannel.id)
            setMessages([...otherMessages, ...parsedMessages, ...currentMessages])

            // Restore scroll position
            setTimeout(() => {
              if (container && previousScrollHeightRef.current) {
                container.scrollTop = container.scrollHeight - previousScrollHeightRef.current
              }
            }, 0)
          }
        } catch (error) {
          console.error('Failed to load older messages:', error)
        } finally {
          setIsLoadingMore(false)
        }
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [currentChannel, messages, isLoadingMore, hasMore, setMessages])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue(prev => prev + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 5)) // Max 5 files
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Drag & Drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only set dragging to false if leaving the main drop zone
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 5))
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
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

  // Attachment component
  const AttachmentItem = ({ attachment }: { attachment: MessageAttachment }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const fileUrl = `${API_URL}${attachment.url}`

    if (attachment.type === 'image') {
      return (
        <div
          className="relative group cursor-pointer overflow-hidden rounded-lg border border-discord-mid/30 max-w-xs"
          onClick={() => setLightboxImage(fileUrl)}
        >
          <img
            src={fileUrl}
            alt={attachment.filename}
            className="w-full h-auto max-h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
        </div>
      )
    }

    // Other file types
    return (
      <a
        href={fileUrl}
        download={attachment.filename}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-3 bg-discord-lightgray rounded border border-discord-mid/30 hover:border-discord-blurple/50 transition-colors max-w-xs"
      >
        <File className="w-8 h-8 text-discord-blurple flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm text-white truncate">{attachment.filename}</div>
          <div className="text-xs text-discord-textmuted">{formatFileSize(attachment.size)}</div>
        </div>
        <Download className="w-5 h-5 text-discord-textmuted flex-shrink-0" />
      </a>
    )
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
              <>
                {message.content && (
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
                
                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2">
                    {message.attachments.map((attachment, index) => (
                      <AttachmentItem key={index} attachment={attachment} />
                    ))}
                  </div>
                )}
              </>
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
    if ((inputValue.trim() || selectedFiles.length > 0) && !isSending) {
      setIsSending(true)
      try {
        await sendMessage(inputValue.trim(), selectedFiles.length > 0 ? selectedFiles : undefined)
        setInputValue('')
        setSelectedFiles([])
      } catch (error) {
        console.error('Failed to send message:', error)
      } finally {
        setIsSending(false)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // Send typing indicator
    if (currentChannel && currentUser) {
      socketService.startTyping(currentChannel.id, currentUser.id, currentUser.username)

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Set new timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socketService.stopTyping(currentChannel.id, currentUser.id)
      }, 3000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      
      // Stop typing indicator
      if (currentChannel && currentUser) {
        socketService.stopTyping(currentChannel.id, currentUser.id)
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
      
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
    <div
      className="flex-1 bg-discord-dark flex flex-col relative"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-discord-blurple/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-discord-blurple">
          <div className="text-center">
            <Paperclip className="w-16 h-16 text-discord-blurple mx-auto mb-4" />
            <div className="text-xl font-semibold text-white">Перетащите файлы сюда</div>
            <div className="text-discord-textmuted mt-2">Максимум 5 файлов, до 10MB каждый</div>
          </div>
        </div>
      )}

      {/* Lightbox for images */}
      {lightboxImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-8"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-discord-gray rounded-full hover:bg-discord-lightgray transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </motion.div>
      )}

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
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="py-4">
          {/* Loading indicator */}
          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <div className="flex gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-discord-blurple rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-discord-blurple rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-discord-blurple rounded-full"
                />
              </div>
            </div>
          )}

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

        {/* Typing indicator */}
        {typingUsers.size > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-discord-textmuted">
              <div className="flex gap-1">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                  className="w-2 h-2 bg-discord-textmuted rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                  className="w-2 h-2 bg-discord-textmuted rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                  className="w-2 h-2 bg-discord-textmuted rounded-full"
                />
              </div>
              <span>
                {Array.from(typingUsers.values()).join(', ')}{' '}
                {typingUsers.size === 1 ? 'печатает' : 'печатают'}...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 relative">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={'dark' as any}
              searchPlaceHolder="Поиск эмодзи..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}

        {/* File Previews */}
        {selectedFiles.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group bg-discord-gray rounded p-2 flex items-center gap-2 max-w-xs"
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                ) : (
                  <File className="w-12 h-12 text-discord-blurple" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white truncate">{file.name}</div>
                  <div className="text-xs text-discord-textmuted">{formatFileSize(file.size)}</div>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 hover:bg-discord-lightgray rounded transition-colors"
                  title="Удалить"
                >
                  <X className="w-4 h-4 text-discord-textmuted" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <div className="bg-discord-lightgray rounded-lg">
          <div className="px-4 py-3">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Написать в #${currentChannel.name}`}
              className="w-full bg-transparent text-discord-text placeholder-discord-textmuted outline-none"
            />
          </div>
          <div className="px-2 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                max={5}
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded hover:bg-discord-gray text-discord-textmuted hover:text-discord-text transition-colors"
                title="Прикрепить файл"
              >
                <Paperclip className="w-5 h-5" />
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
              disabled={(!inputValue.trim() && selectedFiles.length === 0) || isSending}
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

