# playtomic-node

An unofficial TypeScript client for Playtomic, built mainly to make Playtomic chat usable from Node.js.

The useful bit is chat: open a conversation with a player or a match, authenticate with Playtomic's chat service, and send a message to the live thread. The client takes care of the Playtomic login, token refresh, and chat authentication behind the scenes.

> This project is not affiliated with or endorsed by Playtomic. It uses private APIs, so upstream changes may break it without warning.

## What it can do

- Find or create a direct chat thread with a Playtomic user
- Find or create the chat thread for a match
- Send text messages to those threads
- Refresh expired access tokens automatically
- Look up users, clubs, classes, and tournaments
- Work with both ESM and CommonJS projects

## Install

The package is not on npm yet. Install it straight from GitHub:

```bash
npm install github:albyonl/playtomic-node
```

For local development:

```bash
git clone https://github.com/albyonl/playtomic-node.git
cd playtomic-node
npm install
npm run build
```

## Send a chat message

Create a client with the credentials for the Playtomic account that should send the message:

```ts
import "dotenv/config";
import { playtomic, getUserThread, sendMessage } from "playtomic";

const client = playtomic({
  email: process.env.PLAYTOMIC_EMAIL!,
  password: process.env.PLAYTOMIC_PASSWORD!,
});

const threadId = await getUserThread(client, "PLAYTOMIC_USER_ID");
const messageId = await sendMessage(
  client,
  "Hi! Are you still looking for a fourth player?",
  threadId,
);

console.log(`Sent message ${messageId}`);
```

For a match chat, swap `getUserThread` for `getMatchThread`:

```ts
import { getMatchThread, sendMessage } from "playtomic";

const threadId = await getMatchThread(client, "PLAYTOMIC_MATCH_ID");
await sendMessage(client, "I will be there ten minutes early.", threadId);
```

Chat sign-in is lazy. The Firebase token is only requested when the first message is sent, and a failed token is retried once automatically.

## Keep credentials out of your code

Put your login details in a local `.env` file:

```dotenv
PLAYTOMIC_EMAIL=you@example.com
PLAYTOMIC_PASSWORD=your-password
```

`.env` and the local `.playtomic` token cache are already ignored by Git. Do not commit either one.

## Other API helpers

The same authenticated client can be used for a handful of Playtomic lookups:

```ts
import {
  getMe,
  getUser,
  getTenants,
  getTenantById,
  getClasses,
  getClassById,
  getTournaments,
  getTournamentById,
} from "playtomic";

const me = await getMe(client);
const nearbyClubs = await getTenants(client, {
  coordinates: { lat: 51.5072, lon: -0.1276 },
  radius: 10_000,
});

const upcomingClasses = await getClasses(client, {
  tenantId: "PLAYTOMIC_CLUB_ID",
  from: new Date(),
});
```

You can also use `client.get`, `client.post`, and `client.patch` for endpoints that do not have a helper yet. Call `client.logout()` to clear the cached session.

## Current chat scope

Chat support currently sends plain text messages. Reading message history, subscribing to new messages, attachments, reactions, and editing or deleting messages are not implemented yet.

## Development

```bash
npm install
npm run build
```

The build outputs CommonJS, ESM, type declarations, and source maps to `dist/`.

I am not going to maintain this if it breaks.
