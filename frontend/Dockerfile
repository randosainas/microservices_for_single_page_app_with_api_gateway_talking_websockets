FROM node:24-alpine AS base
LABEL author="Elias Fret"
LABEL project="transcendence"

WORKDIR /app
# RUN mkdir dist

RUN apk add --no-cache tini

RUN --mount=type=cache,target=/app/.npm \
            npm set cache /app/.npm
COPY package*.json ./
COPY --from=shared . /shared


FROM base AS dev
ENV NODE_ENV=development
RUN --mount=type=cache,target=/app/.npm \
            npm install
COPY . .

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "dev"]


FROM base AS build
ENV NODE_ENV=development
RUN --mount=type=cache,target=/app/.npm \
            npm ci

COPY . .

RUN npm run typecheck
RUN npm run build


FROM nginx:alpine AS prod

EXPOSE 5173
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

# ENTRYPOINT [""]
# CMD ["nginx", "-g", "daemon off;"]
