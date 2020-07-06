# Use node 12.17.0
FROM node:12

# Copy source code
COPY . /app

# Change working directory
WORKDIR /app

# Install dependencies
RUN npm install 

# Expose API port to the outside
EXPOSE 5001

# Launch application
CMD ["npm","start"]