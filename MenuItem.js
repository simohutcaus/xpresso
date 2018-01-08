const express = require('express');
const menuItemRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.param('id', (req, res, next, id) => {
  console.log('checking menuitemid');
  const menuItemId = Number(id);
  db.get('SELECT * FROM MenuItem WHERE id = $id', { $id : menuItemId },
    (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
        req.menuItem = menuItem;
        next();
      } else {
        res.status(404).send()
      }
    });
});


menuItemRouter.get('/', (req, res, next) => {
    const menu = req.menu;
    console.log(req.params.id);
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


const validateMenuItem= (req, res, next) => {
    //console.log('this is menu ' + req.body);
  if (!req.body.menuItem.name || !req.body.menuItem.inventory || req.body.menuItem.price || !req.params.id) {
    return res.sendStatus(400);
  }
  next();
}

const validateMenuItem2= (req, res, next) => {
  //console.log('this is menu ' + req.body);
if (!req.body.menuItem.name || !req.body.menuItem.inventory || !req.body.menuItem.price) {
  console.log('triggered validation');
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

        db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, (err, row) => {
      if (error) {
          //console.log(err);
        next(error)
      }
      res.status(201).send({menuItem: row});
    });
    })

});

menuItemRouter.put('/:id', (req, res, next) => {
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
          
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.id}`,
            (error, issue) => {
              res.status(200).json({issue: issue});
            });
        }
      });
    });





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