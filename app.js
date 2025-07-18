const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
const methodOverride=require("method-override");
const ejsmate=require("ejs-mate");
const wrapAsync=require("./utils/wrapasync.js");
const ExpressError=require("./utils/expresserror.js");
const{listingSchema}=require("./schema.js");
const Review=require("./models/review.js")

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs',ejsmate);
app.use(express.static(path.join(__dirname,"/public")));

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

const validateListing=(req,res,next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        throw new ExpressError(400,error);
    }else{
        next();
    }
}
//show listings
app.get("/listings",wrapAsync(async (req,res)=>{
    const alllisting=await Listing.find({});
    res.render("listings/index.ejs",{alllisting});
}));

//create new listing
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});

//show listing data
app.get("/listings/:id",wrapAsync(async (req,res)=>{
    let{id}=req.params;
    const listings=await Listing.findById(id);
    res.render("listings/show.ejs",{listings});
}));

//redirect listings after add the new data value and add new title at listings 
app.post("/listings",validateListing,wrapAsync(async (req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})
);

//edit listing
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    const listing1=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing1});
}));

//update listing
app.put("/listings/:id",validateListing,wrapAsync(async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delete listing
app.delete("/listings/:id",wrapAsync(async (req,res)=>{
    let {id}=req.params;
    let deleteListing=await Listing.findByIdAndDelete(id);
    //console.log(deleteListing);
    res.redirect("/listings");
}));

app.use((err,req,res,next)=>{
    //console.log(err.stack);
    let {statusCode=500,message="somethinfg went wrong!"}=err;
    res.status(statusCode).render("error.ejs",{message});
    //console.log("hi");
    //console.log(message);
});

//reviews
app.post("/listings/:id/reviews",async(req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newreview=new Review(req.body.review);
    
    listing.reviews.push(newreview);
    await newreview.save();
    await listing.save();
    console.log(newreview);
    res.redirect(`/listings/${listing._id}`);

});

app.listen(8080,()=>{
    console.log("server");
}); 