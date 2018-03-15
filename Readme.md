# Codart 3.0
-------------
Codart is the flagship event conducted by <b>[ACM VIT Student Chapter](http://acmvit.in)</b> Every Year. This year 1st round was conducted on Hackerearth and 2nd round was conducted on portal developed by ACM VIT Student Chapter.

## What is this repo about?
-------------
This repository holds the backend tree of the Portal develpoed by <b>[ACM VIT Student Chapter](http://acmvit.in)</b>.

## Backend Controllers:
-------------
* Admin Controller

> * Login/Logout

* Question Controller

> * Create Question
> * Emit Question (Real Time : Socket.io) (- Admin)
> * Skip Question (Emit Score : Real Time : Socket.io) (With Penalty)

* User Controller

> * Login
> * Post Response (Auto Testing : Emit Score : Real Time : Socket.io) (Hackerrank API)
> * Leaderboard
> * Get Score Of Individual Team

**NOTE:**

Whenever a team uploads the source code file, Test Cases for the particular question along with the source code file is tested for the output using Hackerrank api, Once the output is matched score is emitted, and based on the dart socer another question is emitted for that particular user using Web Sockets (socket.io)

**Other Features:**

There are 3 levels of difficulty Easy, Medium and Hard and also 2 buffer questions which cannot be skipped. A Random question of easy difficulty is given and for other difficulties questions are given in order. A person cannot skip more than 2 questions consecutively, on successful submission skip counter is reset.

**Scoring Scheme:**

> **Successful Submission:**<br/>
> Easy += 50 <br/>
> Medium += 50 <br/>
> Hard += 50 <br/>

> **Skip Penalty:**<br/>
> Easy -= 20 <br/>
> Medium -= 15 <br/>
> Hard -= 10 <br/>

### Packages Used:
----------
* [bcrypt-nodejs](https://www.npmjs.com/package/bcrypt-nodejs)
...Why? 
	* Hashing Passwords
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
...Why? 
	* Stateless Authentication
* [hacken](https://www.npmjs.com/package/hacken)
...Why?
	* Utility
* [Socket.io](https://www.nmpjs.com/package/socket.io)
...Why?
	* Real Time Events

## Docket Support:
----------
[Codart 3.0 Portal](http://rc.acmvit.in) Was a big project to make sure everything wokrs fine when integrated with frontend and when taken into production, App was Dockerized.

<b>Dockerfile:</b><br>
Dockerfile is used to build the [image](https://hub.docker.com/r/akshitgrover/acmreversecoding_portal/) of this api.

<b>docker-compose.yml</b><br>
docker-compose.yml is used to deploy the stack (Sails API && MongoDb) in docker swarm when taken into production ([DigitalOcean Cloud](https://www.digitalocean.com/))
