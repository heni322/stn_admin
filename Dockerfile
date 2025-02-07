FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the Next.js application in production mode
CMD ["npm", "start"]
