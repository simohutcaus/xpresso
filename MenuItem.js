const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


//sets the id parameter for the menuItemRouter and ensures that the menu items exist before proceeding with other tasks

menuItemRouter.param('id', (req, res, next, id) => {
  console.log('checking menuitemid ' + id);
  const menuItemId = Number(id);
  db.get('SELECT * FROM MenuItem WHERE id = $id', { $id : id},
    (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
        req.menuItem = menuItem;
        console.log('this is req.menuitem ' + req.menuitem);
        next();
      } else {
        res.status(404).send()
      }
    });
});


//returns all the menu items related to the menu id provided

menuItemRouter.get('/', (req, res, next) => {
    const menu = req.menu;
    console.log(req.params.menuid);
  db.all(`select * from MenuItem where menu_id = $id`, {$id: menu.id}, (error, rows) => {
      //console.log('executed sql');
      //console.log(rows);
    if (!rows) {
      console.log('triggered');
        //console.log('this is error ' + error);
        res.sendStatus(404);
      //next();
    } else {
       // menuitems = rows;
      //console.log(rows + ' This is rows');
      res.status(200).json({menuItems: rows});
    }
  });
});

//ensures all data required to add a new menu item is included in the payload

const validateMenuItem= (req, res, next) => {
   req.name = req.body.menuItem.name;
   req.description = req.body.menuItem.description;
   req.inventory = req.body.menuItem.inventory;
   req.price = req.body.menuItem.price;
   req.id = req.params.id;
    //console.log('this is menu ' + req.body);
  if (!req.name || !req.description || !req.price || !req.inventory) {
    return res.sendStatus(400);
  } else {
  next();
  }
}

//ensures all data required to update a menu item is included in the payload

const validateMenuItem2= (req, res, next) => {
  //console.log('this is menu ' + req.body);
if (!req.body.menuItem.name || !req.body.menuItem.inventory || !req.body.menuItem.price || !req.params.menuid) {
  console.log('triggered validation');
  return res.sendStatus(400);
}
next();
}

//adds a new item to a existing menu 

menuItemRouter.post('/', validateMenuItem, (req, res, next) => {
  console.log(req.body);
  console.log(req.params.menuid + ' this is menuitemid');
  db.run(`INSERT INTO MenuItem (name, description,
            inventory, price, menu_id)
          VALUES ($name, $description, $inventory, $price, $menu_id)`, {$name: req.body.menuItem.name, $description:req.body.menuItem.description, $inventory: req.body.menuItem.inventory, $price: req.body.menuItem.price, $menu_id: req.params.menuid},
    function(err, data) {
      if (err) {
        console.log('problem with insert');
        next(err);
      } else {
        db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
          (err, data) => {
            if (err) {
              next(err);
            } else {
              res.status(201).json({menuItem: data});
            }
        });
      }
  });
});

//updates a existing menu item.

menuItemRouter.put('/:id', validateMenuItem2, (req, res, next) => {
  console.log(req.body.menuItem);
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;

        if (!name || !description || !inventory || !price) {
          return res.sendStatus(400);
  }
      const sql = 'UPDATE MenuItem SET name = $name, description = $description, ' +
          'inventory= $inventory, price=$price ' +
          'WHERE MenuItem.id = $menuItemId';
      const values = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuItemId: req.params.id
      };

      db.run(sql, values, function(error) {
        if (error) {
          
          next(error);
        } else {
          console.log('dbget put triggered');
          console.log(req.params.menuid + 'this is menuid for dbrun in put');
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.id}`,
            (error, data) => {
              res.status(200).json({menuItem: data});
            });
        }
      });
    });



//deletes a existing menu item and provides a 204 response when complete.

menuItemRouter.delete('/:id', (req, res, next) => {
  db.run('DELETE from MenuItem where id = $id', {$id: req.params.id}, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
}
);




module.exports = menuItemRouter;