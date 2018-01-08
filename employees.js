const express = require('express');
const employeesRouter = express.Router({mergeParams: true});
const timesheetsRouter = require('./timesheets.js');

const bodyParser = require('body-parser');
employeesRouter.use(bodyParser.json());

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


//employee id parameter set for timesheets and employee endpoint. Ensures that employee id exists in database or responds with 404

employeesRouter.param('employeeId', (req, res, next, employeeId) => {
    console.log('checking emp parameters');
  const sql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
  const values = {$employeeId: employeeId};
  db.get(sql, values, (error, employee) => {
    if (error) {
      next(error);
    } else if (!employee) {
      res.sendStatus(404);
    } else {
      req.employee = employee;
      next();
    }
  });
});

//sets the router for the parameter and router for the timesheets endpoint to use

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);


//returns all employees in the database where their current employment status is 1

employeesRouter.get('/', (req, res) => {
    db.all('select * from Employee where is_current_employee = 1', (err, rows) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.send({employees: rows});
        }
    });
});

// returns a individual employee from the database based on the id provided. If id not found 404 returned.

employeesRouter.get('/:id', (req, res, next) => {
    db.get(`select * from Employee where id = $id`, {$id: req.params.id}, (err, row) => {
        //console.log(req);
        if (!row) {
            console.log(err);
            console.log(row);
            res.sendStatus(404);
        } else {
            res.send({employee: row});
        }
    });
});

//validates that all data required for adding and updating a employee is included in the payload. Returns 400 if not.


const validateEmployee = (req, res, next) => {
  const employeeToCreate = req.body.employee;
  console.log(employeeToCreate);
  if (!employeeToCreate.name || !employeeToCreate.position || !employeeToCreate.wage) {
    return res.sendStatus(400);
  }
  next();
}

//adds a new employee to the database.

employeesRouter.post('/',validateEmployee,  (req, res, next) => {    
    console.log(req.body.employee);
    db.run(`INSERT INTO Employee(name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $is_current_employee)`, 
    { $name: req.body.employee.name, $position: req.body.employee.position, $wage: req.body.employee.wage, $is_current_employee: 1}, function (error) {
        if (error) {
            //console.log(error);
            return res.sendStatus(500);
        }   

            // returns the new employee as the response 
        db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (err, row) => {
      if (!row) {
          //console.log(err);
        return res.sendStatus(500);
      }
      res.status(201).send({employee: row});
    });



    })

})


employeesRouter.put('/:id', validateEmployee, (req, res, next) => {

    const employeeToUpdate = req.body.employee;
    //console.log(artistToUpdate);
    //console.log("this is params " + req.params.id);
    db.run(`UPDATE Employee SET name=$name, position=$position, wage=$wage, is_current_employee=$is_current_employee where id=${req.params.id}`,
    {$name:req.body.employee.name, $position: req.body.employee.position, $wage:req.body.employee.wage, $is_current_employee:1}), function (error, row) {
        console.log(row);
        if (error) {
            console.log('this is error ' + error);
            res.sendStatus(500);
        }

    }
        db.get(`SELECT * from Employee where id = $id`, {$id: req.params.id}, (error, row) => {
            if(!row) {
                next(error);
                return res.sendStatus(500);
            } else {
            //console.log(row);
            res.status(200).send({employee: row});
            }
        })

    });



employeesRouter.delete('/:id', (req, res, next) => {

 const employeeToDelete = req.params.id;
    //console.log(artistToUpdate);
    //console.log("this is params " + req.params.id);
    db.run(`UPDATE Employee SET is_current_employee = 0 where id=${req.params.id}`), function (error, row) {
        console.log(row);
        if (error) {
            next(error);
            console.log('this is error ' + error);
            res.sendStatus(500);
        }

    }
        db.get(`SELECT * from Employee where id = $id`, {$id: req.params.id}, (error, row) => {
            if(!row) {
                return res.sendStatus(500);
            }
            //console.log(row);
            res.status(200).send({employee: row});
        })

    });



module.exports = employeesRouter;