const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();
app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// mongoose
var uri = process.env.MONGO_URI;
mongoose.connect(uri, {useNewUrlParser: true});

// items schema
const itemsSchema = {
  name: String
};
// items model
const Item = mongoose.model("item", itemsSchema);
// default items
const item1 = new Item({
  name: "Eat"
});
const item2 = new Item({
  name: "Drink"
});
const item3 = new Item({
  name: "Fight"
});
const defaultItems = [item1, item2, item3];

// custom list shchema
const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("list", listSchema);

// homepage rule items
let ruleItems = [
  {
    name: "You can create your own personal to-do list!"
  },
  {
    name: "Hit + to add new items"
  },
  {
    name: "<--Hit this to delete the items"
  }
]


app.get("/", function (req, res) {
  // Item.find({}, function (err, foundItems) {

  //   if (foundItems.length === 0) {
  //     console.log("in here");
  //     Item.insertMany(defaultItems, function (err) {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         console.log("Successfully inserted items");
  //       }
  //     });
  //     res.redirect("/");
  //   } else {
  //     res.render("list", { listTitle: "Today", items: foundItems });
  //   }
  // });
  List.find({}, function(err, foundItems){
    if(err){
      console.log(err);
    }else if (foundItems.length === 0){
      console.log("no lists yet");
      res.render("home", { items: ruleItems, lists:  []});
    }else{
      res.render("home", { items: ruleItems, lists:  foundItems});
    }
  })
});

app.post("/", function (req, res) {
  const listName = req.body.newList;
  res.redirect("/lists/"+listName);
})

app.post("/deleteCard", function(req,res){
  const listId = req.body.cardId;
  List.deleteOne({_id:listId}, function(err){
    
    if(err){
      console.log(err);
    }else{
      console.log("successfully removed");
    }
  });
  res.redirect("/");
})

// app.post("/", function (req, res) {
//   const itemName = req.body.newItem;
//   const listName = req.body.listOrigin;
//   const newItem = new Item({
//     name: itemName
//   });

//   if (listName === "Today") {
//     newItem.save();
//     console.log("new item saved in Today");
//     res.redirect("/");
//   } else {
//     List.findOne({ name: listName }, function (err, foundList) {
//       if (err) {
//         console.log(err);
//       } else {
//         foundList.items.push(newItem);
//         foundList.save();
//         console.log("new item saved in " + listName);
//         res.redirect("/lists/" + listName);
//       }
//     });
//   }
// });

app.post("/delete", function (req, res) {
  const checkedId = req.body.checkbox;
  const listName = req.body.listName;

  // if (listName === "Today") {
  //   Item.findByIdAndRemove(checkedId, function (err) {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       console.log("successfully deleted");
  //       res.redirect("/");
  //     }
  //   });
  // } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedId } } }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/lists/" + listName);
      }
    });
  // }
});

app.get("/lists/:title", function (req, res) {
  const title = _.capitalize(req.params.title);

  List.findOne({ name: title }, function (err, results) {
    if (err) {
      console.log(err);
    } else {
      if (!results) {
        // create new list
        const list = new List({
          name: title,
          items: defaultItems
        });
        list.save();
        res.redirect("/lists/" + title);
      } else {
        res.render("list", { listTitle: title, items: results.items });
      }
    }
  });
});

app.post("/lists/:listTitle", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.listOrigin;
  const newItem = new Item({
    name: itemName
  });

  List.findOne({ name: listName }, function (err, foundList) {
    if (err) {
      console.log(err);
    } else {
      foundList.items.push(newItem);
      foundList.save();
      console.log("new item saved in " + listName);
      res.redirect("/lists/" + listName);
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server opened in port 3000");
});