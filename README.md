# Set up and Configure Server

configuration settings for the server can be found in in server/configs/index.js

## SQL

Sql is required for all functionallity

import the sql file into phpmyadmin
change the dbconfigs in the configs file
ensure user has permissions
start the mysql server before the node server

disconecting the db will cause fatal error

## Redis Server

The Redis server currently only handles Rate-limiting
The system operates as noraml without it

change the redisconfigs in the config file
start the redis client
Restart the node server to retry connection




# Run

ensure the database is configured and on
open the server folder in a terminal
run "npm start" to start the server

the terminal will provide details of the connection or any errors

# Test Calls

The provided calls are not part of the production system
They are for testing purposes only

See http folder in the zip folder for calls and instructions

# Folder Structure

OOP and ES6 modular js

Each folder contains an index
the index handles shared functions
and functions that the named files build on

The named files contain specific functions for data types
they will reference their index when needed

## Cofigs

-- basic server configs

## functions

-- functions, just things that dont fit else where

-- translators - change data in helpful ways

## models

--database interaction funcitons

-- Recieve params
-- make queries
-- handle errors
-- return

## responses

-- handling of responses

-- given a response object and params
-- send a formatted reponse with json

## routes

-- setting of routes and manipulation of data

-- interpret request
-- request and await data through a model
-- send a response

## session

-- handles user login, and redis functions

-- handle JWT
-- Handle redis connection and interaction

## validation

-- handles validation of inputs before use with any models

-- check for required keys
-- remove any extra keys
-- do regex

index.js , just runs the index route

I chose this structure as it offers a flexible framework
It also provides great consistency
The structure was roughly modeled off PHP class OOP

# Data Structure

## Database

The database has not been completed
Only structural attibutes are in place
extra attributes will be added after as needed

## Permissions

There are 2 kinds of permission, user and group
group permissions come with an accesslevel 1-5

user permission is ensured through JWT tokens
group permission is unsured with JWT and database checks

## Relations

-- Group -> project -> task (Content)
Users can craete groups
group members are assigned roles, which determine permisssions
create a project for a group, then a task for that project

-- notes
come in 3 kinds and can be added to any content a user has permision for
can be edited by their author
can be read by group members
can be deleted by group members with high perms

-- Group -> member/invite -> user
groups have members
user will be auto added to a group when created
groups can invite new members
when a user accepts an invite the new membership is created

-- group -> role
groups each have 5 different roles
they are created when the group is
can change the name
cannot add more or delete
users are assigned roles with their membership

# Future Features:

Server Side Caching with Redis
Search - return search results for a user
-- get all from search_content where groupID in membershipsArr
-- get all from search_users where 1
Image Upload with Multer
Seperate Refresh Token
