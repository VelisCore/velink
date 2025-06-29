# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port (change if your server uses a different port)
EXPOSE 3000

# Start the Node server
CMD [ "node", "server.js" ]
