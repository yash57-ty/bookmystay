const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapasync.js");
const ExpressError=require("../utils/expresserror.js");
const{listingSchema}=require("../schema.js");
const Listing=require("../models/listing.js");
const {isLoggedIn}=require("../middelware.js");

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,error);
    }else{
        next();
    }
}
//show listings
router.get("/",wrapAsync(async (req,res)=>{
    const alllisting=await Listing.find({});
    res.render("listings/index.ejs",{alllisting});
}));

//create new listing
router.get("/new",isLoggedIn,(req,res)=>{
    res.render("listings/new.ejs");
});

//show listing data
router.get("/:id",wrapAsync(async (req,res)=>{
    let{id}=req.params;
    const listings=await Listing.findById(id).populate("reviews").populate("owner");
    
    if(!listings){
        req.flash("error","Listing request not exist");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listings});
}));

//redirect listings after add the new data value and add new title at listings 
router.post("/",isLoggedIn,validateListing,wrapAsync(async (req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    newListing.owner=req.user._id; 
    await newListing.save();
    req.flash("success","New Listing created");
    res.redirect("/listings");
})
);

//edit listing
router.get("/:id/edit",isLoggedIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing1=await Listing.findById(id);
    if(!listing1){
        req.flash("error","Listing request not exist");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing1});
}));

//update listing
router.put("/:id",isLoggedIn,validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    
    req.flash("success","upadte listing");
    res.redirect(`/listings/${id}`);
}));

//delete listing
router.delete("/:id",isLoggedIn,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    //console.log(deleteListing);
    req.flash("success","Delete Successfull");
    res.redirect("/listings");
}));


module.exports = router;