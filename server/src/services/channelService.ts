import prisma from '../utils/prisma.js'

export const getServerChannels = async (serverId: string, userId: string) => {
  // Check if user is a member of the server
  const member = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId,
      },
    },
  })

  if (!member) {
    throw new Error('Not a member of this server')
  }

  const channels = await prisma.channel.findMany({
    where: { serverId },
    orderBy: {
      createdAt: 'asc',
    },
  })

  return channels
}

export const createChannel = async (
  serverId: string,
  userId: string,
  data: { name: string; type: 'text' | 'voice' }
) => {
  // Check if user is owner or admin
  const member = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId,
      },
    },
  })

  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new Error('Only server owners and admins can create channels')
  }

  const channel = await prisma.channel.create({
    data: {
      ...data,
      serverId,
    },
  })

  return channel
}

export const updateChannel = async (
  channelId: string,
  userId: string,
  data: { name?: string; type?: 'text' | 'voice' }
) => {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      server: true,
    },
  })

  if (!channel) {
    throw new Error('Channel not found')
  }

  // Check if user is owner or admin
  const member = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: channel.serverId,
      },
    },
  })

  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new Error('Only server owners and admins can update channels')
  }

  const updatedChannel = await prisma.channel.update({
    where: { id: channelId },
    data,
  })

  return updatedChannel
}

export const deleteChannel = async (channelId: string, userId: string) => {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  })

  if (!channel) {
    throw new Error('Channel not found')
  }

  // Check if user is owner or admin
  const member = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: channel.serverId,
      },
    },
  })

  if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
    throw new Error('Only server owners and admins can delete channels')
  }

  await prisma.channel.delete({
    where: { id: channelId },
  })
}

