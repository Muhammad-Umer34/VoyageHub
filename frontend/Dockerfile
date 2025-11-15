FROM node:20-alpine

# Install dependencies required for native modules
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install with all optional dependencies
RUN rm -rf node_modules package-lock.json
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev"]