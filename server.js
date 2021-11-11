const { query } = require("express");
const express = require("express");
const app = express();
const bodyParser = require("body-parser")
app.use(bodyParser.json())
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
  const productName = req.query.name;
  let query =
    "select p.product_name , s.supplier_name from products p join suppliers s on p.supplier_id = s.id";
  if (productName) {
    query =
      query +
      ` where upper(p.product_name) like upper('%${productName}%') order by p.product_name`;
  }
  pool.query(query, (error, result) => {
    res.json(result.rows);
  });
});

app.get("/customers/:customerId", (req, res) => {
  const customerId = req.params.customerId;
  pool
    .query("SELECT * FROM customers WHERE id = $1", [customerId])
    .then((result) => res.json(result.rows))
    .catch((e) => console.log(e));
});


app.post("/customers/", (req, res) => {
 
  const customerAddress = req.body.address;
  const customerName = req.body.name;
  const customerCity = req.body.city;
  const customerCountry = req.body.country;

  if (customerName && customerAddress && customerCity && customerCountry) {
    pool
      .query(
        "insert into customers (name, address, city, country) values" +
          `('${customerName}','${customerAddress}', '${customerCity}', '${customerCountry}')`
      )
      .then(() => {
        pool
        .query("select * from customers where name ="+ `'${customerName}'`)
        .then((result) => res.json(result.rows))
        .catch(e=>res.send(e));
      })
      .catch((e) => res.send(e));
  } else {
    res.send("all fields should be valid")
  }
});

app.listen(3000, () => {
  console.log("server listenin in port 3000");
});
