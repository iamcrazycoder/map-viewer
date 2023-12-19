# Map Viewer

<img width="1722" alt="Screenshot 2023-12-19 at 10 21 31 PM" src="https://github.com/iamcrazycoder/map-viewer/assets/64554492/dd2d48fc-800d-4f0d-a152-21a470767ce9">


Now view the [tree data]([url](https://data.cityofnewyork.us/Environment/2015-Street-Tree-Census-Tree-Data/pi5s-9p35)https://data.cityofnewyork.us/Environment/2015-Street-Tree-Census-Tree-Data/pi5s-9p35) of New York city in an interactive map. Filter through the various options and get a good insight right on the map. 

## Steps to install:

Pre-requisite:
- Docker

### Import data from official website to local database

```shell
cd backend

# create env file
cp .env.keep .env

# start docker services
docker-compose up -d

# install backend dependencies
npm i 

# run db migrations & add seed data
npm run knex migrate:latest
npm run knex seed:run

# this process may take around 2-4 minutes to complete
# don't cancel while the process is running 
npm run import-ny-trees
```

### Start the backend server

```
npm run build:dev
```

### Start the frontend app
```shell
cd frontend

# install frontend dependencies
npm i

# start app
npm start
```

Head to http://localhost:3000 and explore the trees of New York city.
