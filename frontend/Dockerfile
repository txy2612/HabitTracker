FROM node:22-alpine 
# start from node.js 22 

WORKDIR /app 
# cd /app

COPY package*.json ./
RUN npm ci
# copies package.json & package-lock.json into the container

COPY . .
# copies the rest of the project

EXPOSE 5173
# DOES NOT opne port
# "this application listens on port 5173"

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
# starts the app
