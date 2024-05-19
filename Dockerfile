# Step 1: Build the application
FROM node:18-alpine3.19 AS builder

WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

# Step 2: Run the application
FROM node:18-slim

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json

# Your app binds to port 3000 - expose it
EXPOSE 3000

# Define the runtime command to run the app
CMD [ "yarn", "run", "start:prod" ]
