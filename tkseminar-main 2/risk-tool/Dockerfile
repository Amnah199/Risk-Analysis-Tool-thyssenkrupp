FROM node:14.9
 
WORKDIR /usr/src/app
 
COPY package*.json ./
 
RUN npm install
RUN npm install @mui/system@5.10.15
RUN npm uninstall @mui/system@5.10.15
RUN npm install d3


COPY . .
 
EXPOSE 3000
 
CMD [ "npm", "start" ]