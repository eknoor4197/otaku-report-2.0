var express = require("express");
var expressSanitizer = require("express-sanitizer");
var app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var passport = require("passport");
var localStrategy = require("passport-local");
var FacebookStrategy = require('passport-facebook').Strategy;


var marked = require('marked');

var moment = require("moment");
var now  = moment();
var currentDateTime = new moment();

var Blog = require("./models/blog");
var methodOverride = require("method-override");
// var seedDB = require("./seeds");
var Comment = require("./models/comment");
var User = require("./models/user");
var Review = require("./models/review");
var Revisited = require("./models/revisited");
var Latest = require("./models/latest");
var News = require("./models/news");
// var Article = require("./models/article");

var config = require('./oauth.js');

var fullUrl;

// app.use(function(req,res,next) {
// 	fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
// 	res.locals.currentUser = req.user;
// 	console.log(req.user);
// 	console.log("=============");
// 	console.log(res.locals.currentUser);
// 	res.locals.fullUrl = fullUrl;
// 	next();
// })


// seedDB(); 

// //PASSPORT CONFIG
app.use(require("express-session")({
	secret : "Once again Rusty wins",
	resave : false,
	saveUninitialized :false
}));

app.use(passport.initialize());
app.use(passport.session());

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// config
passport.use(new FacebookStrategy({
  clientID: config.facebook.clientID,
  clientSecret: config.facebook.clientSecret,
  callbackURL: config.facebook.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

// //local
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/otakureport");

// app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());


// Blog.create(
// 	  {
// 	    image : "https://s-media-cache-ak0.pinimg.com/originals/22/f3/1f/22f31f18ba64874b9ada4590bbcb833e.jpg",
// 	    name : "Naruto Shippuden - Remembering The Sacrifices",
// 	    body : "Body for the post"	
// 	  }, function(err,blog) {
// 	  	if(err) {
// 	  		console.log(err);
// 	  	} else {
// 	  		console.log("NEWLY CREATED BLOG");
// 	  		console.log(blog);
// 	  	}
// 	  } 
// )

app.use(function(req,res,next) {
	fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
	res.locals.currentUser = req.user;
	console.log(req.user);
	console.log("=============");
	console.log(res.locals.currentUser);
	res.locals.fullUrl = fullUrl;
	next();
})


//LANDING PAGE
app.get('/', function (req, res,next) {
	// console.log(req.user);
  Latest.find({}).sort([['_id', -1]]).limit(5).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.latest = allLatest;
			res.locals.title = "Otaku Report";
			// res.render("landing", {blog : allBlogs , moment : now});
			next();
		}
	})
}, function(req,res,next) {
  Blog.find({featured : "no"}).sort([['_id', -1]]).limit(6).exec(function(err,allBlogs) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.blog = allBlogs;
			// res.render("landing", {blog : allBlogs , moment : now});
			next();
			}
	})
},function(req,res,next) {
  Blog.find({featured : "yes"}).sort([['_id', -1]]).limit(1).exec(function(err,featuredBlogs) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.featuredBlogs = featuredBlogs;
			// res.render("landing", {blog : allBlogs , moment : now});
			next();
		}

	})
},function (req, res,next) {
  Review.find({featured : "no"}).sort([['_id', -1]]).limit(6).exec(function(err,allReviews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.review = allReviews;
					// res.render("landing", res.locals);
					next();
				}	
	})
},function (req, res,next) {
  Review.find({featured : "yes"}).sort([['_id', -1]]).limit(1).exec(function(err,featuredReviews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.featuredReviews = featuredReviews;
					// res.render("landing", res.locals);
					next();
				}	
	})
}, function (req, res,next) {
  News.find({featured : "no"}).sort([['_id', -1]]).limit(4).exec(function(err,allNews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.news = allNews;
					// res.render("landing", res.locals);
					next();
				}	
	})
},function (req, res,next) {
  News.find({featured : "yes"}).sort([['_id', -1]]).limit(2).exec(function(err,featuredNews) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.featuredNews = featuredNews;
					// res.render("landing", res.locals);
					next();
				}	
	})
},function (req, res) {
  Revisited.find({}).sort([['_id', -1]]).limit(6).exec(function(err,allRevisited) {
				if(err) {
					console.log(err);
					next();
				} else {
					res.locals.revisited = allRevisited;
					res.render("landing", res.locals);
				}	
	})
})

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){});
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/account');
});

