const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


// timesheetsRouter.param('id', (req, res, next, id) => {
//   console.log('doing name validations on ' + id);
//   db.get('Select * from Employee where id = $id', {$id: id}, (error, timesheet) => {
//     if (!timesheet) {
//       return res.sendStatus(404)
//     } else {
//       next();
//     }
//   });
// });

timesheetsRouter.get('/', (req, res, next) => {
  const timesheet = req.timesheet;
  db.all(`select * from Timesheet where employee_id = $id`, {$id: req.employee.id}, (error, rows) => {
      //console.log('executed sql');
      //console.log(rows);
    if (!rows) {
      console.log('triggered');
        //console.log('this is error ' + error);
        res.sendStatus(404);
      //next();
    } else {
      //console.log(rows + ' This is rows');
      res.status(200).json({timesheets: rows});
    }
  });
});


const validateTimesheet = (req, res, next) => {
    //console.log('this is menu ' + req.body);
  if (!req.body.timesheet.hours || !req.body.timesheet.rate || !req.body.timesheet.date) {
    return res.sendStatus(400);
  }
  next();
}




  timesheetsRouter.post('/', validateTimesheet, (req, res, next) => {    
    //console.log('this is mmenu post body ' + req.body.menu.title);
    db.run(`INSERT INTO Timesheet(hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employee_id)`, 
    { $hours: req.body.timesheet.hours, $rate: req.body.timesheet.rate, $date: req.body.timesheet.date, $employee_id:req.employee.id}, function (error) {
        if (error) {
            ('error with sql  ' + console.log(error));
            return res.sendStatus(500);
        }   

        db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (err, row) => {
      if (err) {
          //console.log(err);
        return res.sendStatus(500);
      } else {
       res.status(201).json({timesheet: row});
      }
  });
    })
})

timesheetsRouter.put('/:id', validateTimesheet, (req, res, next) => {

    const timesheetToUpdate = req.body.employee;
    //console.log(artistToUpdate);
    //console.log("this is params " + req.params.id);
    db.run(`UPDATE Timesheet SET hours=$hours, rate=$rate, date=$date where id=${req.params.id}`,
    {$hours:req.body.timesheet.hours, $rate: req.body.timesheet.rate, $date:req.body.timesheet.date}), function (error, row) {
        console.log(row);
        if (error) {
            console.log('this is error ' + error);
            return res.status(404).send();
        }
    }
        db.get(`SELECT * from Timesheet where id = $id`, {$id: req.params.id}, (error, row) => {
            if(!row) {
                return res.sendStatus(500);
            }
            //console.log(row);
            res.status(200).send({timesheet: row});
        })

    });

timesheetsRouter.delete('/:id', (req, res, next) => {

    db.run(`DELETE FROM Timesheet WHERE id = ${req.params.id}`), function (error, row) {
        console.log(row);
        if (error) {
            console.log('this is error ' + error);
            next(error);

        } else {
          res.sendStatus(204);
        }

    }
    });



module.exports = timesheetsRouter;