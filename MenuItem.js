const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');




menuItemRouter.get('/', (req, res, next) => {
    console.log(req.params.id);
  db.all(`select * from MenuItem where menu_id = $id`, {$id: req.params.id}, (error, rows) => {
      //console.log('executed sql');
      //console.log(rows);
    if (!rows) {
      console.log('triggered');
        //console.log('this is error ' + error);
        res.sendStatus(404);
      //next();
    } else {
        menuitems = rows;
      //console.log(rows + ' This is rows');
      res.status(200).json({menuItems: rows});
    }
  });
});


const validateMenuItem= (req, res, next) => {
    //console.log('this is menu ' + req.body);
  if (!req.body.menuItem.name || !req.body.menuItem.description || !req.body.menuItem.inventory || req.body.menuItem.price) {
    return res.sendStatus(400);
  }
  next();
}


menuItemRouter.post('/',validateMenuItem,  (req, res, next) => {    
    db.run(`INSERT INTO MenuItem(name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)`, 
    { $name: req.body.menuItem.name, $position: req.body.menuItem.description, $inventory: req.body.menuItem.inventory, $price: req.body.menuItem.price, $menu_id: req.params.id}, function (error) {
        if (error) {
            //console.log(error);
            return res.sendStatus(500);
        }   

        db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (err, row) => {
      if (!row) {
          //console.log(err);
        return res.sendStatus(500);
      }
      res.status(201).send({menuItem: row});
    });



    })

})

module.exports = menuItemRouter;