// ================
// BLOG
// ================

// BLOG PAGE
app.get("/blog", function(req,res) {
	console.log(moment().format("MMM Do YYY"));
	Blog.find({}).sort([['_id', -1]]).exec(function(err,allBlogs) {
		if(err) {
			console.log(err);
		} else {
			res.render("blog", {blog : allBlogs, moment : now,title:'Blog | Nerd Culture'});
		}
	})
})

//NEW BLOG - FORM
app.get("/blog/new", isLoggedIn, function(req,res) {
	res.render("newBlog", { title : "New Blog"} );
})

//NEW BLOG - CREATE
// app.post("/blog",isLoggedIn, function(req,res) {
// 	console.log(req.user);
// 	var authorRevised = {
// 		id : req.user._id,
// 	    username : req.user.username
// 	}
// 	// req.body.blog.body = req.sanitize(req.body.blog.body);
// 	Blog.create(req.body.blog,function(err,newBlog) {
// 		if(err) {
// 			res.render("newBlog");
// 		} else {
// 	        Latest.create({
// 	        	referenceId : newBlog._id,
// 	        	postType : "blog",
// 	        	image : newBlog.image,
// 	        	title : newBlog.title,
// 	        	body : newBlog.body,
// 	        	summary : newBlog.summary,
// 	        	author : newBlog.author,
// 	        	date : newBlog.date,
// 	            created : newBlog.created
// 	        });
// 	        console.log(newBlog);
// 	        res.redirect("/blog"); //success response 
// 		}
// 	})
// })

app.post("/blog",isLoggedIn, function(req,res) {
	// req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,newBlog) {
		if(err) {
			res.render("newBlog");
		} else {
	        Latest.create({
	        	referenceId : newBlog._id,
	        	postType : "blog",
	        	image : newBlog.image,
	        	title : newBlog.title,
	        	body : newBlog.body,
	        	summary : newBlog.summary,
	        	author : newBlog.author,
	        	date : newBlog.date,
	            created : newBlog.created,
	            featured : newBlog.featured,
	            titleURL : newBlog.titleURL
	        });
	        res.redirect("/blog"); //success response 
		}
	})
})


// PARTICULAR BLOG
// app.get("/blog/:id", function(req,res) {
// 	Blog.findById(req.params.id).populate("comments").exec(function(err,foundBlog) {
// 		if(err) {
// 			res.redirect("/blog");
// 		} else {
// 			res.render("showBlog", {blog : foundBlog});
// 		}
// 	})
// })

app.get("/blog/:id/:titleURL", function(req,res,next) {
	Blog.findById(req.params.id).populate("comments").exec(function(err,foundBlog) {
		if(err) {
			// next();
			res.redirect("/blog");
			next();
		} else {
			// next();
		  res.locals.blog = foundBlog;
          res.locals.title = foundBlog.title + " | Otaku Report";
		  res.locals.blog.body = marked( foundBlog.body );
		  next();
		}
	})
},function(req,res,next) {
    Latest.find({postType : "news"}).sort([['_id', -1]]).limit(5).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			next();
			console.log(err);
		} else {
			next();
			res.locals.latest = allLatest;
			// res.render("showBlog", res.locals);
		}
	})
 },function(req,res) {
    Latest.find({postType:"blog"}).sort([['_id', -1]]).limit(6).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.more = allLatest;
			res.render("showBlog", res.locals);
		}
	})
 }
)

