FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .


ENV DATABASE_URL="postgresql://postgres:123456@localhost:5432/ecommerce"

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]