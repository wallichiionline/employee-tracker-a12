const inquirer = require('inquirer');
const {Client} = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'Codeedoc99$',
    database: 'employee-tracker-a12',
    port: 5432,
});

client.connect();

const mainMenu = () => {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Exit'
        ]
    }).then(answer => {
        switch (answer.action){
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all rolls':
                break;
            case 'View all employees':
                break;
            case 'Add a department':
                break;
            case 'Add a role':
                break;
            case 'Add an employee':
                break;
            case 'Update an employee role':
                break;
            case 'Exit':
                client.end();
                break;
        }
    })
}