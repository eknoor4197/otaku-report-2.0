var imageURL;

var text = $("#login").text();

$(document).ready(function() {
 //  $("#submit").click(function(e) {
	// e.preventDefault();
	// imageURL = $("#image").val();
	// $("body").css("background-image", 'url(' + imageURL + ')');
	// console.log(imageURL);
 //  })  


  $( "form[action='/login']" ).parent().parent().parent().css({
  		"background-image": "linear-gradient(rgba(0,0,0,0.7),rgba(0,0,0,0.7)), url('https://wallpaperscraft.com/image/anime_crow_mask_105772_1920x1080.jpg')",
         "background-color": "white" ,
         "background-position" : "center",
         "background-size" : "cover"
  }); 

  $( "form[action='/register']" ).parent().parent().css( "background-color", "white" );

  $("form[action='/login']").parent().css("margin-left","300px");

  $("#fb-share").on("click", function() {
  	FB.ui({
    method: 'share',
    display: 'popup',
    href: 'https://developers.facebook.com/docs/'
  }, function(response){});

  }) 

var str = window.location.href;
str = str.replace(/%20/g, "-");
// window.location.href = str.replace(/%20/g, '-').toLowerCase();
// console.log(window.location.href);
console.log( decodeURI(str) );  

var body = $("#MyID").text();

var simplemde = new SimpleMDE({ element: document.getElementById("MyID") });
simplemde.value();

// var html = simplemde.markdown(body);
// console.log(html);

// $("main-blog-content").html(html);

});

