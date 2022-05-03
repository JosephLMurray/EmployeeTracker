const inquirer = require("inquirer");
const { resolve } = require("path");

const db = require("../db/connection");
const { checkString, checkNum } = require("../helpers/validate");

const menuSwitch = (input) => {
  const choice = input.main;
  choice === "View all departments"
    ? viewDepts()
    : choice === "View all roles"
    ? viewRoles()
    : choice === "View all employees"
    ? viewEmployees()
    : choice === "Add a department"
    ? addDept()
    : choice === "Add a role"
    ? addRole()
    : choice === "Add an Employee"
    ? addEmployee()
    : choice === "Update an employee roll"
    ? updateEmployee()
    : process.exit();
};

const main = () => {
  primary().then((answers) => {
    menuSwitch(answers);
  });
};

const addDept = async () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "dept",
        message: "What is the new department's name?",
        validate: checkString,
        filter: (input) => {
          return input.trim();
        },
      },
    ])
    .then((results) => {
      const sql = `INSERT INTO department (name)
    VALUES (?)`;
      const params = [results.dept];
      db.query(sql, params, (err, result) => {
        if (err) {
          console.log(err);
        }
        if (result.affectedRows >= 0) {
          console.log(`\n${params} added to Departments\n`);
          main();
        }
      });
    });
};

const getQuery = async () => {
  return new Promise((resolve, reject) => {
    db.query(`SELECT id, name FROM department`, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const addRole = async () => {
  getDepts().then((result) => {
    const depts = result.map((result) => result.name);
    const rolePrompts = [
      {
        type: "input",
        name: "role",
        message: "What is the role's title?",
        validate: checkString,
        filter: (input) => {
          return input.trim();
        },
      },
      {
        type: "input",
        name: "salary",
        message: "What is their salary?",
        validate: checkNum,
        filter: (input) => {
          return isNaN(input) || input === "" ? "" : parseInt(input, 10);
        },
      },
      {
        type: "list",
        name: "department",
        message: "Which department are they in?",
        choices: depts,
      },
    ];
    inquirer.prompt(rolePrompts).then((answers) => {
      // GET DEPARTMENT_ID
      const deptID = result.filter((result) => {
        return result.name === answers.department;
      });
      //result is still available as an array of objects WITH id
      db.query(
        `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`,
        [answers.role, answers.salary, deptID[0].id],
        (err, result) => {
          if (err) {
            console.log(err);
          }
          if (result.affectedRows >= 0) {
            console.log(`\n${answers.role} added to Departments\n`);
            main();
          }
        }
      );
    });
  });
};

const addEmployee = async () => {
  const getEmployees = new Promise((resolve, reject) => {
    db.query(
      `SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name, employee.id, employee.last_name FROM employee`,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
  getEmployees.then((empResult) => {
    const managers = empResult.map((empResult) => empResult.name);
    const roles = new Promise((resolve, reject) => {
      db.query(
        `SELECT role.title, role.id FROM role GROUP by role.title`,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
    roles.then((roleResult) => {
      const titles = roleResult.map((roleResult) => roleResult.title);

      const empPrompts = [
        {
          type: "input",
          name: "fName",
          message: "What is the employee's first name?",
          validate: checkString,
          filter: (input) => {
            return input.trim();
          },
        },
        {
          type: "input",
          name: "lName",
          message: "What is the employee's last name?",
          validate: checkString,
          filter: (input) => {
            return input.trim();
          },
        },
        {
          type: "list",
          name: "role",
          message: "What is their role?",
          choices: titles,
        },
        {
          type: "list",
          name: "manager",
          message: "Who is their Manager?",
          choices: managers,
        },
      ];
      inquirer.prompt(empPrompts).then((answers) => {
        // GET DEPARTMENT_ID
        const roleID = roleResult.filter((roleResult) => {
          return roleResult.title === answers.role;
        });
        const managerID = empResult.filter((empResult) => {
          return empResult.name === answers.manager;
        });
        //result is still available as an array of objects WITH id
        db.query(
          `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`,
          [answers.fName, answers.lName, roleID[0].id, managerID[0].id],
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result.affectedRows >= 0) {
              console.log(
                `\n${answers.fName} ${answers.lName} added to Employees\n`
              );
              main();
            }
          }
        );
      });
    });
  });
};

const primary = async () => {
  const mainMenu = [
    {
      type: "list",
      name: "main",
      message: "What would you like to do?",
      choices: [
        "View all departments",
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
  return await inquirer.prompt(mainMenu);
};

const viewRoles = async () => {
  const roles = new Promise((resolve, reject) => {
    db.query(
      `SELECT role.title AS TITLE, role.id AS "Role ID", department.name AS Department, role.salary AS Salary FROM role LEFT JOIN department ON role.department_id = department.id`,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
  roles.then((result) => {
    console.table(result);
    console.log(`\n`);
    main();
  });
};

const viewDepts = () => {
  getDepts().then((result) => {
    result = result.reduce((acc, { id, ...x }) => {
      acc[id] = x;
      return acc;
    }, {});
    console.table(result);
    console.log(`\n`);
    main();
  });
};

const viewEmployees = async () => {
  const employees = new Promise((resolve, reject) => {
    db.query(
      `SELECT e.id AS 'Employee ID', CONCAT(e.last_name, ', ', e.first_name) AS Employee, role.title AS Title, department.name AS Departments, role.salary AS Salary, IFNULL(CONCAT(m.last_name, ', ', m.first_name), "") AS Manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id LEFT JOIN role ON role.id = e.role_id LEFT JOIN department ON department.id = role.department_id`,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
  employees.then((result) => {
    console.table(result);
    console.log(`\n`);
    main();
  });
};

const updateEmployee = async () => {
  const getEmployees = new Promise((resolve, reject) => {
    db.query(
      `SELECT CONCAT(employee.first_name, ' ', employee.last_name) AS name, employee.id, employee.last_name FROM employee`,
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });
  getEmployees.then((empResult) => {
    const empArray = empResult.map((empResult) => empResult.name);
    const roles = new Promise((resolve, reject) => {
      db.query(
        `SELECT role.title, role.id FROM role GROUP by role.title`,
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
    roles.then((roleResult) => {
      const titles = roleResult.map((roleResult) => roleResult.title);

      const updatePrompts = [
        {
          type: "list",
          name: "empName",
          message: "Which employee's role would you like to change?",
          choices: empArray,
        },
        {
          type: "list",
          name: "role",
          message: "What would you like to change their role to?",
          choices: titles,
        },
      ];
      inquirer.prompt(updatePrompts).then((answers) => {
        const roleID = roleResult.filter((roleResult) => {
          return roleResult.title === answers.role;
        });
        const empID = empResult.filter((empResult) => {
          return empResult.name === answers.empName;
        });
        db.query(
          `UPDATE employee SET role_id=${roleID[0].id} WHERE id=${empID[0].id}`,
          (err, result) => {
            if (err) {
              console.log(err);
            }
            if (result.affectedRows >= 0) {
              console.log(`\n${answers.empName} has been updated.\n`);
              main();
            }
          }
        );
      });
    });
  });
};

module.exports = {
  main,
};
