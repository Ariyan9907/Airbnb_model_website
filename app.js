const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate");
const expressError=require("./utils/expressError.js");

const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");



port=3000;

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs', ejsMate);



main().then(()=>{
    console.log("Connection to database successfull");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderLust');
} 

app.get("/",(req,res)=>{
    res.send("All the rotes working and you are at root");
});

//for the routes of listing
app.use("/listings",listings);

//for the routes of reviews
app.use("/listings/:id/reviews",reviews);



// Catch everything using a path that won't be parsed as a malformed token
app.use((req, res, next) => {
  next(new expressError(404, "Page not found"));
});


app.use((err,req,res,next)=>{
    let{status=500,message="something went wrong"}=err;
    res.status(status).render("error.ejs",{message,status});
});

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});