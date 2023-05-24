'use strict';
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();
const pg = require('pg')

const server = express();
server.use(cors())

const apiKey = process.env.APIkey;

server.use(express.json())

const PORT = 3000;

const client = new pg.Client(process.env.DATABASE_URL)

server.get('/', homeHandler)

server.get('/wishlist', wishList);
server.post('/add-to-reading', addToReadingList);
server.post('/add-to-wish', addToWishList);

server.get('*', defaultHandler)




////////////////////////
function homeHandler(req, res) {    
    res.status(200).send("Hello, from Home page");
}

function wishList(req,res){

    const sql = `SELECT * FROM wishlist`;
    client.query(sql)
        .then(data => {
            res.send(data.rows);
        })

        .catch((error) => {
            errorHandler(error, req, res)
        })
}

function addToReadingList(req, res){
    const recipe = req.body;
    console.log(recipe);
    const sql = `INSERT INTO readinglist (book_image, title, author, descrip, buy_links)
    VALUES ($1, $2, $3, $4, $5);`
    const values = [recipe.book_image, recipe.title, recipe.author, recipe.description, recipe.buy_links];
    client.query(sql, values)
        .then(data => {
            res.send("The data has been added successfully");
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })  
}

function addToWishList(req, res){
    const recipe = req.body;
    console.log(recipe);
    const sql = `INSERT INTO wishlist (book_image, title, author, descrip, buy_links)
    VALUES ($1, $2, $3, $4, $5);`
    const values = [recipe.book_image ,recipe.title, recipe.author, recipe.description, recipe.buy_links];
    client.query(sql, values)
        .then(data => {
            res.send("The data has been added successfully");
        })
        .catch((error) => {
            errorHandler(error, req, res)
        })
}





function defaultHandler(req, res) {
    res.status(404).send('Page not found')
}

server.use(function (err, req, res, next) {
    console.error(err.stack);
    let obj = {
        "status": 500,
        "responseText": "Sorry, something went wrong"
    };
    res.status(500).send(obj);
});






client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`I'm Listening on ${PORT}: I'm ready now`)
        })
    })