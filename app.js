const express=require('express');
const app=express();
const mongoose=require('mongoose');
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const ExpressError=require("./utils/expresserror.js");
const listingsRouter =require("./rotes/listing1.js");
const reviewsRouter=require("./rotes/review.js");
const passport=require("passport");
const locals=require("passport-local");
const User=require("./models/user.js");
const session=require("express-session");
const userRouter=require("./rotes/user.js");
const flash = require("connect-flash");


app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


app.use(session({
    secret: 'thisshouldbeabettersecret',  
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(flash());

//mogodb connection
main().then(()=>{
    console.log("connect to");
}).catch((err)=>{
    console.log(err);
});

//connect to the wander database
async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wander');
}

//simple check route
app.get("/",(req,res)=>{
    res.send("hi");
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new locals(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((err,req,res,next)=>{
    //console.log(err.stack);
    let {statusCode=500,message="somethinfg went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
    //console.log("hi");
    //console.log(message);
});

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curruser=req.user;
    next();
});

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

app.listen(8080,()=>{
    console.log("server");
}); 