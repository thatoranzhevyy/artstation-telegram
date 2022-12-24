FROM node:16.14.0

WORKDIR /

RUN npm install


CMD [ "node", "index.js" ]
