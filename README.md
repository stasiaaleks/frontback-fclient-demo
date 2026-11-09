# Articles Fat Client

A small articles site. Anyone can read published articles; logged-in users manage them in an admin panel. The page updates by itself when someone adds or changes an article — no refresh needed.

Built with React and Bootstrap in the browser, Node.js, Express and MongoDB on the server. The API can be tested with Postman.

## Getting started

```bash
cp .env.example .env # and set SESSION_SECRET
make install
make db-up  # starts MongoDB in Docker
make seed # adds sample articles and two users (wipes existing data)
```

Then run the server and the client in two terminals and open http://localhost:5173:

```bash
make dev-server
make dev-client
```

Or build once and run everything on one port, http://localhost:3003:

```bash
make build && make start
```

## Users

`make seed` creates two accounts, an admin and an editor. Their usernames and passwords are taken from `.env` (`ADMIN_*` and `EDITOR_*`). Log in as each in two different browsers to see how locking works.

## Business logic

**Reading.** Visitors see only published articles. Drafts, archived articles and lock details are visible only after logging in.

**Publishing.** An article starts as a draft. It can be published, then archived or moved back to draft. Only drafts can be edited.

**Locking.** Two people can't change the same article at once. Before a change the article is locked by the current user; anyone else gets an error until the lock is released or expires (5 minutes by default). The admin panel does this for you: clicking Edit locks the article, Save or Cancel releases it.

**Live updates.** Each page keeps a Server-Sent Events connection to `/api/events` open; when something changes, the server sends an event over it and the page reloads its data. The notification itself carries no data, so visitors learn nothing about drafts.

## Security

- Login is session-based. The session cookie can't be read by scripts and isn't sent from other sites.
- Passwords are stored as hashes, never in plain text.
- Every change requires being logged in, and every change request must carry an `X-Requested-With: XMLHttpRequest` header. This blocks forged requests from other sites.
- Security headers (including a Content-Security-Policy) are set on every response.
- Article text is always shown as plain text, so it can't inject scripts.

In production (`NODE_ENV=production`) the cookie is sent only over HTTPS.

## Testing

Import `postman_collection.json` and run the whole collection in order. It logs in, keeps the session cookie, and adds the required header automatically. To run from terminal: `npx newman run postman_collection.json`.

`make test` runs server tests.

## API

| Method | Path | Body | Login | What it does |
|---|---|---|---|---|
| POST | `/auth/login` | `username, password` |  | Log in |
| POST | `/auth/logout` | |  | Log out |
| GET | `/auth/me` | |  | Who is logged in (`user: null` if nobody) |
| GET | `/events` | |  | Live update notifications |
| GET | `/articles` | |  | Published articles (all of them when logged in) |
| GET | `/articles/:id` | |  | One article |
| POST | `/articles` | `title, author, content, tags?` | yes | Create a draft |
| PUT | `/articles/:id` | `title, author, content, tags?` | yes | Edit a draft |
| DELETE | `/articles/:id` | | yes | Delete |
| POST | `/articles/:id/lock` | | yes | Lock |
| DELETE | `/articles/:id/lock` | | yes | Unlock |
| POST | `/articles/:id/publish` | | yes | Publish a draft |
| POST | `/articles/:id/unpublish` | | yes | Move back to draft |
| POST | `/articles/:id/archive` | | yes | Archive |
