# Use the official Node.js image as the base image
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install FFmpeg and other dependencies
RUN apt-get update && apt-get install -y \
	ffmpeg \
	libflac-dev \
	libmp3lame-dev \
	&& rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./

# Install project dependencies
RUN npm install

# Copy the rest of the application files into the container
COPY . .

# Install TypeScript globally and compile the TypeScript files
RUN npm install -g typescript

# Compile the TypeScript files into JavaScript
RUN tsc

# Expose the port that the app will run on
EXPOSE 3000

# Start the app when the container runs
CMD ["node", "dist/index.js"]
