FROM node:23-slim AS install_deps

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY ./src ./src
COPY tsconfig.json .  
COPY .env ./

RUN npx tsc -p tsconfig.json

FROM node:23-slim

RUN apt-get update && apt-get install -y curl netcat-openbsd


WORKDIR /usr/src/app

COPY --from=install_deps /usr/src/app/dist ./dist
COPY --from=install_deps /usr/src/app/node_modules ./node_modules
COPY --from=install_deps /usr/src/app/.env ./

EXPOSE 3002

CMD ["node", "dist/server.js"]