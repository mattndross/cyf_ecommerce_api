const express = require("express");
const app = express();

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "cyf_eccomerce",
  password: "tute",
  port: 5432,
});

//endpoints

app.get("/customers", (req, res) => {
  pool.query("SELECT * from customers ", (error, result) => {
    res.json(result.rows);
  });
});

app.get("/suppliers", (req, res) => {
    pool.query("SELECT * from suppliers ", (error, result) => {
      res.json(result.rows);
    });
});

app.get("/products", (req, res) => {
    pool.query("select p.product_name , s.supplier_name from products p join suppliers s on p.supplier_id = s.id",
    (error, result) => {
        res.json(result.rows);
    })
})

app.listen(3000, () => {
  console.log("server listenin in port 3000");
});