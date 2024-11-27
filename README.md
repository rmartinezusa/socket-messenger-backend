1. Authentication
Purpose: Handle user registration, login, and authentication.

POST /register
Registers a new user.
Request Body: { username, password, name? }
Response: { id, username, name }

POST /login
Logs in a user and returns a token/session.
Request Body: { username, password }
Response: { token, userId }

User Management
Purpose: Manage user-related data.

GET /users (Protected)
Fetches a list of users (for starting conversations).
Response: [{ id, username, name }]

GET /users/:id (Protected)
Fetches a specific user’s profile.
Response: { id, username, name, createdAt }

GET /profile (Protected)
Retrieves the logged-in user’s profile.
Response: { id, username, name, createdAt }


Conversations
Purpose: Handle conversations between users.

GET /conversations (Protected)
Fetches all conversations the logged-in user participates in.
Response: [{ id, participants: [{ id, username, name }], createdAt }]

POST /conversations (Protected)
Creates a new conversation between users.
Request Body: { participantIds: [userId1, userId2] }
Response: { id, participants: [{ id, username, name }], createdAt }

GET /conversations/:id (Protected)
Fetches details of a specific conversation, including participants and messages.
Response: { id, participants: [{ id, username, name }], messages: [{ id, content, senderId, sentAt }], createdAt }


Messages
Purpose: Handle sending, retrieving, and managing messages.

GET /conversations/:id/messages (Protected)
Fetches all messages in a specific conversation.
Response: [{ id, content, senderId, sentAt }]

POST /conversations/:id/messages (Protected)
Sends a new message in a conversation.
Request Body: { content }
Response: { id, content, senderId, sentAt }

