const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.get('/', (req, res, next) => {
  console.log('hit');
  //console.log(req);
  const sql = 'SELECT * FROM Timesheet WHERE employee_id = $id';
  const values = { $employeeId: req.params.id};
  //console.log(values);
  db.all(`select * from Timesheet where employee_id = $id`, {$id: req.params.id}, (error, rows) => {
      console.log('executed sql');
      console.log(rows);
    if (!rows) {
        console.log('this is error ' + error);
        res.sendStatus(404);
      //next();
    } else {
      res.status(200).json({timesheets: rows});
    }
  });
});

module.exports = timesheetsRouter;