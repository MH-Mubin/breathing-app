FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy application files
COPY . .

# Expose port
EXPOSE 5000

# Start the application in production mode
CMD ["npm", "start"]
