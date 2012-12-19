
/* Make a zip file, uses (if available) builtin browser blob
	functionality to get around URL size limit on base64 encoded zip
*/
function buildZip(name, data) {
	var zip = new JSZip();
	folder = zip.folder("instagram-" + name);
	for (item in data) {
		folder.file("image" + data[item]["id"] + ".png", data[item]["data"], {base64: true});
	}

	if (window.Blob) {

		content = zip.generate({base64: false});

		// Builds a byte array from our zip data
		// Ref: http://stackoverflow.com/questions/13790949/downloading-generated-binary-content-contains-utf-8-encoded-chars-in-disk-file
		len = content.length;
		bytes = new Uint8Array(len);
		for( var i = 0; i < len; ++i ) {
			bytes[i] = content.charCodeAt(i);
		}

		var blob = new Blob([bytes], { type : 'application/zip' });
		var oURL = (window.URL || window.webkitURL);

		oURL = oURL.createObjectURL(blob);
		location.href = oURL;

	} else {
		content = zip.generate();
		location.href="data:application/zip;base64,"+ content;
	}

	// Fire an event to let everyone know we're done
	$.event.trigger({
		type: "built",
		message: "Zip complete!",
		time: new Date()
	});
}

/* Wraps the metadata fetching and image conversion
*/
function zipImages(user, items) {

	/* The location of the base64 converter.
	 * @param url		(required)	Image URL
	 * @param callback	(required)  JS callback
	 */
	var base64_converter = "https://base64convert.orchestra.io/";

	$.event.trigger({
		type: "building",
		message: "Building zip!",
		time: new Date()
	});
	var instagrams = new Array();
	var response = false;


	$.event.trigger({
		type: "imgload",
		message: "Loading images...",
		time: new Date()
	});

	var counter = 0;
	$.each(items, function(index, metagram){
		var img = metagram.images.standard_resolution

		// Tried using YQL for this, but there's a 25KB limit on base64 image results :(
		$.getJSON(base64_converter + "?url=" + img.url + "&callback=?", function(converted){
			instagrams.push({"data": converted.data,
			"id": metagram.id})
			if (instagrams.length == items.length) {
				buildZip(user, instagrams);
			}
			counter++;
			$.event.trigger({
				type: "imgload",
				message: "Loading image ("+counter+" of "+items.length+")",
				time: new Date()
			});
		});
	});
	return response;
}

function getMeta(user, max_id){
	/*
		Use YQL as a JSONP proxy
	*/

	var url;
	if (max_id == null) {
		url = [ "https://query.yahooapis.com/v1/public/yql?q=",
		"select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Finstagram.com%2F",
		user, "%2Fmedia%22&format=json&callback=?"].join("");
	} else {
		url = [ "https://query.yahooapis.com/v1/public/yql?q=",
		"select%20*%20from%20json%20where%20url%3D%22http%3A%2F%2Finstagram.com%2F",
		user, "%2Fmedia%3Fmax_id%3D", max_id, "D%22&format=json&callback=?"].join("");
	}

	$.getJSON(url, function(data){
		if (data.query.results.json) {
			items = data.query.results.json.items;
		}
		if (items == undefined) {
			$.event.trigger({
				type: "meta",
				message: "Metadata ready",
				time: new Date()
			});
			return;
		}

		for (item in items) {
			max_id = items[item].id
		}
		$.event.trigger({
			type: "results",
			message: {
				"more_available": data.query.results.json.more_available,
				"max_id": max_id,
				"user": user,
				"items": items
			},
			time: new Date()
		});
	});
}

$(document).ready(function(){

	/*
		Event spam!
	*/
	$(document).on("metaload", function(response) {
		$("#status").text(response.message);
	});
	$(document).on("imgload", function(response) {
		$("#status").text(response.message);
	});
	$(document).on("building", function(response) {
		$("#status").text(response.message);
	});
	$(document).on("built", function(response) {
		$("#status").text(response.message);
	});

	$( "form" ).bind("keypress", function(e){
		if ( e.keyCode == 13 ) {
			event.preventDefault();
			$("#create").trigger("click");
		}
	 });

	$("#create").click(function() {

		var user = $('input[name=user]').val();
		var max_id = '';
		var count = 0;

		var items = [];
		
		$(document).on("results", function(result){
			response = result.message;
			for (item in response["items"]) {
				items.push(response["items"][item]);
			}
			if (response["more_available"]) {
				getMeta(response["user"], response["max_id"])
			}
		});

		$.event.trigger({
			type: "metaload",
			message: "Loading image metadata...",
			time: new Date()
		});
		
		getMeta(user);

		$(document).on("meta", function() {
			zipImages(user, items);
		});

	});
});
