var mongoose = require("mongoose");
var moment = require("moment");

//SCHEMA SETUP
var newsSchema = new mongoose.Schema({
	image : String,
	title : String,
	body : String,
   intro : String,
   author : String,
   date : String,
   featured : String,
	created : {type : Date, default : Date.now()},
	comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment" //name of the model
      }
   ],
   date : String
})

module.exports = mongoose.model("news", newsSchema);

