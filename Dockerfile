# Install dependencies only when needed
FROM node:alpine AS deps
WORKDIR /usr/src/app

COPY . ./

# building the app
RUN npm i
RUN npm run build

# Running the app
CMD [ "npm", "start" ]