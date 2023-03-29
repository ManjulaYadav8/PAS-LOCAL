//REST API demo in Node.js
const express = require("express"); // requre the express framework
const fs = require("fs"); //require file system object
const cors = require("cors");
const multer = require('multer');
const bodyParser = require('body-parser');
const axios = require('axios');

// const fetch = require('node-fetch');

require("dotenv").config();


const loginpage=require("./src/routes/login");
const orderspage=require("./src/routes/orders");
const customerspage=require("./src/routes/customers");
const itemspage=require("./src/routes/items");




const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization, userName, customparams, token, x-access-token"
  );
  next();
});



app.use("/", loginpage);
// app.use("/orders",orderspage);
app.use("/items",itemspage);
// app.use("/customers",customerspage);



const PATH = './uploads';
let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
let upload = multer({
  storage: storage
});

app.post('/api/upload', upload.single('file'), function (req, res) {
  if (!req.file) {
    console.log("No file is available!");
    return res.send({
      success: false
    });
  } else {
    console.log('File is available!');
    return res.send({
      success: true
    })
  }
});



app.post("/receipt", async function(req,res){
  let body_data=req.body;
  let options = {
    method: 'post',
    url: " https://www.feldspartech.in:8087/a4lextep/gencoursereceipt",
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": ["GET", "HEAD", "OPTIONS", "POST", "PUT"],
        "Access-Control-Allow-Headers": ["Origin", "Access-Control-Request-Method", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
      
    },
    data:JSON.stringify(body_data)   ,
   
   
};

try {
    const result = await axios(options);
    console.log(result);
    res.json(result.data);
}
catch (err) {
    console.log(err);
    res.json(err);
}


})

app.get("/doc", async function(req,res){
  // let body_data=req.body;
  let options = {
    method: 'get',
    url: " https://www.feldspartech.in:8086/downloaddocument?docname=Course package.pdf&clientId=00005&authkey=teu9845liwskjlkiu40kieri65ke6t",
    headers: {
        'Content-Type': 'application/pdf',
        'Access-Control-Allow-Origin': '*',
        "Access-Control-Allow-Methods": ["GET", "HEAD", "OPTIONS", "POST", "PUT"],
        "Access-Control-Allow-Headers": ["Origin", "Access-Control-Request-Method", "X-Requested-With", "Content-Type", "Accept", "Authorization"],
      
    },
   
   
   
};


try {
    const result = await axios(options);
    console.log(Buffer.from(result.data).toString("base64"));
    res.json(result.data);
}
catch (err) {
    console.log(err);
    res.json(err);
}


})





// app.use("/",(req,res)=>res.send("Welcome to Seabridge Tender Bidding Application"));

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
