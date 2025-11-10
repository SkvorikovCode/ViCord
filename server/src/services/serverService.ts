import prisma from '../utils/prisma.js'

export const getUserServers = async (userId: string) => {
  const serverMembers = await prisma.serverMember.findMany({
    where: { userId },
    include: {
      server: {
        include: {
          owner: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              members: true,
              channels: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: 'asc',
    },
  })

  return serverMembers.map((sm) => sm.server)
}

export const getServerById = async (serverId: string, userId: string) => {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
    include: {
      owner: {
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      },
      channels: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatar: true,
              status: true,
            },
          },
        },
      },
    },
  })

  if (!server) {
    throw new Error('Server not found')
  }

  // Check if user is a member
  const isMember = server.members.some((member) => member.userId === userId)
  if (!isMember) {
    throw new Error('Not a member of this server')
  }

  return server
}

export const createServer = async (userId: string, name: string, iconColor?: string) => {
  const server = await prisma.server.create({
    data: {
      name,
      iconColor: iconColor || '#5865f2',
      ownerId: userId,
      members: {
        create: {
          userId,
          role: 'owner',
        },
      },
      channels: {
        create: [
          { name: 'общий', type: 'text' },
          { name: 'голосовой', type: 'voice' },
        ],
      },
    },
    include: {
      channels: true,
    },
  })

  return server
}

export const updateServer = async (
  serverId: string,
  userId: string,
  data: { name?: string; icon?: string; iconColor?: string }
) => {
  // Check if user is owner
  const server = await prisma.server.findUnique({
    where: { id: serverId },
  })

  if (!server) {
    throw new Error('Server not found')
  }

  if (server.ownerId !== userId) {
    throw new Error('Only the server owner can update the server')
  }

  const updatedServer = await prisma.server.update({
    where: { id: serverId },
    data,
  })

  return updatedServer
}

export const deleteServer = async (serverId: string, userId: string) => {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
  })

  if (!server) {
    throw new Error('Server not found')
  }

  if (server.ownerId !== userId) {
    throw new Error('Only the server owner can delete the server')
  }

  await prisma.server.delete({
    where: { id: serverId },
  })
}

export const joinServer = async (serverId: string, userId: string) => {
  const server = await prisma.server.findUnique({
    where: { id: serverId },
  })

  if (!server) {
    throw new Error('Server not found')
  }

  // Check if already a member
  const existingMember = await prisma.serverMember.findUnique({
    where: {
      userId_serverId: {
        userId,
        serverId,
      },
    },
  })

  if (existingMember) {
    throw new Error('Already a member of this server')
  }

  const member = await prisma.serverMember.create({
    data: {
      userId,
      serverId,
      role: 'member',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatar: true,
          status: true,
        },
      },
    },
  })

  return member
}

