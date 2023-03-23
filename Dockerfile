FROM node:17

#working Dir
WORKDIR /usr/src/app

#Copy Package JSON files
COPY package*.json ./

#Install Files
RUN npm install

#Copy source files
COPY . .

#Build
RUN npm run

# Expose the API Port
EXPOSE 9998 9999 27017

CMD ["node", "SlotMachineWebSocket"]