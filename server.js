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
client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`running on port ${PORT},Im ready..`)
        });
    });


let obj2 = {
    status: 500,
    resonseText: "Sorry, something went wrong"
};
//
server.get('/', getCategoryList);
server.get('/category-items', categoryItemsList);
server.get('/readingnow', readingNowList);
server.get('/servererror', (req, res) => {
    res.status(500).send("Page Not Found");
});
server.get('*', (req, res) => {
    res.status(404).send(JSON.stringify(obj2));
});
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

function errorHandler(error, req, res) {
    const err = {
        errNum: 500,
        msg: error
    }
    res.status(500).send(err);
}