const express = require("express");
const bodyParser = require("body-parser");

const _ = require('lodash');

// 1. require mongoose after running 'npm i mongoose'
const mongoose = require("mongoose");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));


// 2. Create new database inside mongoDB
mongoose.connect("mongodb+srv://vikasgupta01:EatKitkatPls@gettingstarted.g891c.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

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


// 5. Creating Custom lists using express route parameters

const listSchema = new mongoose.Schema(
    {
        name: String,
        items: [itemsSchema]
    }
)

const List = mongoose.model("List", listSchema);


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
                        // console.log("Default items inserted successfully!");
                    }
                });
                // res.redirect("/");
                setTimeout(() => { res.redirect('/');}, 20);
            } else {
                res.render("list", { listTitle: "Today", newListItems: foundItems });
            }
        }
    });

});


app.post("/", function (req, res) {

    // save the posted item to a variable, create a new item using our pre-existing model, 
    // and save it to mongoDB database using save method of mongoose.
    // then redierct back to working route to render the new updated list.

    const itemName = req.body.newItem;
    const listName = _.capitalize(req.body.list);

    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save(() => res.redirect('/'));
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            foundList.items.push(newItem);
            foundList.save(() => res.redirect('/' + listName));
        })
        const list = new List({
            name: listName,
            items: defaultItems
        });
    }
});


app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = _.capitalize(req.body.listName);

    if (listName === "Today") {
        // we can also use findOneAndDelete() here without getting deprecation warning. 
        // findOneAndDelete() will also return the deleted element in case we need it.
        Item.deleteOne({ _id: checkedItemId }, function (err) {
            if (err) {
                console.log(err);
            } else {
                // console.log("Item deleted successfully!");
                // res.redirect('/');
                setTimeout(() => { res.redirect('/');}, 20);
            }
        });
    } else {
        List.findOne({ name: listName }, function (err, foundList) {
            if (err) {
                console.log(err);
            } else {
                // here we have to delete the element from inside the foundList.lists array.

                // // Method 1 : Easy to understand.
                // foundList.items.pull({ _id: checkedItemId });
                // foundList.save(() => res.redirect('/' + listName));
                // // watch tutorial : 348. Revisiting Lodash and Deleting Items from Custom ToDo Lists 
                // // for a better way using $pull (of mongoDB) and findOneAndUpdate (of mongoose)
                // // the code above also works, but it's not as efficient for nested arrays holding large amount of data, 
                // // as we will have to run pull multiple times. Read for more : 
                // // https://www.udemy.com/course/the-complete-web-development-bootcamp/learn/lecture/12385986#questions/11324130 


                // Method 2 : More Efficient and recommended to use.
                List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
                    if (!err) {
                        res.redirect('/' + listName);
                    }
                })
            }
        });
    }
});



app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

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
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
            }
        }
    });

    // res.render("list", { listTitle: "Work List", newListItems: workItems });
});


// listen on port 3000 and console log that our server has been started.
app.listen(3000, function () {
    console.log("Server started on port 3000");
});
