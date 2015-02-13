//this is app.js


//Decalre Requirements
var express = require('express');
	errorHandler = require('errorhandler');
var bodyParser = require('body-parser');
// the request library will be used to query CouchDB
var Request = require('request');

//Create the app
var app = express();

//set up the public directory to serve our javascript file
app.use(express.static(__dirname + '/public'));
//set up the view directory
app.set("views", __dirname +'/views');

// Set EJS as templating language WITH html as an extension)
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');


//CouchDB
// The username you use to log in to cloudant.com
var CLOUDANT_USERNAME="ynkynk9";
// The name of your database
var CLOUDANT_DATABASE="nbnebula";
// These two are generated from your Cloudant dashboard of the above database.
var CLOUDANT_KEY="dvateseaversatherfestatm";
var CLOUDANT_PASSWORD="NXEeR7dCCQ5fjYJi0NHqj7yP";

var CLOUDANT_URL = "https://" + CLOUDANT_USERNAME + ".cloudant.com/" + CLOUDANT_DATABASE;

//Routes
app.get('/',function(request,response){
	//response.send('Hello World');
	response.render('index.html');
});

// GET - API route to get the CouchDB data after page load.
app.get("/api", function (request, response) {
	// Use the Request lib to GET the data in the CouchDB on Cloudant
	Request.get({
		url: CLOUDANT_URL+"/_all_docs?include_docs=true",
		auth: {
			user: CLOUDANT_KEY,
			pass: CLOUDANT_PASSWORD
		}
	}, function (err, res, body){
		// Need to parse the body string
		var theBody = JSON.parse(body);
		var theData = theBody.rows;

		// Now use Express to render the JSON.
		response.json(theData);
	});
});

app.get('*', function(request,response){
	response.send("SORRY!");
})

//set up express error handling
app.use(errorHandler());
//start the server
var server = app.listen(process.env.PORT || 3000, function(){
	console.log('Listening on port %d', server.address().port);
});