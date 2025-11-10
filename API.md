# ViCord API Documentation

## 🔐 Аутентификация

Все защищенные endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <access_token>
```

## 📡 Endpoints

### Auth

#### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "avatar": null,
      "status": "online"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

#### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Обновление токена
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

#### Выход
```http
POST /api/auth/logout
Authorization: Bearer <token>
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

#### Текущий пользователь
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Servers

#### Получить серверы пользователя
```http
GET /api/servers
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Мой сервер",
      "icon": null,
      "iconColor": "#5865f2",
      "ownerId": "uuid",
      "createdAt": "2025-11-10T10:00:00.000Z",
      "owner": {
        "id": "uuid",
        "username": "owner",
        "avatar": null
      }
    }
  ]
}
```

#### Создать сервер
```http
POST /api/servers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Новый сервер",
  "iconColor": "#5865f2"
}
```

#### Получить сервер по ID
```http
GET /api/servers/:id
Authorization: Bearer <token>
```

#### Обновить сервер
```http
PATCH /api/servers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Обновленное название",
  "iconColor": "#23a559"
}
```

#### Удалить сервер
```http
DELETE /api/servers/:id
Authorization: Bearer <token>
```

#### Присоединиться к серверу
```http
POST /api/servers/:id/join
Authorization: Bearer <token>
```

### Channels

#### Получить каналы сервера
```http
GET /api/channels/server/:serverId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "общий",
      "type": "text",
      "serverId": "uuid",
      "createdAt": "2025-11-10T10:00:00.000Z"
    }
  ]
}
```

#### Создать канал
```http
POST /api/channels/server/:serverId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "новый-канал",
  "type": "text"
}
```

#### Обновить канал
```http
PATCH /api/channels/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "обновленное-название"
}
```

#### Удалить канал
```http
DELETE /api/channels/:id
Authorization: Bearer <token>
```

### Messages

#### Получить сообщения канала
```http
GET /api/messages/channel/:channelId?limit=50&before=2025-11-10T10:00:00.000Z
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional) - количество сообщений (по умолчанию 50)
- `before` (optional) - дата для пагинации

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Привет!",
      "channelId": "uuid",
      "authorId": "uuid",
      "createdAt": "2025-11-10T10:00:00.000Z",
      "author": {
        "id": "uuid",
        "username": "user",
        "avatar": null,
        "status": "online"
      }
    }
  ]
}
```

#### Отправить сообщение
```http
POST /api/messages/channel/:channelId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Привет всем!"
}
```

#### Редактировать сообщение
```http
PATCH /api/messages/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Обновленное сообщение"
}
```

#### Удалить сообщение
```http
DELETE /api/messages/:id
Authorization: Bearer <token>
```

## 🔌 WebSocket Events

### Подключение

```javascript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001')

// Аутентификация
socket.emit('authenticate', accessToken)

socket.on('authenticated', (data) => {
  console.log('Authenticated:', data.userId)
})
```

### События клиент → сервер

#### Присоединиться к каналу
```javascript
socket.emit('channel:join', channelId)
```

#### Покинуть канал
```javascript
socket.emit('channel:leave', channelId)
```

#### Новое сообщение
```javascript
socket.emit('message:new', {
  channelId: 'uuid',
  message: {
    id: 'uuid',
    content: 'Привет!',
    author: { ... },
    timestamp: new Date()
  }
})
```

#### Начало печати
```javascript
socket.emit('typing:start', {
  channelId: 'uuid',
  userId: 'uuid',
  username: 'username'
})
```

#### Конец печати
```javascript
socket.emit('typing:stop', {
  channelId: 'uuid',
  userId: 'uuid'
})
```

### События сервер → клиент

#### Новое сообщение
```javascript
socket.on('message:new', (message) => {
  console.log('New message:', message)
})
```

#### Обновление сообщения
```javascript
socket.on('message:update', (message) => {
  console.log('Message updated:', message)
})
```

#### Удаление сообщения
```javascript
socket.on('message:delete', (data) => {
  console.log('Message deleted:', data.messageId)
})
```

#### Пользователь печатает
```javascript
socket.on('typing:start', (data) => {
  console.log(`${data.username} is typing...`)
})

socket.on('typing:stop', (data) => {
  console.log(`User ${data.userId} stopped typing`)
})
```

#### Статус пользователя
```javascript
socket.on('user:online', (data) => {
  console.log(`${data.username} is now online`)
})

socket.on('user:offline', (data) => {
  console.log(`${data.username} is now offline`)
})
```

## 🔒 Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request - неверные данные |
| 401 | Unauthorized - не авторизован |
| 403 | Forbidden - нет доступа |
| 404 | Not Found - ресурс не найден |
| 500 | Internal Server Error |

## 📝 Примеры использования

### Полный flow аутентификации

```javascript
import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

// 1. Регистрация
const registerResponse = await axios.post(`${API_URL}/auth/register`, {
  email: 'user@example.com',
  username: 'username',
  password: 'password123'
})

const { accessToken, refreshToken } = registerResponse.data.data

// 2. Сохранить токены
localStorage.setItem('accessToken', accessToken)
localStorage.setItem('refreshToken', refreshToken)

// 3. Использовать токен для запросов
const serversResponse = await axios.get(`${API_URL}/servers`, {
  headers: {
    Authorization: `Bearer ${accessToken}`
  }
})

console.log('My servers:', serversResponse.data.data)
```

### Работа с сообщениями

```javascript
// Получить сообщения
const messages = await axios.get(
  `${API_URL}/messages/channel/${channelId}?limit=50`,
  {
    headers: { Authorization: `Bearer ${accessToken}` }
  }
)

// Отправить сообщение
const newMessage = await axios.post(
  `${API_URL}/messages/channel/${channelId}`,
  { content: 'Привет!' },
  {
    headers: { Authorization: `Bearer ${accessToken}` }
  }
)
```

## 🧪 Тестовые данные

После выполнения `npm run prisma:seed`:

**Пользователи:**
- Email: `user@vicord.dev`, Password: `password123`
- Email: `bot@vicord.dev`, Password: `password123`
- Email: `admin@vicord.dev`, Password: `password123`

**Серверы:**
- Мой сервер (владелец: user@vicord.dev)
- Геймеры (владелец: user@vicord.dev)
- Разработка (владелец: admin@vicord.dev)

