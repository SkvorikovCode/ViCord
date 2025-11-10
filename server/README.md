# ViCord Backend Server

Backend сервер для ViCord - мессенджера в стиле Discord.

## 🛠 Технологии

- **Node.js** + **Express** - REST API сервер
- **TypeScript** - типизация
- **Prisma** - ORM для работы с базой данных
- **SQLite** - база данных (легко заменить на PostgreSQL/MySQL)
- **Socket.io** - WebSocket для real-time коммуникации
- **JWT** - аутентификация
- **Bcrypt** - хеширование паролей

## 📦 Установка

```bash
# Установить зависимости
npm install

# Создать .env файл (скопировать из .env.example)
# и настроить переменные окружения

# Запустить миграции базы данных
npm run prisma:migrate

# Заполнить базу тестовыми данными
npm run prisma:seed
```

## 🚀 Запуск

### Development режим
```bash
npm run dev
```

### Production режим
```bash
npm run build
npm start
```

## 📡 API Endpoints

### Аутентификация
- `POST /api/auth/register` - регистрация
- `POST /api/auth/login` - вход
- `POST /api/auth/logout` - выход
- `POST /api/auth/refresh` - обновление токена
- `GET /api/auth/me` - текущий пользователь

### Серверы
- `GET /api/servers` - список серверов пользователя
- `POST /api/servers` - создать сервер
- `GET /api/servers/:id` - получить сервер
- `PATCH /api/servers/:id` - обновить сервер
- `DELETE /api/servers/:id` - удалить сервер
- `POST /api/servers/:id/join` - присоединиться к серверу

### Каналы
- `GET /api/channels/server/:serverId` - каналы сервера
- `POST /api/channels/server/:serverId` - создать канал
- `PATCH /api/channels/:id` - обновить канал
- `DELETE /api/channels/:id` - удалить канал

### Сообщения
- `GET /api/messages/channel/:channelId` - получить сообщения
- `POST /api/messages/channel/:channelId` - отправить сообщение
- `PATCH /api/messages/:id` - редактировать сообщение
- `DELETE /api/messages/:id` - удалить сообщение

## 🔌 WebSocket Events

### Клиент -> Сервер
- `authenticate` - аутентификация
- `channel:join` - присоединиться к каналу
- `channel:leave` - покинуть канал
- `message:new` - новое сообщение
- `message:update` - обновление сообщения
- `message:delete` - удаление сообщения
- `typing:start` - начало печати
- `typing:stop` - конец печати

### Сервер -> Клиент
- `authenticated` - успешная аутентификация
- `message:new` - новое сообщение
- `message:update` - обновление сообщения
- `message:delete` - удаление сообщения
- `typing:start` - пользователь начал печатать
- `typing:stop` - пользователь закончил печатать
- `user:online` - пользователь онлайн
- `user:offline` - пользователь оффлайн

## 🗃️ База данных

### Модели
- `User` - пользователи
- `Server` - серверы
- `Channel` - каналы
- `Message` - сообщения
- `ServerMember` - участники серверов
- `RefreshToken` - refresh токены

### Prisma команды
```bash
# Создать миграцию
npm run prisma:migrate

# Запустить Prisma Studio (GUI для БД)
npm run prisma:studio

# Сгенерировать Prisma Client
npm run prisma:generate

# Заполнить БД тестовыми данными
npm run prisma:seed
```

## 🔐 Безопасность

- JWT с access и refresh токенами
- Bcrypt для хеширования паролей
- Helmet для защиты заголовков
- CORS настройка
- Rate limiting
- Валидация данных

## 📝 Тестовые данные

После выполнения `npm run prisma:seed` будут созданы:

**Пользователи:**
- email: `user@vicord.dev`, password: `password123`
- email: `bot@vicord.dev`, password: `password123`
- email: `admin@vicord.dev`, password: `password123`

**Серверы:**
- Мой сервер (владелец: user@vicord.dev)
- Геймеры (владелец: user@vicord.dev)
- Разработка (владелец: admin@vicord.dev)

## 🔧 Настройка

Переменные окружения в `.env`:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

## 📄 Лицензия

MIT

