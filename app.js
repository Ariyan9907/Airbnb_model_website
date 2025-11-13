const express=require("express");
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const Listing=require("./models/listing.js");
const { title } = require("process");
const methodOverride = require('method-override');
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const expressError=require("./utils/expressError.js");
const {listingSchema}=require("./schema.js");

port=3000;

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,"/public")));
app.engine('ejs', ejsMate);


const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new expressError(400,errMsg);
    }
    else{
        next();
    }
}

main().then(()=>{
    console.log("Connection to database successfull");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderLust');
} 

app.get("/",(req,res)=>{
    res.send("All the rotes working and you are at root");
})

//index route
app.get("/listings",wrapAsync(async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}));

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
});



//show route
app.get("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
    
}));

//create route
app.post("/listings",validateListing,wrapAsync(async(req,res)=>{
    // let{title,description,image,price,location,country}=req.body;
    const newListing= new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");

}));

//edit route
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
     let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});
}));
//uddate route
app.put("/listings/:id/edit",validateListing,wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

//destroy route
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

// Catch everything using a path that won't be parsed as a malformed token
app.use((req, res, next) => {
  next(new expressError(404, "Page not found"));
});


app.all(/.*/,(err,req,res,next)=>{
    let{status=500,message="something went wrong"}=err;
    res.status(status).render("error.ejs",{message,status});
});

app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
});