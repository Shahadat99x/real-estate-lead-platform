FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

EXPOSE 3000

# Run Next.js in dev mode
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]
