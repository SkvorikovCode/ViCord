import prisma from '../utils/prisma.js'

export const getChannelMessages = async (
  channelId: string,
  userId: string,
  limit = 50,
  before?: string
) => {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  })

  if (!channel) {
    throw new Error('Channel not found')
  }

  // Check if user is a member of the server
  const member = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: channel.serverId,
      },
    },
  })

  if (!member) {
    throw new Error('Not a member of this server')
  }

  const messages = await prisma.message.findMany({
    where: {
      channelId,
      ...(before && { createdAt: { lt: new Date(before) } }),
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })

  return messages.reverse()
}

export const createMessage = async (channelId: string, userId: string, content: string) => {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
  })

  if (!channel) {
    throw new Error('Channel not found')
  }

  // Check if user is a member of the server
  const member = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: channel.serverId,
      },
    },
  })

  if (!member) {
    throw new Error('Not a member of this server')
  }

  const message = await prisma.message.create({
    data: {
      content,
      authorId: userId,
      channelId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
          status: true,
        },
      },
    },
  })

  return message
}

export const updateMessage = async (messageId: string, userId: string, content: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  })

  if (!message) {
    throw new Error('Message not found')
  }

  if (message.authorId !== userId) {
    throw new Error('You can only edit your own messages')
  }

  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          avatar: true,
          status: true,
        },
      },
    },
  })

  return updatedMessage
}

export const deleteMessage = async (messageId: string, userId: string) => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      channel: true,
    },
  })

  if (!message) {
    throw new Error('Message not found')
  }

  // Check if user is message author or server admin/owner
  const member = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId: message.channel.serverId,
      },
    },
  })

  const isAuthor = message.authorId === userId
  const isAdmin = member && (member.role === 'owner' || member.role === 'admin')

  if (!isAuthor && !isAdmin) {
    throw new Error('You can only delete your own messages or be a server admin')
  }

  await prisma.message.delete({
    where: { id: messageId },
  })
}

