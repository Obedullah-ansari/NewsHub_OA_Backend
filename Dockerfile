# Step 1: Use an official Node.js image as the base image
FROM node:14

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files
COPY package*.json ./

# Step 4: Install the app dependencies
RUN npm install

# Step 5: Copy the rest of your app's source code
COPY . .

# Step 6: Expose the port your app runs on
EXPOSE 3000

# Step 7: Start the application
CMD ["npm", "start"]
