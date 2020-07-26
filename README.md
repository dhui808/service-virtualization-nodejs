# Service Virtualization with Node.js

This project uses Node.js to implement the Service Virtualization for testing Mobile banking frontend in various business use cases.

## Create Dockfile and .dockerignore

## Run Node.js application from command line

node src/index.js

## Build Docker image

In package.json, add:

"build-docker": "docker build -t dannyhui/service-virtualization-nodejs .",

From commandline, enter:

npm run build-docker

## Run Docker image

In package.json, add:

"run-docker": "docker run -d -p 8080:8080 -t dannyhui/service-virtualization-nodejs",

From commandline, enter:

npm run run-docker

## Run Service Virtualization UI

Open Web Server for Chrome

Port: 4200

Folder: points to the root deployment folder of [service virtualization UI application](https://github.com/dhui808/service-virtualization-ui).

## Start the browser

http://localhost:8080/banking


## Clean up

### List running Docker containers

docker ps

### Stop the running Docker container
docker container stop <container_id> 

### Delete all stopped Docker containers

docker rm $(docker ps -a -q)

### Delete all Docker images
 
docker rmi -f $(docker images -a -q)
