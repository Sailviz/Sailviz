FROM node:20-alpine

ENV jwtSecret ${jwtSecret}

ENV NEXT_PUBLIC_SENTRY_DSN ${NEXT_PUBLIC_SENTRY_DSN}
ENV SOCKET_URL = ${SOCKET_URL}

ENV DATABASE_URL mysql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}/pg

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Copying source files
COPY . /usr/src/app
COPY prisma ./prisma/
RUN npx prisma generate

# Building app
RUN npm run build
EXPOSE $PORT

# Running the app
CMD "npm" "run" "start"