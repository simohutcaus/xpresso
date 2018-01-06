const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employees.js');


apiRouter.use('/employees', employeesRouter);

// const seriesRouter = require('./series.js');
// apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;