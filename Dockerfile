# Use an official Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Remove any existing node_modules from the copied files
RUN rm -rf node_modules

# Install dependencies again to ensure clean installation
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 3000 (internal container port)
EXPOSE 3000

# Start the Next.js application in development mode
CMD ["npm", "run", "dev"]