//EDIT BLOG - FORM
app.get("/blog/:id/:title/edit", function(req,res) {
	  if(req.isAuthenticated()) {
	  	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
			res.redirect("/blog");
		} else {
			console.log(foundBlog.author);
			console.log(req.user.username);
			if( (req.user.username == "eknoor") || (foundBlog.author == req.user.username) ) {
				res.render("editBlog", {blog : foundBlog, title: "Edit Blog"});
			} else {
				res.send( "YOU DO NOT HAVE PERMISSION TO DO THAT!");
			}
		}
	})
	  } else {
	  	res.send("YOU NEED TO BE LOGGED IN TO DO THAT!");
	  }
	
})

//UPDATE BLOG
app.put("/blog/:id/:titleURL", function(req,res) {
	// req.body.blog.body = req.sanitize(req.body.blog.body);
	// var id = req.params.id;
	Blog.findByIdAndUpdate(req.params.id, req.body.blog,{new: true}, function(err,updatedBlog) {
		if(err) {
			res.redirect("/blog");
		} else {
			Latest.findOne({referenceId : req.params.id}, function(err,updatedLatest) {
				if(!err) {
				  console.log(updatedBlog); 
				  updatedLatest.referenceId = updatedBlog._id;
	        	  updatedLatest.postType = "blog";
	        	  updatedLatest.image = updatedBlog.image;
	        	  updatedLatest.title = updatedBlog.title;
	        	  updatedLatest.body = updatedBlog.body;
	        	  updatedLatest.summary = updatedBlog.summary;
				  updatedLatest.author = updatedBlog.author;
				  updatedLatest.date = updatedBlog.date;
	        	  updatedLatest.rating = updatedBlog.rating;
	              updatedLatest.created = updatedBlog.created;
	              updatedLatest.featured = updatedBlog.featured;
	              updatedLatest.titleURL = updatedBlog.titleURL;
	              updatedLatest.save(); 
				} 
			})
			res.redirect("/blog/" + req.params.id + "/" + req.params.titleURL);
		}
	})
})

//DELETE BLOG
app.delete("/blog/:id/:titleURL", function(req,res) {
	Blog.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/blog");
		} else {
			Latest.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/blog");
				}
			})
		}
	})
})

// =================
// REVIEW 
// =================

// REVIEW PAGE
app.get("/review" , function(req,res) {
	Review.find({}).sort([['_id', -1]]).exec(function(err,allReviews) {
		if(err) {
			console.log(err);
		} else {
			res.render("review", {review : allReviews, title : "Reviews | Otaku Report"});
		}
	})
})

//NEW REVIEW - FORM
app.get("/review/new", isLoggedIn, function(req,res) {
	res.render("newReview", { title : "New Review" });
})

//NEW REVIEW - CREATE
app.post("/review", isLoggedIn, function(req,res) {
	Review.create(req.body.review,function(err,newReview) {
		if(err) {
			res.render("newReview");
		} else {
			Latest.create({
	        	referenceId : newReview._id,
	        	postType : "review",
	        	image : newReview.image,
	        	title : newReview.title,
	        	body : newReview.body,
	        	summary : newReview.summary,
	        	author : newReview.author,
	        	date : newReview.date,
	        	rating : newReview.rating,
	            created : newReview.created,
	            featured : newReview.featured
	        });
			res.redirect("/review");
		}
	})
})

//PARTICULAR REVIEW
app.get("/review/:id/:title", function(req,res,next) {
	Review.findById(req.params.id).populate("comments").exec(function(err,foundReview) {
		if(err) {
			res.redirect("/review");
			next();
		} else {
			res.locals.review = foundReview;
			res.locals.title = foundReview.title + " | Otaku Report";
			res.locals.review.body = marked( foundReview.body );
			next();
			// res.render("showReview", {review : foundReview});
		}
	})
},function(req,res,next) {
    Latest.find({postType:"news"}).sort([['_id', -1]]).limit(5).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			res.locals.latest = allLatest;
			// res.render("showReview", res.locals);
			next();
		}
	})
},function(req,res) {
    Latest.find({postType:"blog"}).sort([['_id', -1]]).limit(6).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.more = allLatest;
			res.render("showReview", res.locals);
		}
	})
 }
)

