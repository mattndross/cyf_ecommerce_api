const { query } = require("express");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());
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
          .query("select * from customers where name =" + `'${customerName}'`)
          .then((result) => res.json(result.rows))
          .catch((e) => res.send(e));
      })
      .catch((e) => res.send(e));
  } else {
    res.send("all fields should be valid");
  }
});

app.post("/products", (req, res) => {
  const productName = req.body.name;
  const productPrice = req.body.price;
  const productSupplierId = req.body.supplier;

  if (productName && productSupplierId && productPrice > 0) {
    pool
      .query(`select * from suppliers s where id= ${productSupplierId}`)
      .then(() => {
        pool
          .query(
            `insert into products (product_name, unit_price, supplier_id) values ('${productName}', ${productPrice}, ${productSupplierId})`
          )
          .then(() => res.send("product created"))
          .catch((e) => {
            console.log(e);
            res.send(e);
          });
      })
      .catch((e) => {
        console.log(e);
        res.send(e);
      });
  } else {
    res.send("all fields must have a valid input");
  }
});

app.post("/customers/:customerId/orders", (req, res) => {
  const customerId = req.params.customerId;
  const orderDate = req.body.date;
  const orderReference = req.body.reference;

  if (orderDate && orderReference) {
    pool
      .query("select * from customers where id = $1", [customerId])
      .then(() => {
        pool
          .query(
            `insert into orders (order_date, order_reference, customer_id) values ('${orderDate}','${orderReference}',${customerId})`
          )
          .then(() => {
            res.send("order created");
          })
          .catch((e) => {
            console.log(e);
            res.send(e);
          });
      })
      .catch((e) => {
        console.log(e);
        res.send(e);
      });
  } else {
    res.send("all inputs should be valid")
  }
});

app.post("customers/:customerId", (req, res) => {
  console.log("ha entrado");
  const customerId = req.params.customerId;
  const customerAddress = req.body.address;
  const customerName = req.body.name;
  const customerCity = req.body.city;
  const customerCountry = req.body.country;


  pool
    .query("select * from customers where id = $1", [customerId])
    .then(() => {
      if (customerAddress && customerCity && customerCountry && customerName) {
        pool
          .query(
            `update customers set name='${customerName}',address='${customerAddress}', city='${customerCity}', country = '${customerCountry}' where id=${customerId}`
          )
          .then((result) => {
            res.json(result.rows);
          })
          .catch((e) => {
            console.log(e);
            res.send(e);
          });
      }
    })
    .catch((e) => {
      console.log(e);
      res.send(e);
    });
});

app.delete("/orders/:orderId", (req, res)=>{
  const orderId = req.params.orderId;

  pool
  .query("select * from orders where id = $1", [orderId])
  .then((result)=>{
    console.log("first check")
    if(result.rows){
      pool
      .query(`delete from order_items where order_id = ${orderId}`)
      .then(()=>{
        console.log("second check")
        pool
        .query(`delete from orders where id=${orderId}`)
        .then(()=>{res.send("order deleted")})
        .catch((e)=>{
          console.log(e);
          res.send(e);
      });
      })
      .catch((e)=>{
        console.log(e);
        res.send(e);
    });
    }
  })
  .catch((e)=>{
    console.log(e);
    res.send(e);
});
}); 

app.delete("/customers/:customerId", (req, res)=>{
  const customerId = req.params.customerId;
  pool
  .query("select * from orders where customer_id = $1", [customerId])
  .then((result)=>{
    if(result.rows.length > 0) {
      res.json(result.rows)
    } else {
      pool
      .query("delete from customers where id=$1", [customerId])
      .then(res.send("customer deleted"))
      .catch((e)=>{
        console.log(e);
        res.send(e);
    });
    }
  })
  .catch((e)=>{
    console.log(e);
    res.send(e);
});
})

app.get("/customers/:customerId/orders", (req,res)=>{
  const customerId = req.params.customerId;

  pool
  .query("select o.order_reference, o.order_date, p.product_name, p.unit_price, s.supplier_name, oi.quantity from suppliers s join products p on s.id = p.supplier_id join order_items oi on oi.product_id = p.id join orders o on oi.order_id = o.id join customers c on c.id = o.customer_id  where c.id = $1", [customerId])
  .then(result=>res.json(result.rows))
  .catch(e=>{
    console.log(e);
    res.send(e);
  })
})

app.listen(3000, () => {
  console.log("server listenin in port 3000");
});
