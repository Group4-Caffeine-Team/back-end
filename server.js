'use strict'


const express = require('express');
const server = express();
const cors = require('cors');
require('dotenv').config();
server.use(cors()) // middleware
const pg = require('pg');
const axios = require('axios');

const PORT = process.env.PORT;
const client = new pg.Client(process.env.DATABASE_URL);
server.use(express.json())  // to handle post request method 
server.put('/updatemodal', updateModal);
server.delete('/deleteitemfromreading/:id',deleteItemFromReading );
server.delete('/deleteitemfromwish/:id', deleteItemFromWish);
server.get('*', defaultHandler)
server.use(errorHandler)



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