//EDIT REVIEW
app.get("/review/:id/:title/edit", function(req,res) {
	Review.findById(req.params.id, function(err, foundReview) {
		if(err) {
			res.redirect("/review");
		} else {
			res.render("editReview", {review : foundReview , title: "Edit Review | Otaku Report"});
		}
	})
})

//UPDATE REVIEW
app.put("/review/:id/:title", function(req,res) {
	// req.body.review.body = req.sanitize(req.body.review.body);
	Review.findByIdAndUpdate(req.params.id, req.body.review,{new: true}, function(err,updatedReview) {
		if(err) {
			res.redirect("/review");
		} else {
			Latest.findOne({referenceId : req.params.id}, function(err,updatedLatest) {
				if(!err) {
				updatedLatest.referenceId = updatedReview._id;
	        	updatedLatest.postType = "review";
	        	updatedLatest.image = updatedReview.image;
	        	updatedLatest.title = updatedReview.title;
	        	updatedLatest.body = updatedReview.body;
	        	updatedLatest.summary = updatedReview.summary;
				updatedLatest.author = updatedReview.author;
				updatedLatest.date = updatedReview.date;
	        	updatedLatest.rating = updatedReview.rating;
	            updatedLatest.created = updatedReview.created;
	            updatedLatest.featured = updatedReview.featured;
	            updatedLatest.save();
				}
			})
			res.redirect("/review/" + req.params.id + "/" + req.params.title);
		}
	})
})

//DELETE REVIEW
app.delete("/review/:id/:title", function(req,res) {
	Review.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/review");
		} else {
			Latest.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/review");
				}
			})
		}
	})
})

// ================
// NEWS
// ================

// NEWS PAGE
app.get("/news", function(req,res) {
	News.find({}).sort([['_id', -1]]).exec(function(err,allNews) {
		if(err) {
			console.log(err);
		} else {
			res.render("news", {news : allNews, moment : now, momentNow : currentDateTime, title : "News | Otaku Report"});
		}
	})
})

//NEW NEWS - FORM
app.get("/news/new", isLoggedIn , function(req,res) {
	res.render("newNews" , { title : "New News | Otaku Report" });
})

//NEW NEWS - CREATE
app.post("/news",isLoggedIn, function(req,res) {
	News.create(req.body.news,function(err,newNews) {
		if(err) {
			res.render("newNews");
		} else {
	        Latest.create({
	        	referenceId : newNews._id,
	        	postType : "news",
	        	image : newNews.image,
	        	title : newNews.title,
	        	body : newNews.body,
	        	summary : newNews.summary,
	        	author : newNews.author,
	        	date : newNews.date,
	            created : newNews.created,
	            featured : newNews.featured
	        });
	        res.redirect("/news"); //success response 
		}
	})
})

//PARTICULAR NEWS PAGE
app.get("/news/:id/:title", function(req,res,next) {
	News.findById(req.params.id).populate("comments").exec(function(err,foundNews) {
		if(err) {
			next();
			res.redirect("/news");
		} else {
			next();
			res.locals.news = foundNews;
			res.locals.title = foundNews.title + " | Otaku Report";
			res.locals.news.body = marked( foundNews.body );
		}
	})
},function(req,res,next) {
    Latest.find({postType:"news"}).sort([['_id', -1]]).limit(5).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
			next();
		} else {
			next();
			res.locals.latest = allLatest;
			// res.render("showNews", res.locals);
		}
	})
 },function(req,res) {
    Latest.find({postType:"review"}).sort([['_id', -1]]).limit(6).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.more = allLatest;
			res.render("showNews", res.locals);
		}
	})
 }
)

//EDIT NEWS - FORM
app.get("/news/:id/:title/edit", function(req,res) {
	News.findById(req.params.id, function(err, foundNews) {
		if(err) {
			res.redirect("/news");
		} else {
			res.render("editNews", {news : foundNews, title: "Edit News"});
		}
	})
})

