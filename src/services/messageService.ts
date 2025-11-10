import api from './api'
import { Message } from '@/lib/types'

export const messageService = {
  async getChannelMessages(
    channelId: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> {
    const params = new URLSearchParams({ limit: limit.toString() })
    if (before) {
      params.append('before', before)
    }

    const response = await api.get(`/messages/channel/${channelId}?${params}`)
    return response.data.data
  },

  async sendMessage(channelId: string, content: string): Promise<Message> {
    const response = await api.post(`/messages/channel/${channelId}`, { content })
    return response.data.data
  },

  async updateMessage(messageId: string, content: string): Promise<Message> {
    const response = await api.patch(`/messages/${messageId}`, { content })
    return response.data.data
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/messages/${messageId}`)
  },
}

