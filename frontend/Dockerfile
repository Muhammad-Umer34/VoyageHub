FROM node:20-alpine

WORKDIR /app

# Copy only package files to install dependencies
COPY package.json package-lock.json ./

RUN npm install

# Copy the rest of the frontend code
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