//UPDATE NEWS
app.put("/news/:id/:title", function(req,res) {
	// req.body.news.body = req.sanitize(req.body.news.body);
	var id = req.params.id;
	News.findByIdAndUpdate(req.params.id, req.body.news,{new: true}, function(err,updatedNews) {
		if(err) {
			res.redirect("/news");
		} else {
			Latest.findOne({referenceId : req.params.id}, function(err,updatedLatest) {
				if(!err) {
				console.log(updatedNews); 
				updatedLatest.referenceId = updatedNews._id;
	        	updatedLatest.postType = "news";
	        	updatedLatest.image = updatedNews.image;
	        	updatedLatest.title = updatedNews.title;
	        	updatedLatest.body = updatedNews.body;
	        	updatedLatest.summary = updatedNews.summary;
				updatedLatest.author = updatedNews.author;
				updatedLatest.date = updatedNews.date;
	        	updatedLatest.rating = updatedNews.rating;
	            updatedLatest.created = updatedNews.created;
	            updatedLatest.featured = updatedNews.featured;
	            updatedLatest.save();
				}
			})
			res.redirect("/news/" + req.params.id + "/" + req.params.title);
		}
	})
})

//DELETE NEWS
app.delete("/news/:id/:title", function(req,res) {
	News.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/news");
		} else {
			Latest.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/news");
				}
			})
		}
	})
})

// ============
//REVISITED
// ============

// REVISITED PAGE
app.get("/revisited", function(req,res) {
	Revisited.find({}).sort([['_id', -1]]).exec(function(err,allRevisited) {
		if(err) {
			console.log(err);
		} else {
			res.render("revisited", {revisited : allRevisited, title : "Revisited | Otaku Report"});
		}
	})
})

// NEW REVISITED - FORM
app.get("/revisited/new", isLoggedIn, function(req,res) {
	res.render("newRevisited" , { title : "New Revisited" });
})

// NEW REVISITED - POST
app.post("/revisited",isLoggedIn, function(req,res) {
	// req.body.blog.body = req.sanitize(req.body.blog.body);
	Revisited.create(req.body.revisited,function(err,newRevisited) {
		if(err) {
			res.render("newRevisited");
		} else {
	        Latest.create({
	        	referenceId : newRevisited._id,
	        	postType : "revisited",
	        	image : newRevisited.image,
	        	title : newRevisited.title,
	        	body : newRevisited.body,
	        	summary : newRevisited.summary,
	        	author : newRevisited.author,
	        	date : newRevisited.date,
	            created : newRevisited.created
	        });
	        res.redirect("/revisited"); //success response 
		}
	})
})

// PARTICULAR REVISITED PAGE
app.get("/revisited/:id/:title", function(req,res,next) {
	Revisited.findById(req.params.id).populate("comments").exec(function(err,foundRevisited) {
		if(err) {
			// next();
			res.redirect("/revisited");
			next();
		} else {
			// next();
		  res.locals.revisited = foundRevisited;
		   res.locals.title = foundRevisited.title + " | Otaku Report";
		  res.locals.revisited.body = marked( foundRevisited.body );
		  next();
		}
	})
},function(req,res) {
    Latest.find({}).sort([['_id', -1]]).limit(3).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.latest = allLatest;
			res.render("showRevisited", res.locals);
		}
	})
 }
)

//EDIT REVISITED - FORM
app.get("/revisited/:id/:title/edit", function(req,res) {
	  if(req.isAuthenticated()) {
	  	Revisited.findById(req.params.id, function(err, foundRevisited) {
		if(err) {
			res.redirect("/revisited");
		} else {
			console.log(foundRevisited.author);
			console.log(req.user.username);
			if( (req.user.username == "eknoor") || (foundRevisited.author == req.user.username) ) {
				res.render("editRevisited", {revisited : foundRevisited , title : "Edit Revisited" });
			} else {
				res.send( "YOU DO NOT HAVE PERMISSION TO DO THAT!");
			}
		}
	})
	  } else {
	  	res.send("YOU NEED TO BE LOGGED IN TO DO THAT!");
	  }
	
})

