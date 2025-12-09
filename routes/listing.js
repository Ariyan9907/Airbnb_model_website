const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const {listingSchema,reviewSchema}=require("../schema.js");
const expressError=require("../utils/expressError.js");
const Listing=require("../models/listing.js");
const multer = require("multer");
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage })
const {isLoggedIn, isOwner,validateListing,isReviewAuthor}=require("../middleware.js");

const listingController=require("../controllers/listings.js");

//index route and create route
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,validateListing,upload.single('listing[image]'),wrapAsync(listingController.createListing))
// .post(upload.single('listing[image]'),(req,res)=>{
//     res.send(req.file);
// })

//new route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//show update and destroy route
router.route("/:id")
.get(wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,wrapAsync(listingController.deleteListing))



//edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.RenderEditListing));


module.exports=router;