## hospitalnet-api
***hospitalnet-api*** is a NodeJS REST API Server to interact with the Hyperledger Fabric based blockchain network. It uses [Hyperledger Fabric SDK for Node.js version 1.4 ](https://hyperledger.github.io/fabric-sdk-node/) and TypeScript

## API EndPoints
- /create - Create Medical Record for new patient's
- /query - Query Medical Record of Patient
- /update - Update Medical Record of Patient

## Requirement's
1. Node (12.17.0)
2. NPM (6.14.4)
3. MongoDB (4.0)
4. Docker (19.03.8)
4. Docker Compose (1.25.85)
6. Visual Studio Code (1.38) 

#### Installing Docker/DockerCompose
- [Install Docker](https://docs.docker.com/install/)
- [Install Docker Compose](https://docs.docker.com/compose/install/)


#### Set up MongoDB
- Execute below docker commands to start MongoDB Container
```shell script
docker pull mongo 
docker run --name mongodb -e MONGO_INITDB_ROOT_USERNAME=mongoadmin -e MONGO_INITDB_ROOT_PASSWORD=secret -d -p 27017:27017 mongo
```

#### Set Environment variables
- Copy `.env.example` to `.env` and update `.env` as per your configuration

```shell script
$ cp .env.example .env
```

####  Install Dependencies
```shell script
$ npm install
```

####  Run Unit Test
```shell script
$ npm run test
```
#### Run in Development mode 
```shell script
$ npm run startdev
```

#### Swagger Documentation 
- [Swagger](http://localhost:5001/v1/api-docs/)