//UPDATE REVISITED
app.put("/revisited/:id/:title", function(req,res) {
	// req.body.revisited.body = req.sanitize(req.body.blog.body);
	// var id = req.params.id;
	Revisited.findByIdAndUpdate(req.params.id, req.body.revisited,{new: true}, function(err,updatedRevisited) {
		if(err) {
			res.redirect("/revisited");
		} else {
			Latest.findOne({referenceId : req.params.id}, function(err,updatedLatest) {
				if(!err) {
				  console.log(updatedRevisited); 
				  updatedLatest.referenceId = updatedRevisited._id;
	        	  updatedLatest.postType = "blog";
	        	  updatedLatest.image = updatedRevisited.image;
	        	  updatedLatest.title = updatedRevisited.title;
	        	  updatedLatest.body = updatedRevisited.body;
	        	  updatedLatest.summary = updatedRevisited.summary;
				  updatedLatest.author = updatedRevisited.author;
				  updatedLatest.date = updatedRevisited.date;
	        	  updatedLatest.rating = updatedRevisited.rating;
	              updatedLatest.created = updatedRevisited.created;
	              updatedLatest.save(); 
				} 
			})
			res.redirect("/revisited/" + req.params.id + "/" + req.params.title);
		}
	})
})

//DELETE REVISITED
app.delete("/revisited/:id/:title", function(req,res) {
	Revisited.findByIdAndRemove(req.params.id,function(err) {
		if(err) {
			res.redirect("/blog");
		} else {
			Latest.findOneAndRemove({referenceId : req.params.id}, function(err) {
				if(!err) {
					res.redirect("/revisited");
				}
			})
		}
	})
})



//AUTH ROUTES
app.get("/register", function(req,res) {
	res.locals.title = "Otaku Report";
	res.render("register",res.locals);
});

app.post("/register", function(req,res) {
	var newUser = new User({username : req.body.username});
	User.register(newUser, req.body.password, function(err,user) {
		if(err) {
			console.log(err);
			return res.render("register");
		} else {
			passport.authenticate("local")(req,res, function() {
				res.redirect("/admin");
			})
		}
	})
})

//LOGIN FORM
app.get("/login", function(req,res) {
	res.locals.title = "Otaku Report";
	res.render("login", res.locals);
})

//LOGIN LOGIC
app.post("/login", passport.authenticate("local", {
	successRedirect : "/admin",
    failureRedirect : "/login"
}), function(req,res) {

})

//LOGOUT LOGIC
app.get("/logout", function(req,res) {
	req.logout();
	res.redirect("/");
})

//PARTICULAR AUTHOR
app.get("/author/:name", function(req,res) {
	Latest.find({author:req.params.name}).sort([['_id', -1]]).exec(function(err,allLatest) {
		if(err) {
			console.log(err);
		} else {
			res.render("showAuthor", { latest : allLatest , name : req.params.name, title : req.params.name + " | Nerd Culture"});
		}
	})
})

// ABOUT
app.get("/about",function(req,res) {
	res.render("about",{title : "About Us | Otaku Report"});
})

// CONTACT
app.get("/contact",function(req,res) {
	res.render("contact",{title : "Contact Us | AOtaku Report"});
})

app.get("/admin", isLoggedIn ,  function(req,res) {
	console.log(req.user.username);
	Latest.find({author:req.user.username}).sort([['_id', -1]]).exec(function(err,allLatest) { //finds the latest blog posts (upto 3)
		if(err) {
			console.log(err);
		} else {
			res.locals.latest = allLatest;
			res.locals.title = "Otaku Report";
			res.render("admin", res.locals);
		}
	})
})

app.post("/blog/:id/comments", function(req,res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if(err) {
		console.log(err);
	} else {
		Comment.create(req.body.comment, function(err, comment) {
			if(err) {
				console.log(err);
			} else {
				foundBlog.comments.push(comment);
				foundBlog.save();
				res.redirect("/blog/" + foundBlog._id);
			}
		})
	}
	})
	
})

function isLoggedIn(req,res,next) {
	if(req.isAuthenticated()) {
		return next();
	} 
	res.redirect("/login");
}

app.listen(3000,function() {
	console.log("Server has started!");
});