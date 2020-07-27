require('dotenv').config()
const express = require('express')
const superagent = require('superagent')
const pg = require('pg')
const methodOverride = require('method-override')

const app = express()
const PORT = process.env.PORT
const client = new pg.Client(process.env.DATABASE_URL)


// ============================================================USES
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public')); 
app.set('view engine', 'ejs');


client.connect()
.then(()=>{
    app.listen(PORT , ()=>{
console.log(' I am runing')
    })
})


// ============================================================rouys
app.get('/',indexHandler)
app.get('/search',searchHandler)
app.post('/add',addHandler)
app.get('/favorite',favoriteHandler)
app.get('/details/:id',detailsHandler)
app.put('/update/:id',updateHandler)
app.put('/delete/:id',deleteHandler)

// ============================================================indexHandler
function indexHandler(req,res){
    res.render('index_page')
}

// ============================================================searchHandler
function searchHandler(req,res){
//    let searchBy= req.query.searchBy
let {searchBy ,keyword} = req.query
// console.log(searchBy)
const url = `https://www.googleapis.com/books/v1/volumes?q=${keyword}+in${searchBy}:${keyword}`;
superagent.get(url).then(result=>{
    // console.log(result.body.items)
    books = result.body.items.map(val=>{
        return new Book(val)
    })
    res.render('result_page',{data:books})

})
}
// ============================================================addHandler
function addHandler(req,res){
    // console.log(req.body)
    let {title, authors, img , description} = req.body
    let sql = `INSERT INTO books1 (title, authors, img , description)
    VALUES ($1, $2, $3, $4);
    `
    let safValue =[title, authors, img , description]
    client.query(sql,safValue).then(()=>{
        res.redirect('/favorite')
    })
}

// ============================================================favoriteHandler
function favoriteHandler(req,res){

    let sql = `SELECT * FROM books1`
    client.query(sql).then((result)=>{
        console.log(result)
        res.render('favorite_page' ,{data : result.rows} )
    })
}
// ============================================================detailsHandler
function detailsHandler (req,res){
    console.log(req.params)
    let param = req.params.id
    let sql =`SELECT * FROM books1 WHERE id = $1`
    let safValue = [param]
    client.query(sql,safValue).then(results=>{
        res.render(`details_page` , {data : results.rows[0]})
    })
}
// ============================================================updateHandler
function updateHandler (req,res){
    let param = req.params.id
    let {title, authors, img , description} = req.body
    
    let sql =`UPDATE books1
    SET title = $1, authors = $2, img= $3,description=$4
    WHERE id = $5;
    `
    let safValue = [title, authors, img , description,param]
    client.query(sql,safValue).then(()=>{
        res.redirect(`/details/${param}`)
    })
}
// ============================================================deleteHandler
function deleteHandler (req,res){
    let param = req.params.id
    let sql =`DELETE FROM books1
    WHERE id = $1;
    `
    let safValue = [param]
    client.query(sql,safValue).then(()=>{
        res.redirect(`/favorite`)
    })

}

// ============================================================constroctor
function Book(val){
this.title = val.volumeInfo.title
this.authors = val.volumeInfo.authors
this.description = val.volumeInfo.description
this.img = val.volumeInfo.imageLinks.thumbnail

}
// ============================================================USES
function notFoundHandler(req,res){
    res.status(404).send('PAGE NOT FOUND')
}

function errorHandler(err ,rq,res){
    res.status(500).send(err)

}