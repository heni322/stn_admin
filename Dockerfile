# Use an official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 inside the container
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
