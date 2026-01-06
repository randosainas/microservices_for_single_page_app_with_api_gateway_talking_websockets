#-------------------------------------------
FROM node:24-slim AS base
#-------------------------------------------
LABEL author="Basil Claeys" 
LABEL project="transcendence"

WORKDIR /app
RUN --mount=type=cache,target=/app/.npm \
  npm set cache /app/.npm
RUN mkdir dist
RUN mkdir db

COPY package*.json ./
COPY drizzle.config.ts ./

RUN apt update && apt -y install tini

#-------------------------------------------
FROM base AS dev
#-------------------------------------------
ENV NODE_ENV development
RUN --mount=type=cache,target=/app/.npm \
  npm install
COPY . .

COPY tsconfig.dev.json ./

RUN npm run typecheck

RUN npx drizzle-kit push --force

CMD ["/bin/tini", "--", "npm", "run", "tsx-run", "src/index.ts"]

#-------------------------------------------
FROM base AS prod
#-------------------------------------------
ENV NODE_ENV production
EXPOSE 4001
RUN --mount=type=cache,target=/app/.npm \
			npm ci --omit=dev
USER node
COPY --chown=node:node ./src/ .

COPY tsconfig.prod.json ./

RUN npx drizzle-kit push --force

CMD [ "/bin/tini", "./node_modules/.bin/tsx", "--tsconfig", "tsconfig.prod.json", "index.ts" ]
