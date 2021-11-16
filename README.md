# Service Virtualization with Node.js

This project uses Node.js to implement the Service Virtualization for testing Mobile banking frontend in various business use cases.

## Dependency

[service virtualization UI application](https://github.com/dhui808/service-virtualization-ui)

[service virtualization data](https://github.com/dhui808/service-virtualization-data)

## Install NPM
npm install

## Configuration
In .env configuration file, modify the following entries:
  
	servicevirtualizationdata_home: Pointing to the root folder of service virtualization data. For   instance,  
		servicevirtualizationdata_home=/usr/service-virtualization-data/servicevirtualizationdata  
	
	uipath: Pointing to the root folder of the service virtualization ui static files. For instance,  
		uipath=/usr/service-virtualization-ui/static
	
## Run Node.js application from command line

node src/index.js

## Run Node.js application in debugging mode from command line

node --inspect src/index.js

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

### Delete all stopped Docker containers (Git Bash)

docker rm $(docker ps -a -q)

### Delete all Docker images  (Git Bash)
 
docker rmi -f $(docker images -a -q)
