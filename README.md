## Development

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Unit tests

Unit tests are written using [jest](https://jestjs.io/). There are two types of unit tests "server" and "react". If it's a react test, ensure that the `/** @jest-environment jsdom */` [docblock](https://jestjs.io/docs/configuration#testenvironment-string) is included at the top of the file so the [`jsdom`](https://github.com/jsdom/jsdom) is used.

```sh
npm test # one off
npm run test:watch # using watcher
```

## Database

### local

To apply changes to the schema locally for development

```sh
npx prisma db push
```

To create a migration

```sh
npx prisma migrate deploy
```

### hosted

#### create db
```sh
fly postgres connect -a betpirate-db
CREATE DATABASE betpirate;
```

#### connect from local

```sh
fly proxy 5432 -a betpirate-db
```
then connect using sql client with username and pass from secret

## Deployment

```sh
fly deploy
```

## todo


### tech debt
- move `"esbuild-register": "^3.4.2"` back to dev deps when no longer seeding in prod.
- in models, infer parameter types from prisma and <exclude> ids accordingly

### feature
- collect username ✅
    - + emoji (maybe image?)
- ability to mark answers
    - super user ✅
    - special answer key sheet ✅
    - edit prop names/descriptions ✅
- leaderboard (polling refresh?) ✅
- prop images
- mobile first
- normalize phone numbers on input ✅
- text results
- prop short names ✅
- prop answer short names ✅
- ability to close sheet to new submissions ✅
- ability to mark sheet with a winner
- can auth from different device
- sheet statuses ✅
- aggregate correct answers in prisma method ✅
    - count submission proposition selections where proposition selection option's the answer ✅
- tiebreaker score

- Add payment explanation, payment before 6pm
- countdown
- tiebreaker
- gatorade multi
- load test
- pod monday