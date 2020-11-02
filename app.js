const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash")

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
mongoose.connect("mongodb+srv://ridom_rayhan:Noki@6600@cluster0.b0uiv.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true });
const itemsSchema = new mongoose.Schema({
    name: String,


})

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
    name: "welcom to my todoList"
})
const item2 = new Item({
    name: "This + button add new item"
})
const item3 = new Item({
    name: "<-- Hit this to delete item"
})

const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);






app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("Successfully done");
                }
            })
            res.redirect("/")
        }
        else {

            res.render("list", { listTitle: "Today", newItems: foundItems });
        }


    })


});
app.get("/:customListName", function (req, res) {
    const customListName =_.capitalize( req.params.customListName);



List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
        if (!foundList) {
            //create a new lsit
            const list = new List({
                name: customListName,
                items: defaultItems
            })
            list.save();
            res.redirect("/"+customListName)
        }
        else{
            //show exisiting lsit
            res.render("list", { listTitle: foundList.name, newItems: foundList.items });
        }
    }


})
    })
app.post("/", function (req, res) {
    
    const itemName = req.body.newItem;
    const listName=req.body.list;
    const item = new Item({
        name: itemName
    })
    if(listName==="Today"){

    
    item.save();
    res.redirect("/")
    }
else{
    List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item)
        foundList.save();
        res.redirect("/"+listName)
    })
}

});
app.post("/delete", function (req, res) {
    const checkItem = req.body.checkbox;
    const listName= req.body.listName;
    if (listName==="Today"){
        Item.findByIdAndRemove(checkItem, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Deleted Successfully");
                res.redirect("/")
            }
    
        })

    }
    else{
        List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkItem}}},function(err,foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }

    
    
})
app.get("/work", function (req, res) {
    res.render("list", { listTitle: "Work List", newItems: workItems });

});
app.get("/about", function (req, res) {
    res.render("about");
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 1000;
}


app.listen(port, function () {
    console.log("Server has started!!");

});