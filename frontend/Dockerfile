# Use a lightweight Node image
FROM node:20-alpine

WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app
COPY . .

# Expose port
EXPOSE 5173

# Run dev server
CMD ["npm", "run", "dev", "--", "--host"]
