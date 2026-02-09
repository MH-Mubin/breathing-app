FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Set proper permissions
RUN chown -R node:node /app

# Switch to node user
USER node

# Expose port (Railway will set PORT env variable)
EXPOSE 8080

# Start production server
CMD ["serve", "-s", "dist", "-l", "8080"]
