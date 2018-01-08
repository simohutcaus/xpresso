const express = require('express');
const menusRouter = express.Router({mergeParams: true});
const bodyParser = require('body-parser');
menusRouter.use(bodyParser.json());
const menuItemRouter = require('./MenuItem.js');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');



//sets the menuid parameter for the menuItem router and also ensures the menu id exists in the database

menusRouter.param('menuid', (req, res, next, menuid) => {
    console.log('checking menu parameters');
  const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuid';
  const values = {$menuid: menuid};
  db.get(sql, values, (error, menu) => {
    if (error) {
      next(error);
    } else if (!menu) {
      res.sendStatus(404);
    } else {
      req.menu = menu;
      next();
    }
  });
});

//sets the route paramater to be used with the menu-items router and the router

menusRouter.use('/:menuid/menu-items', menuItemRouter);


// returns all menus from the database

menusRouter.get('/', (req, res) => {
    db.all('select * from Menu', (err, rows) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        } else {
            res.send({menus: rows});
        }
    });
});

// returns a individual menu from the database based on the id provided in the route.

menusRouter.get('/:id', (req, res, next) => {
    db.get(`select * from Menu where id = $id`, {$id: req.params.id}, (err, row) => {
        //console.log(req);
        if (!row) {
            console.log(err);
            console.log(row);
            res.sendStatus(404);
        } else {
            res.send({menu: row});
        }
    });
});

//validates that the data required to add or update a menu is included in the payload 

const validateMenu = (req, res, next) => {
    //console.log('this is menu ' + req.body);
  if (!req.body.menu.title) {
    return res.sendStatus(400);
  }
  next();
}

//adds a new menu to the database.


menusRouter.post('/', validateMenu, (req, res, next) => {    
    //console.log('this is mmenu post body ' + req.body.menu.title);
    db.run(`INSERT INTO Menu(title) VALUES ($title)`, 
    { $title: req.body.menu.title}, function (error) {
        if (error) {
            //console.log(error);
            return res.sendStatus(500);
        }   


        //after adding the menu to the database returns the new menu

        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (err, row) => {
      if (!row) {
          //console.log(err);
        return res.sendStatus(500);
      }
       res.status(201).json({menu: row});
    });
    })
})

//updates a existing menu in the database


menusRouter.put('/:id', validateMenu, (req, res, next) => {

    const menuToUpdate = req.body.menu;
    //console.log(menuToUpdate);
    //console.log(artistToUpdate);
    //console.log("this is params " + req.params.id);
    db.run(`UPDATE Menu SET title=$title where id=${req.params.id}`,
    {$title:req.body.menu.title}), function (error, row) {
        console.log(row);
        if (error) {
            console.log('this is error ' + error);
            res.sendStatus(500);
        }

        //after the menu is updated, it is returned.

    }
        db.get(`SELECT * from Menu where id = $id`, {$id: req.params.id}, (error, row) => {
            if(!row) {
                return res.sendStatus(500);
            }
            //console.log(row);
            res.status(200).send({menu: row});
        })

    });


//deletes a menu where no menu items exist against the menu. If menu items exist, a 400 response is returned

menusRouter.delete('/:id', (req, res, next) => {
  const menuSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuid';
  console.log(req.params.id + ' this is req id');
  const menuValues = {$menuid: req.params.id};
  console.log(menuValues + ' This is menu values'); 
  db.get(`Select * from MenuItem WHERE MenuItem.menu_id = ${req.params.id}`, (error, menu) => {
    if (error) {
        console.log(error);
      next(error);
    } else if (menu) {
        console.log('elseifmenu 400');
      res.sendStatus(400);
    } else {
      const deleteSql = 'DELETE FROM Menu WHERE id = $menuid';
      const deleteValues = {$menuid: req.params.menuid};

      db.run('DELETE from Menu where id = $id', {$id: req.params.id}, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});




module.exports = menusRouter;