const inquirer = require("inquirer");

const db = require('../db/connection');
const { checkString, checkNum, checkEmail } = require("../helpers/validate");

const mainMenu = [
  {
    type: "list",
    name: "main",
    message: "What would you like to do?",
    choices: [
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an Employee",
      "Update an employee roll",
      "Quit",
    ],
  },
];

const addDept= () => {
  inquirer.prompt([
  {
    type: "input",
    name: "dept",
    message: "What is the new department's name?",
    validate: checkString,
    filter: (input) => {
      return input.trim();
    },
  }
]).then((results) =>{
  const sql = `INSERT INTO departments (name)
    VALUES (?)`;
  const params = [results.dept];
  db.query(sql, params, (err, result) => {
    (err) ? console.log(err) :
    console.log(`${params} added to Departments`);
  })
})
}
const a
const addRole = [
  {
    type: "input"
  }
]
