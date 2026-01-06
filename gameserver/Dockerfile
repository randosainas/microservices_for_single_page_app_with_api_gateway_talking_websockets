# Some principles:
# 	* dev and production stages are not chained. this would increase
#	  attack surface. by inheritace of tools needed in one stage
#	  not the other. 
#	* more layers better cache layout, less to rebuild
#	* production stage no root policy
#	* make use of Docker Buildkit cache mount
# ::::::::::::::::::::::::::::::
#        Stage 1: Dev
# ::::::::::::::::::::::::::::::

FROM node:24-alpine AS deps
# Tag vunerabilities 24.09.2025 00020 hub.docker.com

# Container abs path for project
WORKDIR /app

COPY package*.json tsconfig.json ./

# Use cache mount to speed up install of existing dependencies
# Install full packackage for dev
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm i --no-fund

FROM deps AS dev
# do not copy the files using a bind mount in compose.
# COPY src ./src
# PID1 is important for signal behaviour, tini helps child processes
# to get the signals, reap zombies, tsx creats children in dev stage 
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "dev"]

# ::::::::::::::::::::::::::::::
#        Stage 2: Build
# ::::::::::::::::::::::::::::::
# compile TS->JS into dist/ . keep tsx and typescript from production

FROM deps AS build
COPY src ./src
RUN npm run build

# ::::::::::::::::::::::::::::::
#     Stage 3: Production-dep
# ::::::::::::::::::::::::::::::
# smaller production image, independent from src/ 

FROM node:24-alpine AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/usr/src/app/.npm \
  npm set cache /usr/src/app/.npm && \
  npm ci --omit=dev --no-fund

# ::::::::::::::::::::::::::::::
#      Stage 4: Production
# ::::::::::::::::::::::::::::::

FROM node:24-alpine AS production

# having tini in production makes it also portable to kuberetes
RUN apk add --no-cache tini

WORKDIR /app
# copy from prod-deps stage file system instead of host's
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build      /app/dist         ./dist

# do not use root user, node image has this user
# limit root user in production image
# Create node_modules with proper permissions
RUN chown -R node:node /app 
USER node

# Run compiled JS, listen for port 3003 on the docker network
EXPOSE 3003
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]
