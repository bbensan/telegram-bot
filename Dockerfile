FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY bot.js .
COPY config.js .
COPY credentialsService.js .
COPY .env .

EXPOSE 8443

CMD ["npm", "start"]