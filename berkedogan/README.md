# berkedogan.com.tr

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Local push testing

The push flow can be tested in Vite dev mode, even when you open the app through a LAN IP instead of `localhost`.
Dev-only push requests add `?dev=1` automatically, so the backend can bypass auth for local testing.
If you want to force the same behavior in a production-like environment, set `ALLOW_PUSH_BYPASS=true`.

### 1) Create a subscription from the app

Open the app locally, go to the Tasks page, and enable notifications. The local dev flow uses these endpoints:

- `GET /api/push?action=key`
- `POST /api/push?action=subscribe`

Important: browser notification permission and service workers require a secure context. `localhost` is allowed, but opening the app over plain `http://192.168.x.x` will block notification permission in most browsers.

### 2) Send a direct test notification

You can send a notification directly to one subscription or to all active subscriptions.

Send to a specific subscription object:

```sh
curl -X POST -H "Content-Type: application/json" \
	-d '{
		"subscription": {"endpoint":"...","keys":{"p256dh":"...","auth":"..."}},
		"payload": {
			"title": "Deneme",
			"body": "Bu bir test bildirimidir",
			"data": { "url": "/panel/tasks" },
			"actions": [{ "action": "snooze-1d", "title": "Bir gün ertele" }]
		}
	}' \
	"http://localhost:5173/api/push?action=test-send"
```

Send to all active subscriptions in the database:

```sh
curl -X POST -H "Content-Type: application/json" \
	-d '{
		"payload": {
			"title": "Deneme",
			"body": "Bu bir test bildirimidir",
			"data": { "url": "/panel/tasks" },
			"actions": [{ "action": "snooze-1d", "title": "Bir gün ertele" }]
		}
	}' \
	"http://localhost:5173/api/push?action=test-send"
```

### 3) Send a task-based reminder

If you want to test the existing reminder logic, the backend still supports:

```sh
curl -X POST -H "Content-Type: application/json" \
	-d '{"taskId":123}' \
	"http://localhost:5173/api/push?action=trigger-task"
```
