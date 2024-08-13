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
                addDepartment();
                break;
            case 'Add a role':
                addRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateRole();
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
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name AS department,
                    CONCAT(manager.first_name, ' ', manager.last_name) AS manager
                    FROM employee INNER JOIN
                    role ON employee.role_id = role.id INNER JOIN
                    department ON role.department_id = department.id LEFT JOIN
                    employee manager ON employee.manager_id = manager.id`;
            
    client.query(query, (err, res) => {
        if (err) throw err;
        console.table(res.rows);
        mainMenu();
    });
};

const addDepartment = () => {
    inquirer.prompt({
        name: 'name',
        type: 'input',
        message: 'add department here'
    }).then(answer => {
        client.query('INSERT INTO department (name) VALUES ($1)', [answer.name], (err, res) => {
            if (err) throw err;
            console.log(`Department ${answer.name} added`);
            mainMenu();
        });
    });
}

const addRole = () => {
    client.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        const departments = res.rows.map(d => ({
            name: d.name,
            value: d.id
        }));
       inquirer.prompt([
           {
               name: 'title',
               type: 'input',
               message: 'Enter title:'
            },
            {
                name: 'salary',
                type: 'number',
                message: 'Enter salary:'
            },
            {
                name: 'department_id',
                type: 'list',
                message: 'Select department:',
                choices: departments
            }
        ]).then(answer => {
            client.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [answer.title, answer.salary, answer.department_id], (err, res) => {
                if (err) throw err;
                console.log(`Role ${answer.title} added`);
                mainMenu();
            });
        });        
    });
};

const addEmployee = () => {
    const query = `SELECT role.id, role.title, role.salary, department.name AS department
                   FROM role
                   JOIN department ON role.department_id = department.id`;
    client.query(query, (err, res) => {
        if (err) throw err;
        const roles = res.rows.map(d => ({
            name: `${d.title} - ${d.department}`,
            value: d.id
        }));
        client.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            const employees = res.rows.map(e => ({
                name: `${e.first_name} ${e.last_name}`,
                value: e.id
        }));
        employees.push({ name: 'None', value: 0 });
       inquirer.prompt([
           {
               name: 'first_name',
               type: 'input',
               message: 'Enter first name:'
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'Enter last name:'
            },
            {
                name: 'role_id',
                type: 'list',
                message: 'Select role:',
                choices: roles
            },
            {
                name: 'manager_id',
                type: 'list',
                message: 'Select manager:',
                choices: employees
            }
        ]).then(answer => {
            client.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [answer.first_name, answer.last_name, answer.role_id, answer.manager_id], (err, res) => {
                if (err) throw err;
                console.log(`Employee ${answer.first_name} ${answer.last_name} added`);
                mainMenu();
            });
        });        
    });
});
};

const updateRole = () => {
    const query = `SELECT role.id, role.title, role.salary, department.name AS department
                   FROM role
                   JOIN department ON role.department_id = department.id`;
    client.query(query, (err, res) => {
        if (err) throw err;
        const roles = res.rows.map(d => ({
            name: `${d.title} - ${d.department}`,
            value: d.id
        }));
        client.query('SELECT * FROM employee', (err, res) => {
            if (err) throw err;
            const employees = res.rows.map(e => ({
                name: `${e.first_name} ${e.last_name}`,
                value: e.id
        }));
       inquirer.prompt([
           {
               name: 'employee_id',
               type: 'list',
               message: 'Select employee:',
               choices: employees
            },
            {
                name: 'role_id',
                type: 'list',
                message: 'Select role:',
                choices: roles
            }
        ]).then(answer => {
            client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [answer.role_id, answer.employee_id], (err, res) => {
                if (err) throw err;
                console.log(`Employee role updated`);
                mainMenu();
            });
        });        
    });
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