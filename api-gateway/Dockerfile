#-------------------------------------------
FROM node:24-alpine AS base
#-------------------------------------------
LABEL author="Basil Claeys" 
LABEL project="transcendence"
# LABEL website="?"

WORKDIR /app
RUN --mount=type=cache,target=/app/.npm \
  npm set cache /app/.npm
RUN mkdir dist

COPY package*.json ./

# Basil: Adding Tini to run as PID 1 is good practice.
# Source: https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md
RUN apk add --no-cache tini


#-------------------------------------------
FROM base AS dev
#-------------------------------------------
ENV NODE_ENV development
RUN --mount=type=cache,target=/app/.npm \
  npm install
COPY . .

COPY tsconfig.dev.json ./

RUN npm run typecheck
CMD ["/sbin/tini", "--", "npm", "run", "tsx-run", "src/index.ts"]


#-------------------------------------------
FROM base AS prod
#-------------------------------------------
ENV NODE_ENV production
EXPOSE 3000
RUN --mount=type=cache,target=/app/.npm \
			npm ci --omit=dev
USER node
COPY --chown=node:node ./src/ .
COPY tsconfig.prod.json ./

CMD [ "/sbin/tini", "./node_modules/.bin/tsx", "--tsconfig", "tsconfig.prod.json", "index.ts" ]
