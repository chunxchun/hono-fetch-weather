install dependencies & run locally
```txt
pnpm install
pnpm run dev
```

```txt
pnpm run deploy
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
# Database D1

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

# Storage R2
create bucket
```bash
npx wrangler r2 bucket create [R2]
```

# Curl
curl press links
```bash
for i in {01..31}
  do
    curl --request POST \
      --url https://hono-fetch-weather.find2meals.workers.dev/api/weathers/press-links/2024/10/$i \
      --header 'Authorization: Bearer $token' \
      --header 'User-Agent: insomnia/11.1.0'
  done
```

curl hourly readings
```bash
for i in {01..31}
  do
    curl --request POST \
      --url https://hono-fetch-weather.find2meals.workers.dev/api/weathers/hourly-readings/2024/10/$i \
      --header 'Authorization: Bearer $token' \
      --header 'User-Agent: insomnia/11.1.0
  done
```

curl daily summaries
```bash
for i in {01..31}
  do
    curl --request POST \
      --url https://hono-fetch-weather.find2meals.workers.dev/api/weathers/daily-summaries/2024/10/$i \
      --header 'Authorization: Bearer $token' \
      --header 'User-Agent: insomnia/11.1.0
  done
```
