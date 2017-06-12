var mongoose = require("mongoose");
var moment = require("moment");

//SCHEMA SETUP
var revisitedSchema = new mongoose.Schema({
	image : String,
	title : String,
	body : String,
   summary : String,
   author : String,   
   date : String,
   titleURL : String, 
	created : {type : Date, default : Date.now()},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment" //name of the model
      }
   ]
})

module.exports = mongoose.model("revisited", revisitedSchema);

