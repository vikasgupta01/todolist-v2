const express = require("express");
const bodyParser = require("body-parser");
// 1. require mongoose after running 'npm i mongoose'
const mongoose = require("mongoose");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


// 2. Create new database inside mongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });

// 3. Create a new Schema (items-schema)
const itemsSchema = new mongoose.Schema({
    name: String
});

const Item = new mongoose.model("Item", itemsSchema);

// 4. Creating some default items using our Item mongoose model, and insert them to our collection.
const item1 = new Item({
    name: "Welcome to your todolist"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

// // we would move this section to root route instead with if-else statement to ensure it gets executed only once.
// Item.insertMany(defaultItems, function(err) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("Default items inserted successfully!");
//     }
// });


app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (err) {
            console.log(err);
        } else {
            if (foundItems.length === 0) {
                Item.insertMany(defaultItems, function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Default items inserted successfully!");
                    }
                });
                res.redirect("/");
            } else {
                res.render("list", { listTitle: "Today", newListItems: foundItems });
            }
        }
    });

});


app.post("/", function (req, res) {

    // save the posted item to a variable, create a new item using our pre-existing model, 
    // and save it to mongoDB database using save method of mongoose.
    // then redierct back to home route to render the new updated list.

    const itemName = req.body.newItem;

    const newItem = new Item({
        name: itemName
    });

    newItem.save();
    res.redirect("/");

    // // add that item to our array items and redirect to required route.
    // if (req.body.list === "Work") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);
    //     res.redirect("/");
    // }
});


app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newListItems: workItems });
})

app.post("/work", function (req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

app.get("/about", function (req, res) {
    res.render("about");
})


// listen on port 3000 and console log that our server has been started.
app.listen(3000, function () {
    console.log("Server started on port 3000");
});
