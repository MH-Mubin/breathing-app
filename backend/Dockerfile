FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for development)
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Start the application with nodemon for hot reload
CMD ["npm", "run", "dev"]
