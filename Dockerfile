FROM node:alpine

WORKDIR /app

ADD package.json /app

RUN npm install

ADD config.js /app 

ADD . /app

VOLUME /app/uploads

EXPOSE 3000

CMD ["node","server.js"]