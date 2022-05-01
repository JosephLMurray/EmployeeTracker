const express = require("express");

const db = require("./db/connection");

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: "root",
    password: "5UpP0rRt",
    database: "employees_db",
  },
  console.log(`Connected to the employees_db database.`)
);
