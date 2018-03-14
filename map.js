//Setup for Google Map display, markers added after spreadsheet is loaded

var WC_LAT = 37.9;   //Walnut Creek's latitude
var WC_LNG = -122.1; //Walnut Creek's longitude
var map;
//Icon images from: https://icons8.com/
//Marker from default google maps icon
var icons = {
  approved: {
	residential: "https://i.imgur.com/Wzga1Yw.png",
	commercial: "https://i.imgur.com/Qss6H4r.png",
	community_facilities: "https://i.imgur.com/XJLAHXq.png",
  },
  under_construction: {
	residential: "https://i.imgur.com/lsfjpLp.png",
	commercial: "https://i.imgur.com/zk7guH9.png",
	community_facilities: "https://i.imgur.com/k03zcU4.png",
  },
  under_review: {
	residential: "https://i.imgur.com/JiGQuzV.png",
	commercial: "https://i.imgur.com/uVHczD5.png",
	community_facilities: "https://i.imgur.com/xPhK23H.png",
  }
};

function initMap() {
	console.log("initMap");
	map = new google.maps.Map(document.getElementById('map'), {
		zoom: 13,
		center: {
			lat: WC_LAT,
			lng: WC_LNG
		},
		mapTypeId: 'roadmap'
	});
	google.maps.event.addListener(map, "click", function(event) {
		if(recentWindow) {
			recentWindow.close();
		}
	});
}

var recentWindow;
function addMarker(latitude, longitude, information, status, type) {
	var infoWindow = new google.maps.InfoWindow({
		content: information
	});
	var marker = new google.maps.Marker({
		position: {
			lat: latitude,
			lng: longitude
		},
		icon: icons[status][type],
		map: map
	});

	marker.addListener('click', function() {
		if(recentWindow) {
			recentWindow.close();
		}
		infoWindow.open(marker.get('map'), marker);
		recentWindow = infoWindow;
		map.setZoom(16);
		map.panTo(marker.getPosition());
	});
}

function nearWC(lat, lng) {
	var dLat = Math.abs(lat - WC_LAT);
	var dLng = Math.abs(lng - WC_LNG);
	return dLat < 5 && dLng < 5;
}

function addMarkers(data) {
	var totalLat = 0, totalLng = 0, totalMarkers = 0;
	for(var row = 0; row < data.getNumberOfRows(); row++) {
		var lat = get(data, row, "latitude");
		var lng = get(data, row, "longitude");
		if (nearWC(lat, lng)) { //Make sure marker is near Walnut Creek
			totalLat += lat;
			totalLng += lng;
			totalMarkers += 1;
			var info = formatInfo(data, row);
			var status = get(data, row, "status").replace(/\s+/g, "_").toLowerCase();
			var type = get(data, row, "type").replace(/\s+/g, "_").toLowerCase();
			addMarker(lat, lng, info, status, type);
		}
	}
	map.setCenter({lat: totalLat/totalMarkers, lng: totalLng/totalMarkers});
}

function capitalize(str) {
	if(str) {
		return str[0].toUpperCase() + str.substr(1);
	}
	return "";
}

function formatInfo(data, row) {
	var info = "";
	var name = get(data, row, "projectName");
	var image = get(data, row, "imageURL");
	var status = capitalize(get(data, row, "status").toLowerCase());
	var type = capitalize(get(data, row, "type").toLowerCase());
	if(name) {
		info += "<b>" + name + "</b><br>";
	}
	if(image) {
		info += "<img src = " + image + " width = 200px height = auto><br>";
	}
	if(status) {
		info += "Status: " + status + "<br>";
	}
	if(type) {
		info += "Type: " + type + "<br>";
	}
	return info;
}
