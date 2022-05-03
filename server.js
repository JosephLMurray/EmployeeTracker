const express = require("express");

const { main } = require("./utils/prompts");

const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

main();
