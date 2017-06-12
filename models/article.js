var mongoose = require("mongoose");

//SCHEMA SETUP
var articleSchema = new mongoose.Schema({
	image : String,
	title : String,
	body : String,
	category : String,
	author : String,
	summary : String,
	created : {type : Date, default : Date.now()},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment" //name of the model
      }
   ]
})

module.exports = mongoose.model("article", articleSchema);

