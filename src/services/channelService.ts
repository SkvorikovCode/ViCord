import api from './api'
import { Channel } from '@/lib/types'

export const channelService = {
  async getServerChannels(serverId: string): Promise<Channel[]> {
    const response = await api.get(`/channels/server/${serverId}`)
    return response.data.data
  },

  async createChannel(
    serverId: string,
    data: { name: string; type: 'text' | 'voice' }
  ): Promise<Channel> {
    const response = await api.post(`/channels/server/${serverId}`, data)
    return response.data.data
  },

  async updateChannel(
    channelId: string,
    data: { name?: string; type?: 'text' | 'voice' }
  ): Promise<Channel> {
    const response = await api.patch(`/channels/${channelId}`, data)
    return response.data.data
  },

  async deleteChannel(channelId: string): Promise<void> {
    await api.delete(`/channels/${channelId}`)
  },
}

