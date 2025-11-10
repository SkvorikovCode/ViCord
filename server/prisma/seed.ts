import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.refreshToken.deleteMany()
  await prisma.message.deleteMany()
  await prisma.serverMember.deleteMany()
  await prisma.channel.deleteMany()
  await prisma.server.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.create({
    data: {
      email: 'user@vicord.dev',
      username: 'ViCordUser',
      password: hashedPassword,
      status: 'online',
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'bot@vicord.dev',
      username: 'Бот',
      password: hashedPassword,
      status: 'online',
    },
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'admin@vicord.dev',
      username: 'Admin',
      password: hashedPassword,
      status: 'online',
    },
  })

  console.log('✅ Created users')

  // Create servers
  const server1 = await prisma.server.create({
    data: {
      name: 'Мой сервер',
      iconColor: '#5865f2',
      ownerId: user1.id,
    },
  })

  const server2 = await prisma.server.create({
    data: {
      name: 'Геймеры',
      iconColor: '#23a559',
      ownerId: user1.id,
    },
  })

  const server3 = await prisma.server.create({
    data: {
      name: 'Разработка',
      iconColor: '#f23f43',
      ownerId: user3.id,
    },
  })

  console.log('✅ Created servers')

  // Add server members
  await prisma.serverMember.createMany({
    data: [
      { userId: user1.id, serverId: server1.id, role: 'owner' },
      { userId: user2.id, serverId: server1.id, role: 'member' },
      { userId: user1.id, serverId: server2.id, role: 'owner' },
      { userId: user1.id, serverId: server3.id, role: 'member' },
      { userId: user3.id, serverId: server3.id, role: 'owner' },
    ],
  })

  console.log('✅ Created server members')

  // Create channels
  const channel1 = await prisma.channel.create({
    data: {
      name: 'общий',
      type: 'text',
      serverId: server1.id,
    },
  })

  const channel2 = await prisma.channel.create({
    data: {
      name: 'рандом',
      type: 'text',
      serverId: server1.id,
    },
  })

  const channel3 = await prisma.channel.create({
    data: {
      name: 'голосовой',
      type: 'voice',
      serverId: server1.id,
    },
  })

  const channel4 = await prisma.channel.create({
    data: {
      name: 'музыка',
      type: 'voice',
      serverId: server1.id,
    },
  })

  await prisma.channel.createMany({
    data: [
      { name: 'основной', type: 'text', serverId: server2.id },
      { name: 'игры', type: 'text', serverId: server2.id },
      { name: 'войс', type: 'voice', serverId: server2.id },
      { name: 'код', type: 'text', serverId: server3.id },
      { name: 'обсуждение', type: 'text', serverId: server3.id },
    ],
  })

  console.log('✅ Created channels')

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        content: 'Привет! Добро пожаловать в ViCord! 🎉',
        authorId: user2.id,
        channelId: channel1.id,
        createdAt: new Date(Date.now() - 3600000),
      },
      {
        content:
          'Это легкий и красивый аналог Discord, созданный с использованием React, TypeScript и Tailwind CSS.',
        authorId: user2.id,
        channelId: channel1.id,
        createdAt: new Date(Date.now() - 3500000),
      },
      {
        content: 'Круто! Мне нравится интерфейс 😍',
        authorId: user1.id,
        channelId: channel1.id,
        createdAt: new Date(Date.now() - 1800000),
      },
      {
        content: 'Привет всем! Как дела?',
        authorId: user1.id,
        channelId: channel2.id,
        createdAt: new Date(Date.now() - 7200000),
      },
      {
        content: 'Отлично! Работаю над новыми фичами 💪',
        authorId: user3.id,
        channelId: channel2.id,
        createdAt: new Date(Date.now() - 7100000),
      },
    ],
  })

  console.log('✅ Created messages')
  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

