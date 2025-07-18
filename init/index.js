const mongoose=require('mongoose');
const initData=require("./data.js");
const listing=require("../models/listing.js");

main().then(()=>{
    console.log("connect to");
}).catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wander');
}

const initdb=async()=>{
    await listing.deleteMany({});
    await listing.insertMany(initData.data);
    console.log("data");
}

initdb();