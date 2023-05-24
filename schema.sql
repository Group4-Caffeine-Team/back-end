DROP TABLE IF EXISTS readinglist;


CREATE TABLE IF NOT EXISTS readinglist (
    id SERIAL PRIMARY KEY,
    book_image VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),
    descrip VARCHAR(255),
    buy_links text[],
    qouts text[],
    opinion VARCHAR(255),
    finsh_reading BOOLEAN,
    book_mark INT,
    recommindation BOOLEAN
  
    
);

DROP TABLE IF EXISTS wishlist;


CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    book_image VARCHAR(255),
    title VARCHAR(255),
    author VARCHAR(255),
    descrip VARCHAR(255),
    buy_links text[]
    
);