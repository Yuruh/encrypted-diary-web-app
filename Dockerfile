FROM node:13.12.0

COPY . .

RUN yarn install

RUN yarn run build

RUN npm install -g serve

CMD ["serve", "-s", "build"]
