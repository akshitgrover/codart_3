FROM node:alpine

WORKDIR /app

ADD package.json /app

RUN npm install

ADD . /app

VOLUME /uploads

EXPOSE 3000

CMD ["node","server.js"]