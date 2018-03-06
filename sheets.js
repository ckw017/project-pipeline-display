//Queries the sheet and uses the info to build a table and populate the map

//If you add or remove rows, update this string to include the new column range
var queryString = 'range=A:O';
var URL =
	'https://docs.google.com/spreadsheets/d/1rLEvYFj8yigM6sn9IEaA28oqJoLhcla-urqGaM1Q_B0/gviz/tq?' +
	queryString;

//If you add or remove columns, update these values to reflect changes
var dataColumns = {
	workOrderNumber: 0, //indexing starts at 0
	status: 1,
	type: 2,
	projectName: 3,
	size: 4,
	numberOfUnits: 5,
	projectPlanner: 6,
	parcelNumber: 7,
	address: 8,
	latitude: 9,
	longitude: 10,
	architect: 11,
	email: 12,
	phone: 13,
	imageURL: 14
};

//Gives template for how each column should be constructed
var tableColumns = [{
		name: "<b>WORK<br>ORDER<br>NUMBER</b>",
		colSpan: 1,
		content: ["workOrderNumber"]
	},
	{
		name: "<b>PROJECT NAME<br>LOCATION<br>CONTACT</b>",
		colSpan: 4,
		//This column has multiple values in each cell
		content: ["projectName", "address", "architect", "phone",
			"email"
		]
	},
	{
		name: "<b>SITE SIZE<br>(in acres)</b>",
		colSpan: 1,
		content: ["size"]
	},
	{
		name: "<b>NUMBER AND TYPE OF UNITS</b>",
		colSpan: 4,
		content: ["numberOfUnits"]
	},
	{
		name: "<b>PROJECT PLANNER</b>",
		colSpan: 2,
		content: ["projectPlanner"]
	},
	{
		name: "<b>ASSESSOR'S<br>PARCEL NUMBER</b>",
		colSpan: 2,
		content: ["parcelNumber"]
	}
]

var table_width = 0;
for (var i = 0; i < tableColumns.length; i++) {
	table_width += tableColumns[i].colSpan;
}

var project_statuses = ["UNDER CONSTRUCTION", "APPROVED",
	"UNDER REVIEW"
];
var project_types = ["RESIDENTIAL", "COMMERCIAL",
	"COMMUNITY FACILITIES"
];

// Set a callback to run when the Google Visualization API is loaded.
google.charts.load('current', {
	'packages': ['corechart']
});
google.charts.setOnLoadCallback(drawTable);

function drawTable() {
	var query = new google.visualization.Query(URL);
	query.send(handleQueryResponse);
}

var map_data;
function handleQueryResponse(response) {
	console.log("handleQuery");
	var data = response.getDataTable();
	map_data = data;
	for (s = 0; s < project_statuses.length; s++) {
		for (t = 0; t < project_types.length; t++) {
			createTable(data, project_statuses[s], project_types[t]);
		}
	}
	addMarkers(data);
}

function createTable(data, project_status, project_type) {
	var body = document.body,
		tbl = document.createElement('table');
	createTableHead(tbl, project_status, project_type);
	for (var row = 0; row < data.getNumberOfRows(); row++) {
		if (get(data, row, "status") == project_status && get(data, row,
				"type") == project_type) {
			var tr = tbl.insertRow();
			for (var col = 0; col < tableColumns.length; col++) {
				var content = tableColumns[col].content;
				var td = document.createElement('td');
				td.colSpan = tableColumns[col].colSpan;
				td.innerHTML = getCellContents(data, tableColumns[col]
					.content, row);
				tr.appendChild(td);
			}
		}
	}
	body.appendChild(tbl);
	body.appendChild(document.createElement('br'));
}

function createTableHead(tbl, project_status, project_type) {
	var tr = tbl.insertRow();
	var title = document.createElement('th');
	title.colSpan = table_width;
	title.innerHTML = "<b>" + project_status + " - " + project_type +
		"</b>";
	tr.appendChild(title);
	tr = tbl.insertRow();
	for (var i = 0; i < tableColumns.length; i++) {
		var td = document.createElement('td');
		td.colSpan = tableColumns[i].colSpan;
		td.innerHTML = tableColumns[i].name;
		tr.appendChild(td);
	}
}

function get(data, row, columnName) {
	return data.getValue(row, dataColumns[columnName])
}

function getCellContents(data, contents, row) {
	var content = "";
	var first = true;
	for (var i = 0; i < contents.length; i++) {
		var value = get(data, row, contents[i]);
		if (value) {
			if (!first) {
				content += "<br>";
			}
			content += get(data, row, contents[i]);
			first = false;
		}
	}
	return content;
}