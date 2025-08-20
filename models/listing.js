const mongoose=require('mongoose');
const { types } = require('joi');
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    image:{
        type:String,
        default:"https://cdn.pixabay.com/photo/2016/09/08/18/45/cube-1655118_640.jpg",
        set:(v)=> v===""
                    ?"https://cdn.pixabay.com/photo/2016/09/08/18/45/cube-1655118_640.jpg"
                    :v,
    },
    price:Number,
    location:String,
    country:String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete",async (listing)=>{
    if(listing){
    await Review.deleteMany({ _id: {$in: listing.reviews}});
    }
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;