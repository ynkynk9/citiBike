var margin = {top:0, right:0, bottom:0, left:0},
width = 1280 - margin.left - margin.right,
height = 768 - margin.top - margin.bottom;
//////////////////////////////////////
// get stations data
var stationURL = "http://appservices.citibikenyc.com/data2/stations.php?updateOnly=true";
var bikeURL = "http://appservices.citibikenyc.com/data2/stations.php";

var savedObjs = [];
var stationArray= [];
var dataArray;

function getBike(){
	
	$.ajax({
		url: bikeURL,
		type:'GET',
		dataType:'jsonp',

		error: function(data){
			console.log("We got problems");
			console.log(data.status);
		},

		success: function(data){

				console.log("WooHoo!");
//Check the browser console to see the returned data
			// console.log("Data");
			 console.log(data);
			//console.log(data.results[1].longitude);
			var	dataArray = data.results;
			var stationArray = dataArray[0].nearbyStations
			// console.log("DataArray");
			// console.log(stationArray);
			//  console.log(dataArray.length);
			//  console.log(dataArray[5]);
			// stationArray.push(data.results[i]);
//set the array as a value in an object

			var timeStamp = new Date();
			var saveObj = {time: timeStamp, bikeData: dataArray};
				console.log("good " + timeStamp);

				saveRecord(saveObj);

				savedObjs.push(saveObj);
/////////////////////////////////
					
// 				var svg = d3.select("svg")
// //update time
// 				var updated = new Date(data.lastUpdate);
// 				console.log(updated);
			    var format = d3.time.format("%H:%M:%S %m/%d/%y");

			    d3.select("#time").text(format(timeStamp));

// 			    console.log("Currently: " + format(new Date()) + ", " +
// 			        "Last updated: " + format(updated));
			 
//////////////////////////////////				
//get stations circle;

			var stations = svg.append("g")
							.selectAll("circle")
							.data(dataArray
							)

//add new circles
			    stations.enter()
					.append("circle")
					.attr("cx",function(d, i){ 						
						lon = d.longitude;
						lat = d.latitude;
						//console.log(projection([lon, lat])[0]);
						return projection([lon, lat])[0];					
					})
					.attr("cy",function(d, i){ 
						lon = d.longitude;
						lat = d.latitude;
						//console.log(projection([lon, lat])[1]);
						return projection([lon, lat])[1];	
					})
					.attr("r",function(d, i){
						rFirst = (d.availableBikes +d.availableDocks)/5;
						return rFirst/3;
					})
					.style("fill","#7497F7")
					.style("fill-opacity",function(d){
						return d.availableBikes/(d.availableBikes + d.availableDocks);
						console.log("exit");
					})

					// setInterval(function() {
					// 	  stations.append("circle")
					// 	      .attr("class", "ring")
					// 	      .attr("transform", "translate(" + projection([lon, lat]) + ")")
					// 	      .attr("r", rFirst/8)
					// 	      .style("stroke-width", 1)
					// 	      .style("stroke", "white")
					// 	    .transition()
					// 	      .ease("linear")
					// 	      .duration(6000)
					// 	      .style("stroke-opacity", 1e-2)
					// 	      .style("stroke-width", 0.1)
					// 	      .style("stroke", "")
					// 	      .attr("r", 160)
					// 	      .remove();
					// 	  })
///////////////////////
//mouse move
			   stations.on("mouseover", function(d, i ){
				     d3.select(this).style("fill", "white");
//tooltip					
						tooltipdiv = d3.select("body")
						.append("div")
						.attr("class","tooltip")
						.style("opacity", 0)
						.style("width", "200px");

						tooltipdiv.transition()        
						.duration(200)      
						.style("opacity", .5);      
						tooltipdiv .html(d.label + "<br/>"  + "(" + d.longitude + "," + d.latitude + ")")  
						.style("left", (d3.event.pageX) + "px")     
						.style("top", (d3.event.pageY - 28) + "px"); 
					})

					.on("mouseout", function(d, i){
						d3.select(this).style("fill", "#7497F7");
						tooltipdiv.transition()
						.duration(300)
						.style("opacity", 0);
					})
					.on("mousedown", animate)

					stations.exit()
						.transition()
						.attr("r", 0)
						.style("fill-opacity",0)
						.remove();
					

			 update();	



       }  
		
	});

return dataArray;
}
$(document).ready(function(){
	draw_map();
	getBike();	
//Function to request data from your own database
	loadStations();
	//Function to get citiBikeData every minute
	setInterval(function(){ getBike();
	d3.selectAll("circle")
	.transition()
	.delay(6000)
	.duration(6000)
	.style("fill-opacity", 0)
	.remove();
	 }, 6000);


})
///////////////////////////////////////
//draw map
var width = 1280,
	height = 768;
//The global svg
var svg;
	//set projection
var projection = d3.geo.mercator()
	.center([-74, 40.76])
	.scale([240000])
	.translate([(width) /1.7, (height)/3]);

	//create path variable	 
var path = d3.geo.path()
	.projection(projection);

