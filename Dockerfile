FROM node:12-alpine
COPY package.json .
RUN npm install
COPY . .
RUN npm build
EXPOSE 3000
CMD ["npm", "run", "serve:docker"]