const exp = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require('lodash');

app = exp();
app.use(bodyParser.urlencoded({extended : true}));
app.use(exp.static('public'));
app.set('view engine', 'ejs');

var items = ["Eat", "Sleep", "Code", "Repeat"];

// creating connection with mongoose
mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://shubham:oMtNu4LMGOfNeFfT@cluster0.uqurvyj.mongodb.net/todolistDb?retryWrites=true&w=majority", {useNewUrlParser : true});

const itemSchema = new mongoose.Schema({
    name : String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    name : "wake up : 8 am"
});

const item2 = new Item({
    name : "fresh up"
});

const item3 = new Item({
    name : "meditate"
});
const defaultItems = [item1, item2, item3];

var hasCome = 0;

// Creating custome routes

var listSchema = 
    {
        name : String,
        listItems : [itemSchema]
    };

var List = mongoose.model("List", listSchema);


app.get("/", function(req, res)
{
    Item.find({}, function(err, result)
    {
        if(err)console.log("Error in finding");
        else
        {
            if(result.length == 0 && hasCome == 0)
            {
                hasCome = 1;

                Item.insertMany(defaultItems, function(err)
                {
                    if(err)console.log(err);
                    else console.log("Successfully inserted the default items");
                });

                res.redirect("/");
            }
            res.render('list', {listTitle : "today", newListItem : result});
        }
    })
})

app.post("/", function(req, res)
{
    var new_data = req.body.newItem;
    var list_name = req.body.list;

    var new_item = new Item({
        name : new_data
    });
    
    console.log("\n post req of " + list_name);

    if(list_name == "today")
    {
        new_item.save(function(err)
        {
            if(err)console.log("err");
            else console.log("succesfully added the item to the list");
        })

        res.redirect("/");
    }
    else
    {
        List.findOne({name : list_name}, function(err, result)
        {
            result.listItems.push(new_item);
            result.save();
            res.redirect("/" + list_name);
        });
        // res.redirect(307, "/" + list_name);
    }
})

app.post("/delete", function(req, res)
{
    var new_data = req.body.newItem;
    var list_name = req.body.list;
    var data_id = req.body.checkChange;
    
    console.log("\n delete req of " + list_name);

    if(list_name == "today")
    {
        Item.deleteOne({_id : data_id}, function(err)
        {
            if(err)console.log(err);
            else console.log("data deleted succesfully !!");
        })
        res.redirect("/");
    }
    else
    {
        List.findOneAndUpdate({name : list_name},{$pull : {listItems : {_id : data_id}}}, function(err, result)
        {
            if(err)console.log(err);
            else 
            {
                console.log("updated the listItems successfully");
                res.redirect("/" + list_name);
            }
        })
    }
})

// list routes
app.get("/:custom", function(req, res)
{
    const customName = _.capitalize(req.params.custom);

    List.findOne({name : customName}, function(err, result)
    {
        if(err)console.log(err);
        else 
        {
            if(!result)
            {
                console.log("Created");
                const new_data = new List({
                    name : customName,
                    listItems : defaultItems
                })
            
                new_data.save();
                res.render('list', {listTitle : customName, newListItem : new_data.listItems});
            }
            else
            {
                console.log("Already Exists");
                res.render('list', {listTitle : customName, newListItem : result.listItems});
            }
        }
    });
})

app.listen(3000, function()
{
    console.log("server started at port 3000");
})