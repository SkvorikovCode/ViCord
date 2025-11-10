import api from './api'
import { Server } from '@/lib/types'

export const serverService = {
  async getUserServers(): Promise<Server[]> {
    const response = await api.get('/servers')
    return response.data.data
  },

  async getServerById(serverId: string): Promise<any> {
    const response = await api.get(`/servers/${serverId}`)
    return response.data.data
  },

  async createServer(name: string, iconColor?: string): Promise<Server> {
    const response = await api.post('/servers', { name, iconColor })
    return response.data.data
  },

  async updateServer(
    serverId: string,
    data: { name?: string; icon?: string; iconColor?: string }
  ): Promise<Server> {
    const response = await api.patch(`/servers/${serverId}`, data)
    return response.data.data
  },

  async deleteServer(serverId: string): Promise<void> {
    await api.delete(`/servers/${serverId}`)
  },

  async joinServer(serverId: string): Promise<any> {
    const response = await api.post(`/servers/${serverId}/join`)
    return response.data.data
  },
}

