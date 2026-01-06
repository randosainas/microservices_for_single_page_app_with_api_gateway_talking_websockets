FROM node:24-alpine

EXPOSE 4000
WORKDIR /app
RUN npm install -g nodemon

COPY package*.json ./
RUN npm install

COPY . .

ENTRYPOINT ["npm", "run"]
CMD ["dev"]
