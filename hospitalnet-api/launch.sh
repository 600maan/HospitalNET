#!/bin/bash  

echo Pull MongoDb Image from DockerHub and start a docker container
docker pull mongo
docker run --name mongodb -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=secret -d -p 27017:27017 mongo

echo Rebuild Docker Image
docker build -t demo-app-api:1.0 .

echo Start Container
docker run --name demo-app-api --restart always -p 5001:5001/tcp demo-app-api:1.0
