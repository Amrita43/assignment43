// ------------------ Fill the following details -----------------------------
// Student name: AMRITA DAS RAMDAS
// Student email: aramdas8270@conestogac.on.ca

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const {check, validationResult} = require('express-validator');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/final8020set3', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Model Creation
const Order = mongoose.model('Order',{
    customerName: String,
    customerNumber: String,
    blizzards: Number,
    sundaes: Number,
    shakes: Number
} );

const User = mongoose.model('User', {
    userLogin: String,
    userPass: String
});

var myApp = express();
myApp.use(session({
    secret: 'superrandomsecret',
    resave: false,
    saveUninitialized: true
}));
myApp.use(express.urlencoded({ extended:false}));

myApp.use(express.json());
myApp.set('views', path.join(__dirname, 'views'));
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');

//------------- Use this space only for your routes ---------------------------
    const blizzardsUnitPrice = 7.98;
    const sundaesUnitPrice = 5.99;
    const shakesUnitPrice = 5.49;

    const taxPercentage = 0.13;

myApp.get('/',function(req, res){
    // use this to display the order form
    res.render('form');
});

myApp.post('/', [
    check('customerName', 'Customer Name is required!').notEmpty(),
    check('customerNumber', '').custom(customCustomerNumberValidation),
    check('blizzards','').custom(customQuantityValidation),
    check('sundaes','').custom(customQuantityValidation),
    check('shakes','').custom(customQuantityValidation)
], function (req, res) {
    const errors = validationResult(req);
    console.log(errors);//logging this error will show us in the terminal that errors is an array and msg is what we need to print client side
    if (!errors.isEmpty()) {
        res.render('form', {
            errors: errors.array()
        });
    }
    else {
        var customerName = req.body.customerName;
        var customerNumber = req.body.customerNumber;
        var blizzards = req.body.blizzards;
        var sundaes = req.body.sundaes;
        var shakes = req.body.shakes;
               
        var blizzardsSubTotal = blizzards * blizzardsUnitPrice;
        var sundaesSubTotal = sundaes * sundaesUnitPrice;
        var shakesSubTotal = shakes * shakesUnitPrice;

        var subTotal = blizzardsSubTotal + sundaesSubTotal + shakesSubTotal;
        
        var tax = subTotal * taxPercentage;
        var total = subTotal + tax;

        var pageData = {
            customerName : customerName,
            customerNumber : customerNumber,
            blizzards : blizzards,
            sundaes : sundaes,
            shakes : shakes,
            subTotal : subTotal,
            tax : tax,
            total : total
        }

        var myNewOrder = new Order(
            pageData
        );
        myNewOrder.save().then(() => console.log('New order saved'));

        res.render('orderSuccess', pageData);
    }
});

myApp.get('/orders', function (req, res) {
    if (req.session.userLoggedIn){
        Order.find({}).exec(function (err, orders) {
            console.log(err);
            res.render('orders', { orders: orders });//key value pair
        });
    }
    else{
        res.redirect('login');
    }
});


myApp.get('/login', function (req, res) {
    console.log("In Login get");
    res.render('login', { userLoggedIn: req.session.userLoggedIn });
});


myApp.post('/login', function (req, res) {
    console.log("In Login post");
    var user = req.body.userLogin;
    var pass = req.body.userPass;

    User.findOne({ userLogin: user, userPass: pass }).exec(function (
        err,
        admin
    ) {
        console.log("Error: " + err);
        console.log("Order: " + admin);
        if (admin) {
            //store username in session and set logged in true
            req.session.userLogin = admin.userLogin;
            req.session.userLoggedIn = true;
            // redirect to the dashboard
            res.redirect('adminDashBoard');
        } else {
            res.render('login', { error: "Sorry, cannot login!" });
        }
    });
});

myApp.get('/adminDashBoard',function(req, res){
    res.render('adminDashBoard');
});

myApp.get('/delete/:orderid', function(req, res){
    // check if the user is logged in
    if(req.session.userLoggedIn){
        //delete
        var orderid = req.params.orderid;
        console.log(orderid);
        Order.findByIdAndDelete({_id: orderid}).exec(function(err, order){
            console.log('Error: ' + err);
            console.log('Order: ' + order);
            if(order){
                res.render('delete', {message: 'Order Deleted Successfully!', userLoggedIn:req.session.userLoggedIn});
            }
            else{
                res.render('delete', {message: 'Sorry, Order could not be Deleted!', userLoggedIn:req.session.userLoggedIn});
            }
        });
    }
    else{
        res.redirect('/login');
    }
});

myApp.get('/logout',function(req,res){
    //Remove variables from session
    if(req.session.userLoggedIn){
    req.session.username = '';
    req.session.userLoggedIn = false;
    res.render('logout', {error: "Logged Out"});
    }
    else{
    //res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.render('login');
    }
});

// write any other routes here as needed




//---------- Do not modify anything below this other than the port ------------
//------------------------ Setup the database ---------------------------------

myApp.get('/setup',function(req, res){
    
    let userData = [{
        'userLogin': 'admin',
        'userPass': 'admin'
    }];
    
    User.collection.insertMany(userData);

    var firstNames = ['John ', 'Alana ', 'Jane ', 'Will ', 'Tom ', 'Leon ', 'Jack ', 'Kris ', 'Lenny ', 'Lucas '];
    var lastNames = ['May', 'Riley','Rees', 'Smith', 'Walker', 'Allen', 'Hill', 'Byrne', 'Murray', 'Perry'];

    let ordersData = [];

    for(i = 0; i < 10; i++){
        let tempMemb = Math.floor((Math.random() * 100)) + '-AB' + '-' + Math.floor((Math.random() * 1000))
        let tempName = firstNames[Math.floor((Math.random() * 10))] + lastNames[Math.floor((Math.random() * 10))];
        let tempOrder = {
            customerName: tempName,
            customerNumber: tempMemb,
            blizzards: Math.floor((Math.random() * 10)),
            sundaes: Math.floor((Math.random() * 10)),
            shakes: Math.floor((Math.random() * 10))
        };
        ordersData.push(tempOrder);
    }
    
    Order.collection.insertMany(ordersData);
    res.send('Database setup complete. You can now proceed with your exam.');
    
}); 

var customerNumberRegex = /^(([0-9]{2}[\-\s]?)([A-Z]{2}[\-\s]?)([0-9]{3}))$/;
var quantityRegex = /^[1-9][0-9]*$/;

//Function to check a string using regex
function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    return false;
}

function customCustomerNumberValidation(value){
    if(!checkRegex(value,customerNumberRegex)){
        throw new Error('Phone should be in the format 12-AB-123');
    }
    return true;
}

function customQuantityValidation(value){
    if(!checkRegex(value,quantityRegex)){
        throw new Error('Quantity should be a Positive Integer');
    }
    return true;
}
//----------- Start the server -------------------

myApp.listen(8080);// change the port only if 8080 is blocked on your system
console.log('Server started at 8080 for mywebsite...');