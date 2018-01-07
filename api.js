const express = require('express');
const apiRouter = express.Router();
const employeesRouter = require('./employees.js');
const menuRouter = require('./menu.js');


apiRouter.use('/employees', employeesRouter);
apiRouter.use('/menus', menuRouter);

// const seriesRouter = require('./series.js');
// apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;