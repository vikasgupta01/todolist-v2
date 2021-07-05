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
                Item.insertMany(defaultItems, function (err) {
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

});


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    console.log(checkedItemId);

    // we can also use findOneAndDelete() here without getting deprecation warning. 
    // findOneAndDelete() will also return the deleted element in case we need it.
    Item.deleteOne({ _id: checkedItemId }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Item deleted successfully!");
        }
    });
    res.redirect("/");
});


// 5. Creating Custom lists using express route parameters

const listSchema = new mongoose.Schema(
    {
        name: String,
        items: [itemsSchema]
    }
)

const List = mongoose.model("List", listSchema);

app.get("/:customListName", function (req, res) {
    const customListName = req.params.customListName;

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                // create a new list
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });

                // list.save();
                // Using just this save method creates multiple objects (in my case 3) on 1st execution
                // This happens because JS doesn't wait for a line to finish before executing next lines.
                // So it redirects to this route even before save method has executed, creating multiple objects.

                // This can be dealt with in two ways. 
                // 1. Use setTimeOut() function and give list.save() some time to get executed. (But this will make website slow)
                // list.save();
                // setTimeout(() => { res.redirect('/' + customListName);}, 100);

                // 2. Mongoose's save method takes a callback function. So using it will do the trick in a cleaner way.
                list.save(() => res.redirect('/' + customListName));

                // res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

    // res.render("list", { listTitle: "Work List", newListItems: workItems });
});


// listen on port 3000 and console log that our server has been started.
app.listen(3000, function () {
    console.log("Server started on port 3000");
});
