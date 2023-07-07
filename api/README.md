# wcl-blame-api

## requirements

- node v16.18.0
- pnpm v8.6.6

## install dependencies

```bash
pnpm install
```

## generate schema

Use [get-graphql-schema](https://github.com/prisma-labs/get-graphql-schema) download the schema from Warcraftlogs.

```bash
# install
npm install -g get-graphql-schema
# execute
get-graphql-schema https://www.warcraftlogs.com/api/v2/client -h "authorization=Bearer <TOKEN>" > schema.graphql
# regenerate using codegem
pnpm generate
```
