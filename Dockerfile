# Use an official Node.js runtime as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json files to the container
COPY package*.json ./

# Install only the dependencies
RUN npm install --production

# Copy the rest of the application code to the container
COPY . .

# Expose the port that the Express app runs on
EXPOSE 3000

# Set environment variables if needed
# Set NODE_ENV to production for optimized performance
ENV NODE_ENV=production

# Start the application with Node
CMD ["node", "server.js"]