var q = projection.scale();

	// var zoom = d3.behavior.zoom()
	// 	        .translate(projection.translate())
	// 	        .scale(projection.scale())
	// 	        .scaleExtent([height, 64 * height])
	// 	        .on("zoom", zoomed);
	
	function draw_map(){
//generate svg image
			svg = d3.select("#map")
			.append("svg")
			.attr("width", width)
			.attr("height", height)
			    		//.call(zoom);
		var grid = d3.geo.graticule();	
		svg.append("path")
			.datum(d3.geo.graticule())
			.attr("fill", "none")
			.style("stroke", "#ffffff")
			.style("stroke-width", "0.5px");


			d3.json("nyc.json", function(error, nyb) {			 
//	console.log(nyb);				 
				var g = svg.append("g");

					g.append("g")
					.attr("id", "boroughs")
					.selectAll(".state")
					.data(nyb.features)
					.enter()
					.append("path")
					.attr("class", function(d){ return d.properties.name; })
					.attr("d", path);
			});
	}
/////////////////////////////////////////////////////////////////////////////////
//CouchDB
// The username you use to log in to cloudant.com
var CLOUDANT_USERNAME="ynkynk9";
// The name of your database
var CLOUDANT_DATABASE="nbnebula";
// These two are generated from your Cloudant dashboard of the above database.
var CLOUDANT_KEY="dvateseaversatherfestatm";
var CLOUDANT_PASSWORD="NXEeR7dCCQ5fjYJi0NHqj7yP";

var CLOUDANT_URL = "https://" + CLOUDANT_USERNAME + ".cloudant.com/" + CLOUDANT_DATABASE;
//make requests without username and password
var hash = btoa(CLOUDANT_KEY+":"+CLOUDANT_PASSWORD);

// A function to accept a JSON object and POST it to CouchDB.
function saveRecord(theObj){
	$.ajax({
		url: CLOUDANT_URL,
		beforeSend: function(xhr){
			//pass authentication data to Cloudant before sending the data
			xhr.setRequestHeader("Authorization", "Basic" + hash);
		},
		contentType: "application/json",
		type:"POST",
		data: JSON.stringify(theObj),
		error:function(){
			$("#newData").prepend("<p><strong>Something broke.</strong></p>")
		},
		success: function(resp){
			console.log("Saved to my CouchDB!");
			console.log(resp);
			
		}
	});
}


// Loads all records from the Cloudant database. Loops through them and appends each note onto the page.
function loadStations(){
	$.ajax({
		url: CLOUDANT_URL +"/_all_docs?include_docs=true",
		beforeSend: function (xhr) {
			xhr.setRequestHeader ("Authorization", "Basic " + hash);
		},
		type: "GET",
		data: JSON,
		error: function(resp){
			console.log("Problems");
		},
		success: function(resp){
			console.log("hello" + resp);
		
//slider   
		
		}
	});
}


function animate(d){
	d3.select(this).transition()
	.duration(500)
	.attr("r", rFirst/2)
	.transition()
	.delay(100)
	.attr("r","5px")
	.style("fill","white");
	// console.log(d.id);
	// for (var i = 0; i <stationArray.length; i++) {
	// 	console.log(stationArray.id);
	// 	if(stationArray[0].id == dataArray.id){

	//   		longitude = dataArray.longitude;
	//   		latitude = dataArray.latitude;
	//   		return projection[(longitude,latitude)];
	//   		stationArray.push(projection[(longitude, latitude)]);
	//   	}
	//   	console.log("stations" + sta);

	// d3.select("svg")
	//   .selectAll("circle")
	//   .enter()
	//   .data(stationArray)
	//   .transition()
	//   .style("fill", red);
		
	// };
// 

	 
}

function mouseover(){
	tooltipdiv = d3.select("body")
				.append("div")
				.attr("class","tooltip")
				.style("opacity", 0)
				.style("width", "200px");

	tooltipdiv.transition()        
			.duration(200)      
			.style("opacity", .9);      
			tooltipdiv .html(dataArray.label + "<br/>"  + "(" + dataArray.longitude + "," + dataArray.latitude + ")")  
			.style("left", (d3.event.pageX) + "px")     
			.style("top", (d3.event.pageY - 28) + "px");   
}
function circlefeed(data){
// get updated time
    var updated = new Date(data.results.generated);
    var format = d3.time.format("%I:%M:%S %p");

    d3.select("#time").text(format(updated));



    console.log("Currently: " + format(new Date()) + ", " +
        "Last Generated: " + format(updated));
}
function update(){
	var svg = d3.select("svg")
    svg.selectAll("circle")
        .attr("cx",function(d, i){ 						
			lon = d.longitude;
			lat = d.latitude;
				//console.log(projection([lon, lat])[0]);
				return projection([lon, lat])[0];					
			})
		.attr("cy",function(d, i){ 
			lon = d.longitude;
			lat = d.latitude;
				//console.log(projection([lon, lat])[1]);
				return projection([lon, lat])[1];	
						})
		.attr("r",function(d, i){
			rFirst = (d.availableBikes +d.availableDocks)/5;
			return (d.availableBikes +d.availableDocks)/5;
		})

}














