FROM node:20-alpine3.20

ENV jwtSecret ${jwtSecret}

ENV NEXT_PUBLIC_SENTRY_DSN ${NEXT_PUBLIC_SENTRY_DSN}

ENV SKIP_ENV_VALIDATION=1

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app
COPY prisma ./prisma/
# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Building app
RUN npm run build
EXPOSE $PORT

# Running the app
CMD "npm" "run" "start"