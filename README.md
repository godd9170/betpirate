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
- Text a user a confirmation that their submission was received
- Welcome screen, when user has no submissions
- Make leaderboard sexier
    show all the props across the top, with check marks
- images on props
- get a date for sheet closure from the sheet itself
- programmatically request e-transfer payment (TD Api)
- webhook to catch e-transfer payment and automatically mark as paid
    - should still support manual payments (perhaps let the user chose?)
- ability to share your picks via social media
- ability to upload a user image
- in app notifications
- novelty/game tags on questions 
    - (prize for best novelty picks?)
    - allow to submit only novelty picks?
- ability to change your picks until the deadline
- block submissions for people who are still on the submission form
- show a percentage selection of each option
- high roller option
    - $100 entry where you compete with the other $100 entrants. $10 goes to the
       regular pot, the other $90 to the high roller pot.
- Offline mode - print a sheet out, tick the options off, then upload a picture of it by scanning a QR code?
    - Leave a stack of the prop sheets at a bar
- Sponsor prizes, donated prizes with advertisements in exchange for physical prizes we can give away
- height: 100dvh; /* Ensures proper height even with browser UI */
