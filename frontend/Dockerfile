FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

# Source is mounted as a volume in dev
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
