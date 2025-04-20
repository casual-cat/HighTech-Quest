# api/Dockerfile
FROM node:18

# 1. Put code under /usr/src/app
WORKDIR /usr/src/app

# 2. Copy package files and install deps
COPY package*.json ./
RUN npm install

# 3. Copy only the API code
COPY . .

# 4. Build TypeScript into dist/
RUN npm run build

# 5. Expose and start
EXPOSE 3000
CMD ["node", "dist/index.js"]
