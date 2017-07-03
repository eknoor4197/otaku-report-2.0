var mongoose = require("mongoose");

//SCHEMA SETUP
var reviewSchema = new mongoose.Schema({
	image : String,
	title : String,
	body : String,
	intro : String,
	author : String,
	date : String,
	rating : String,
	featured : String,
	created : {type : Date, default : Date.now()},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment" //name of the model
      }
   ]
})

module.exports = mongoose.model("review", reviewSchema);

