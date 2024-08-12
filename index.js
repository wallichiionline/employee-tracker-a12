const inquirer = require('inquirer');
const {Client} = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'Codeedoc99$',
    database: 'employee_tracker',
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
            'Seed Database',
            'Exit'
        ]
    }).then(answer => {
        switch (answer.action){
            case 'View all departments':
                viewDepartments();
                break;
            case 'View all roles':
                viewRoles();
                break;
            case 'View all employees':
                viewEmployees();
                break;
            case 'Add a department':
                break;
            case 'Add a role':
                break;
            case 'Add an employee':
                break;
            case 'Update an employee role':
                break;
            case 'Seed Database':
                seedDatabase();
                break;
            case 'Exit':
                client.end();
                break;
        }
    })
}

const viewDepartments = () => {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

const viewRoles = () => {
    const query = `SELECT role.id, role.title, role.salary, department.name AS department
                    FROM role INNER JOIN
                    department ON role.department_id = department.id`;

    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

const viewEmployees = () => {
    client.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

function seedDatabase() {
    client.query('DELETE FROM employee');
    client.query('DELETE FROM role');
    client.query('DELETE FROM department');

    let inputs = ['Accounting', 'IT', 'HR', 'Sales', 'Marketing' ];
    inputs.forEach((i) => {
        client.query('INSERT INTO department (name) VALUES ($1)', [i]);
    });
    let depts;
    let roles;
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        depts = res.rows;
        //console.table(res.rows);
        let r = ['Manager', 'Clerk', 'Cashier', 'Associate'];
        depts.forEach((i) => {
            r.forEach((r) => {
                client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [r, 5000, i.id]);
            });
        });

        client.query('SELECT id FROM role', (err, res) => {
            if (err) throw err;
            roles = res.rows;
            
            let employee = [
                {
                    firstname: "Carmen",
                    lastname: "Sandeigo",
                    role: roles[0].id
                },
                {
                    firstname: "Bob",
                    lastname: "Barker",
                    role: roles[5].id
                },
                {
                    firstname: "Drew",
                    lastname: "Carry",
                    role: roles[10].id
                },
                {
                    firstname: "Sonic",
                    lastname: "Hedgehog",
                    role: roles[15].id
                }
            ];
            employee.forEach((e) => {
                client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [e.firstname, e.lastname, e.role, e.manager]);
            });

            mainMenu();
            
        });
    });
}
mainMenu();