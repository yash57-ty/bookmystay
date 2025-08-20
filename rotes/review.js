const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapasync.js");
const ExpressError=require("../utils/expresserror.js");
const{reviewSchema}=require("../schema.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");

//reviews
router.post("/",wrapAsync(async (req,res)=>{
    let listing=await Listing.findById(req.params.id);
    let newreview=new Review(req.body.review);
    
    listing.reviews.push(newreview);

    await newreview.save();
    await listing.save();
    
    req.flash("success","New Review created");
    res.redirect(`/listings/${listing._id}`);
    })
);

//delete review
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
    const { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    
    req.flash("success","delete review");
    res.redirect(`/listings/${id}`);
})
);

module.exports=router;
