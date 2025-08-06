FROM node:20-bullseye
WORKDIR /web
COPY package.json ./
RUN npm install --omit=dev
COPY app ./app
RUN npx next build
EXPOSE 3000
CMD ["npm","run","start","--","-p","3000"]
