FROM node:12.16.3-stretch

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
RUN git clone -b v1.0.1 https://github.com/jay16213/snacks.git

WORKDIR /usr/src/app/snacks
RUN npm install
COPY ./config.json.deploy ./config.json

EXPOSE 3000
CMD [ "node", "app.js" ]
