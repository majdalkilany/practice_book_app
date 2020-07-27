DROP TABLE IF EXISTS books1 ;
CREATE TABLE books1 (
     id SERIAL PRIMARY KEY ,
   title  varchar(255),
    authors varchar(255),
    img varchar(255),
    description TEXT
);
