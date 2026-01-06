FROM node:24-alpine AS docs

WORKDIR /docs

RUN npm install -g typedoc

COPY ./frontend ./frontend
COPY ./gameserver ./gameserver
# COPY ./backend ./backend

RUN npm i --prefix ./frontend
RUN npm i --prefix ./gameserver
# RUN npm i --omit=dev --prefix ./backend

COPY ./docs/typedoc.json ./
COPY --from=shared . ./shared

RUN typedoc

FROM nginx:alpine AS serve-docs
COPY --from=docs /docs/out /usr/share/nginx/html
