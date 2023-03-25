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

## Deployment

```sh
fly deploy
```

## todo

move `"esbuild-register": "^3.4.2"` back to dev deps when no longer seeding in prod.