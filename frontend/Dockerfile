# Stage 1 - Build frontend
FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port Vite runs on
EXPOSE 5173

# Run the dev server
CMD ["npm", "run", "dev", "--", "--host"]
