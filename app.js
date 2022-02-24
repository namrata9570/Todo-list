const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");
const app = express();

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-namrata:test123@cluster0.xibgg.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to Todo list"
});

const item2 = new Item ({
  name: "Hit the  + button to add a new line"
});

const item3 = new Item ({
  name: "<--- Git this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {
// const day = date.getDate();
Item.find({}, function(err, foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully added items in List")
      }
    });
    res.redirect("/");
  }
  else{
    res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });
  }

});

});

app.get("/:customeListName", function(req, res){
  const customeListName = _.capitalize(req.params.customeListName);

  List.findOne({name: customeListName}, function(err, foundList){
    if(!err){
      if (!foundList){
        const list = new List({
          name:customeListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+ customeListName);
      } else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

})

app.post("/", function(req, res) {
  const itemName = req.body.newitem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  // console.log(req.body);
  // if(req.body.list === "Work"){
  //   workItems.push(item);
  //   res.redirect("/work")
  // } else{
  //   items.push(item);
  //   // res.render("list", {newListItem: item});
  //   res.redirect("/");
  // }
});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID, function(err){
      if (!err){
        console.log("Successfully deleted");
        res.redirect("/");
      }
    });
  } else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

});

app.get("/work", function(req, res){
  res.render("list",{listTitle:"Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
// app.post("/work", function(req, res){
//   let item = req.body.newItem;
//   workItems.push(item);
//   res.redirect("/work");
// });

// var currentDay = today.getDay();
// var day ="";

// if(currentDay === 6 || currentDay === 0){
//   // res.send("<h1>Yay its a weekend!!!!!</h1>");
//   day = "Weekend";
//   // res.write("<h1>Yay its a weekend!!!!!</h1>");
// }
// else{
//   // res.send("Boo! I have to work!");
//
//   // res.write("<h1>Boo! I have to work!</h1>");
//   // res.write("<h2>Boo! I have to work!</h2>");
//   // res.send();
//   day = "Weekday";
//   // res.sendFile(__dirname + "/index.html");
// }
// res.render("list", {kindOfDay: day});


// switch(currentDay){
//   case 0:
//     day = "Sunday";
//
//   case 1:
//     day = "Monday";
//
//   case 2:
//     day = "Tueday";
//
//   case 3:
//     day = "Wednesday";
//
//   case 4:
//     day = "Thursday";
//   case 5:
//     day = "Friday";
//
//   case 6:
//     day = "Saturday";
// }
// res.render("list", {kindOfDay: day});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
// app.listen(port);

app.listen(port, function() {
  console.log("server has statrted successfully");
});
