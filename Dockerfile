FROM node:18 as build

WORKDIR /user/src/app/api

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000 

RUN npx prisma generate

# Build app
RUN npm run build


CMD [ "npm" , "start" ]