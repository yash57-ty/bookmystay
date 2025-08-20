const express=require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapasync.js");
const passport = require("passport");
const{saveRedirectUrl}=require("../middelware.js");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
});

router.post("/signup",wrapAsync(async (req,res)=>{
    try{
        console.log(req.body);
        let {username,email,password}=req.body;
        const newUser=new User({email,username});
        const registeruser=await User.register(newUser,password);
        req.login(registeruser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","welcome to WanderLust");
            res.redirect(req.session.redirectUrl);
        });
        }catch(e){
            req.flash("error",e.message);
            res.redirect(`/signup`);
        }
})
);

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
});

router.post("/login",saveRedirectUrl,passport.authenticate("local",{failureRedirect:'/login',failureFlash:true}),async(req,res)=>{
    req.flash("success","welcome to WanderLust");
    let redirecturl=res.locals.redirectUrl || "/listings";
    res.redirect(redirecturl);
});

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","you are logged out!!!");
        res.redirect("/listings");
    })
});
module.exports=router;
