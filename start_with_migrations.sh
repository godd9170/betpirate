#!/bin/sh

set -ex
# npx prisma migrate reset -f
npx prisma migrate deploy
npm run start
