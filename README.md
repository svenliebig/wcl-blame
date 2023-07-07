# wcl-blame-api

## requirements

- node v16.18.0
- npm v8.19.2

## install dependencies

```bash
npm install
```

## build package

```bash
npm run build
```

## start service

```bash
npm start --workspace service
```

## generate schema

Use [get-graphql-schema](https://github.com/prisma-labs/get-graphql-schema) download the schema from Warcraftlogs.

```bash
# install global cli tool get-graphql-schema
npm install -g get-graphql-schema
# execute
get-graphql-schema https://www.warcraftlogs.com/api/v2/client -h "authorization=Bearer <TOKEN>" > ./api/schema.graphql
# regenerate using codegem
npm generate --workspace api
```
