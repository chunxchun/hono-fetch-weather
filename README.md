```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```

initialize database, test locally
```txt
npx wrangler d1 execute [DB] --remote/--local --file=[schema]
```

list tables
```txt
npx wrangler d1 execute [DB] --command "SELECT name, sql FROM sqlite_master"
```

select from table
```txt
npx wrangler d1 execute [DB] --command "select * from [table]"
```
