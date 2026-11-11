# Chat Backend

A simple chat backend built with:

- Node.js + TypeScript
- PostgreSQL with Prisma
- Firebase Firestore
- Express 5
- Zod validation

PostgreSQL stores users, chats, and chat members. Firestore stores messages, read receipts, and each user's last seen message.

## How It Works

1. Users are seeded into PostgreSQL.
2. `POST /chat/create` creates a direct chat or returns the existing one.
3. Chat membership is checked in PostgreSQL before a user can send or read messages.
4. Messages, read receipts, and last seen state are stored in Firestore.
5. `GET /user/:userId/chats` reads chat and member information from PostgreSQL.

## Prerequisites

- Node.js 20 or newer
- PostgreSQL running locally
- Java 11 or newer for the Firestore emulator

## Setup

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Set `DATABASE_URL` in `.env`. On macOS, you can find your PostgreSQL username with:

```bash
whoami
```

Example:

```env
DATABASE_URL=postgresql://your_username@localhost:5432/chat_app?schema=public
```

Start PostgreSQL and create the database:

```bash
brew services start postgresql@14
createdb chat_app
```

Apply the migration and seed two demo users:

```bash
npm run db:setup
```

Seeded users:

- `user_alice` - Alice
- `user_bob` - Bob

## Running Locally

Start the Firebase emulator in the first terminal:

```bash
npm run firebase:emulator
```

The Firestore emulator runs at `127.0.0.1:8080`.

On the first Firestore request, Firebase Admin may print a one-time `MetadataLookupWarning` while using the emulator. It is harmless.

Start the API in a second terminal:

```bash
npm run dev
```

The API runs at `http://localhost:3000`.

## Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://your_username@localhost:5432/chat_app?schema=public
FIREBASE_PROJECT_ID=demo-chat
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
```

For production, remove `FIRESTORE_EMULATOR_HOST` and set one of:

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./service-account.json
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## API

### Create or Get Chat

```bash
curl -X POST http://localhost:3000/chat/create \
  -H "Content-Type: application/json" \
  -d '{"userAId":"user_alice","userBId":"user_bob"}'
```

Response:

```json
{
  "chatId": "6f21c8a9-1f6c-4d19-9d6d-0e3f8c6f2f66"
}
```

Creating the same chat again, even with the user order reversed, returns the same `chatId`.

### Send Message

```bash
curl -X POST http://localhost:3000/chat/CHAT_ID/message/send \
  -H "Content-Type: application/json" \
  -d '{"senderId":"user_alice","text":"Hello Bob"}'
```

Response:

```json
{
  "messageId": "Xe37WZbOuT2GPdUDULpu",
  "chatId": "CHAT_ID",
  "senderId": "user_alice",
  "text": "Hello Bob",
  "createdAt": "2026-11-11T13:45:05.010Z"
}
```

### Get Messages

```bash
curl "http://localhost:3000/chat/CHAT_ID/messages?limit=50"
```

Messages are returned in ascending timestamp order. `limit` defaults to `50` and can be between `1` and `100`.

```json
{
  "messages": [
    {
      "messageId": "Xe37WZbOuT2GPdUDULpu",
      "senderId": "user_alice",
      "text": "Hello Bob",
      "createdAt": "2026-11-11T13:45:05.010Z"
    }
  ]
}
```

### Mark Message Read

```bash
curl -X POST http://localhost:3000/chat/CHAT_ID/message/MESSAGE_ID/read \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_bob"}'
```

Response:

```json
{
  "chatId": "CHAT_ID",
  "messageId": "MESSAGE_ID",
  "userId": "user_bob",
  "readAt": "2026-11-11T13:45:10.365Z"
}
```

### Update Last Seen Message

```bash
curl -X POST http://localhost:3000/chat/CHAT_ID/lastseen \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_bob","messageId":"MESSAGE_ID"}'
```

Response:

```json
{
  "chatId": "CHAT_ID",
  "userId": "user_bob",
  "messageId": "MESSAGE_ID",
  "updatedAt": "2026-11-11T13:45:10.406Z"
}
```

### List User Chats

```bash
curl http://localhost:3000/user/user_alice/chats
```

Response:

```json
{
  "chats": [
    {
      "chatId": "CHAT_ID",
      "type": "DIRECT",
      "memberIds": ["user_alice", "user_bob"],
      "members": [
        {
          "id": "user_alice",
          "displayName": "Alice"
        },
        {
          "id": "user_bob",
          "displayName": "Bob"
        }
      ],
      "createdAt": "2026-11-11T13:45:01.084Z",
      "updatedAt": "2026-11-11T13:45:10.231Z"
    }
  ]
}
```

### Health Check

```bash
curl http://localhost:3000/health
```

## Firestore Structure

```text
chats/{chatId}/messages/{messageId}
  senderId: string
  text: string
  createdAt: timestamp

chats/{chatId}/messages/{messageId}/reads/{userId}
  userId: string
  readAt: timestamp

chats/{chatId}/lastSeen/{userId}
  userId: string
  messageId: string
  updatedAt: timestamp
```

## PostgreSQL Structure

- `users` - user ID and display name
- `chats` - chat ID, type, direct-chat key, timestamps
- `chat_members` - many-to-many membership between users and chats

## Error Format

```json
{
  "error": {
    "code": "CHAT_NOT_FOUND",
    "message": "Chat CHAT_ID was not found"
  }
}
```

Common status codes:

- `400` invalid request
- `403` user is not a chat member
- `404` user, chat, message, or route not found
- `500` internal error

## Notes

- Authentication is not implemented. User IDs are trusted as described in the assignment.
- `GET /chat/:chatId/messages` does not receive a user ID, so it checks that the chat exists but does not check membership.
- Message ordering uses the Firestore `createdAt` timestamp.
- Message edits and deletes and group-chat management are not included. The database model has a `GROUP` chat type ready for future expansion.
