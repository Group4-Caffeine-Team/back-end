'use strict'

const express = require('express');
const server = express();

const cors = require('cors');
const axios = require('axios');
server.use(cors());
require('dotenv').config();

const bookapi = process.env.bookapi;
const db = process.env.db;

const pg = require('pg');
const client = new pg.Client(db);
const PORT = process.env.PORT;
server.use(express.json());



server.get('/', getCategoryList);
server.get('/category-items', categoryItemsList);
server.get('/readingnow', readingNowList);
server.get('/wishlist', wishList);
server.post('/add-to-reading', addToReadingList);
server.post('/add-to-wish', addToWishList);
server.put('/updatemodal', updateModal);
server.delete('/deleteitemfromreading/:id',deleteItemFromReading );
server.delete('/deleteitemfromwish/:id', deleteItemFromWish);
server.get('*', defaultHandler)
server.use(errorHandler)




function BookTypeList(list_name, list_name_encoded) {
    this.list_name = list_name;
    this.list_name_encoded = list_name_encoded
}
function getCategoryList(req, res) {
    let url = `https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${bookapi}`;
    axios.get(url)
        .then(result => {
            console.log(result.data.results);
            let list = result.data.results.map(item => {
                let type = new BookTypeList(item.list_name, item.list_name_encoded)
                return type;
            })

            res.send(list);
        })
        .catch((error) => {
            res.status(500).send(error);
        })
}
////////
function book(book_image, title, author, description, buy_links) {
    this.book_image = book_image;
    this.title = title;
    this.author = author;
    this.description = description;
    this.buy_links = buy_links
}
function categoryItemsList(req, res) {
    let booksType = req.query.list_name_encoded;
    let url = `https://api.nytimes.com/svc/books/v3/lists/current/${booksType}.json?api-key=${bookapi}`;
    axios.get(url)
        .then(result => {
            console.log(result.data.results.books);
            let list = result.data.results.books.map(item => {
                let type = new book(item.book_image, item.title, item.author, item.description, item.buy_links)
                return type;
            })

            res.send(list);
        })
        .catch((error) => {
            res.status(500).send(error);
        })
}

function readingNowList(req, res){
  let sql=`SELECT * FROM readinglist;`
  client.query(sql)
  .then(result=>{
    res.send(result);
  })
  .catch((error) => {
    res.status(500).send(error);
})

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

function updateModal (req, res){
    const readinglist = req.body;
    const sql = `UPDATE readinglist
    SET book_image = $1, title = $2, author=$3, descrip=$4, buy_links=$5, qouts=$6, opinion=$7, finsh_reading=$8, 
    book_mark=$9, recommindation=$10
    WHERE id = ${readinglist.id} RETURNING *`;
    const values = [readinglist.book_image, readinglist.title, readinglist.author,
        readinglist.description, readinglist.buy_links, readinglist.qouts, readinglist.opinion, readinglist.finsh_reading,
        readinglist.book_mark, readinglist.recommindation]

    client.query(sql,values)
        .then((data)=>{
            console.log(data)
            const sql = `SELECT * FROM readinglist;`
            client.query(sql)
                .then((response)=>{
                    res.send(response.rows)
                })
                .catch(error => {
                    res.send(error)
                })
        })
        .catch(error => {
            res.send(error)
        })
}


function deleteItemFromReading (req, res){
    const id = req.params.id;
    const sql = `DELETE FROM readinglist WHERE id =${id}`;

    client.query(sql)
        .then((response)=>{
            res.send("The book has been deleted");
        })
        .catch(error => {
            res.send(error)
        })
}

function deleteItemFromWish(req, res){
    const id = req.params.id;
    const sql = `DELETE FROM wishlist WHERE id =${id}`;

    client.query(sql)
        .then((response)=>{
            res.send("The book has been deleted from wish list");
        })
        .catch(error => {
            res.send(error)
        })
}

function defaultHandler(req, res) {
    res.status(404).send('default route')
}


function errorHandler(error, req, res) {
    const err = {
        status: 500,
        errorMessage: error
    }
    res.status(500).send(err)
}

client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Listening on ${PORT}: I'm ready`)

        })
    })