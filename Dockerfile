FROM node:10

WORKDIR /usr/src/app

COPY . .

RUN yarn && yarn compile

CMD [ "yarn", "start" ]