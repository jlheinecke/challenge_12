

const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
//const fs = require('fs');

const PORT = process.env.PORT || 3001;
const app = express();


app.use(express.urlencoded({ extended: false }));
app.use(express.json());


const connection = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'Cid7677!',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`),
  startApp()
);

function startApp() {
  inquirer
    .prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'View employees by manager',
        'View employees by department',
        'View the total utilized budget of a department',
        'Exit'
      ]
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'View employees by manager':
          viewEmployeesByManager();
          break;
        case 'View employees by department':
          viewEmployeesByDepartment();
          break;
        case 'View the total utilized budget of a department':
          viewDepartmentBudget();
          break;
        case 'Exit':
          connection.end();
          break;
        default:
          connection.end();
      }
    });
};

function viewAllDepartments() {
  connection.query('SELECT * FROM department', (err, departments) => {
    if (err) throw err;
    console.table(departments);
    startApp();
  });
}

function viewAllRoles() {
  connection.query('SELECT * FROM role', (err, roles) => {
    if (err) throw err;
    console.table(roles);
    startApp();
  });
}

function viewAllEmployees() {
  const query =
    'SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, CONCAT(m.first_name, " ", m.last_name) AS manager ' +
    'FROM employee e ' +
    'LEFT JOIN role ON e.role_id = role.id ' +
    'LEFT JOIN department ON role.department_id = department.id ' +
    'LEFT JOIN employee m ON e.manager_id = m.id';

  connection.query(query, (err, employees) => {
    if (err) throw err;
    console.table(employees);
    startApp();
  });
}

function addDepartment() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Enter the name of the new department:',
      },
    ])
    .then((answer) => {
      connection.query('INSERT INTO department SET ?', { name: answer.name }, (err) => {
        if (err) throw err;
        console.log('Department added successfully!');
        startApp();
      });
    });
}



function addRole() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the new role:',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for the new role:',
      },
      {
        type: 'input',
        name: 'department_id',
        message: 'Enter the department ID for the new role:',
      },
    ])
    .then((answer) => {
      connection.query(
        'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
        [answer.title, answer.salary, answer.department_id],
        (err) => {
          if (err) throw err;
          console.log('Role added successfully!');
          startApp();
        }
      );
    });
}

function addEmployee() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'first_name',
        message: "Enter the employee's first name:",
      },
      {
        type: 'input',
        name: 'last_name',
        message: "Enter the employee's last name:",
      },
      {
        type: 'input',
        name: 'role_id',
        message: "Enter the role ID for the employee's role:",
      },
      {
        type: 'input',
        name: 'manager_id',
        message: "Enter the manager ID for the employee's manager (leave empty if none):",
      },
    ])
    .then((answer) => {
      const employeeData = {
        first_name: answer.first_name,
        last_name: answer.last_name,
        role_id: answer.role_id,
      };

      if (answer.manager_id) {
        employeeData.manager_id = answer.manager_id;
      }

      connection.query('INSERT INTO employee SET ?', employeeData, (err) => {
        if (err) throw err;
        console.log('Employee added successfully!');
        startApp();
      });
    });
}

function updateEmployeeRole() {

  connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS employee_name FROM employee', (err, employees) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: 'Select the employee you want to update:',
          choices: employees.map((employee) => ({
            name: employee.employee_name,
            value: employee.id,
          })),
        },
        {
          type: 'input',
          name: 'new_role_id',
          message: 'Enter the new role ID for the employee:',
        },
      ])
      .then((answer) => {
        connection.query(
          'UPDATE employee SET role_id = ? WHERE id = ?',
          [answer.new_role_id, answer.employee_id],
          (err) => {
            if (err) throw err;
            console.log('Employee role updated successfully!');
            startApp();
          }
        );
      });
  });
};

const updateEmployeeManager = () => {
  // Prompt user for employee and new manager details
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'employee_id',
        message: "Enter the employee's ID to update their manager:"
      },
      {
        type: 'input',
        name: 'new_manager_id',
        message: "Enter the new manager ID for the employee:"
      }
    ])
    .then((answers) => {
      connection.query(
        'UPDATE employee SET manager_id = ? WHERE id = ?',
        [answers.new_manager_id, answers.employee_id],
        (err) => {
          if (err) throw err;
          console.log('Employee manager updated successfully!');
          startApp();
        }
      );
    });
};

// Function to view employees by manager
const viewEmployeesByManager = () => {
  // Prompt user for manager's ID
  inquirer
    .prompt({
      type: 'input',
      name: 'manager_id',
      message: "Enter the manager's ID to view employees under them:"
    })
    .then((answer) => {
      connection.query(
        'SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager ' +
        'FROM employee e ' +
        'LEFT JOIN role r ON e.role_id = r.id ' +
        'LEFT JOIN department d ON r.department_id = d.id ' +
        'LEFT JOIN employee m ON e.manager_id = m.id ' +
        'WHERE e.manager_id = ?',
        [answer.manager_id],
        (err, results) => {
          if (err) throw err;
          console.table(results);
          startApp();
        }
      );
    });
};

// Function to view employees by department
const viewEmployeesByDepartment = () => {
  // Prompt user for department's ID
  inquirer
    .prompt({
      type: 'input',
      name: 'department_id',
      message: "Enter the department's ID to view employees in that department:"
    })
    .then((answer) => {
      connection.query(
        'SELECT e.id, e.first_name, e.last_name, r.title AS role, d.name AS department, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager ' +
        'FROM employee e ' +
        'LEFT JOIN role r ON e.role_id = r.id ' +
        'LEFT JOIN department d ON r.department_id = d.id ' +
        'LEFT JOIN employee m ON e.manager_id = m.id ' +
        'WHERE d.id = ?',
        [answer.department_id],
        (err, results) => {
          if (err) throw err;
          console.table(results);
          startApp();
        }
      );
    });
};

// Function to view total utilized budget of a department
const viewDepartmentBudget = () => {
  // Prompt user for department's ID
  inquirer
    .prompt({
      type: 'input',
      name: 'department_id',
      message: "Enter the department's ID to view the total utilized budget:"
    })
    .then((answer) => {
      connection.query(
        'SELECT d.name AS department, SUM(r.salary) AS total_budget ' +
        'FROM employee e ' +
        'LEFT JOIN role r ON e.role_id = r.id ' +
        'LEFT JOIN department d ON r.department_id = d.id ' +
        'WHERE d.id = ?',
        [answer.department_id],
        (err, results) => {
          if (err) throw err;
          console.table(results);
          startApp();
        }
      );
    });
};
