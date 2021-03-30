let original = {};
let kmean = {};
let dataGroupKmean = {};
let colors = [
	"#ff6384",
	"#36a2eb",
	"#cc65fe",
	"#ffce56",
	"#bedcfa",
	"#98acf8",
	"#da9ff9",
	"#c7cfb7",
	"#ecb390",
	"#6ddccf",
];

$(document).ready(async function () {
	draw()
});

async function draw(k) {
	Chart.defaults.global.defaultFontFamily = "Nunito Sans";
	original = await new Promise((resolve) => {
		$.getJSON("./data/original.json", function (data) {
			resolve(data);
		});
	});

	initialKmean = await new Promise((resolve) => {
		$.getJSON("./data/initialKmean.json", function (data) {
			resolve(data);
		});
	});

	kmean = await new Promise((resolve) => {
		$.getJSON("./data/kmean.json", function (data) {
			resolve(data);
		});
	});

	// console.log('original', original)
	// console.log('initialKmean', initialKmean)
	// console.log('kmean', kmean)
	// =======================================================================
	// mô tả dữ liệu
	moTaDuLieu()
	// =======================================================================
	// Mô tả Thuộc tính của từng loại dử liệu
	moTaThuocTinhBangTable()
	// =======================================================================
	// Mô tả Thuộc tính của từng loại dử liệu bằng chart
	moTaThuocTinhBangChart()
	// =======================================================================
	moTaDuLieuBanDauCacDiemBangChart()
	// =======================================================================
	moTaSilhoutte()
	// =======================================================================
	// distorion
	moTaDistrotion()
	// =======================================================================
	// inertia
	moTaInertia()
	// =======================================================================
	// tính kmean với k = 3 và hiển thị lên
	hienThiKetQuaCuoiCung()
}


function moTaSilhoutte() {
	let result = initialKmean["silhoutteResult"]
	new Chart(document.getElementById("silhouette"), {
		type: 'bar',
		data: {
			labels: Array.from({length: result.length}).map((i, index) => index),
			datasets: [
				{
					type: 'bar',
					label: "Silhoutte value",
					data: result,
					order: 2,
					backgroundColor: "blue"
				},
				{
					type: 'line',
					data: [{x: 0, y: 0.5}, {x: result.length - 1, y: 0.5}],
					order: 1,
					label: "Average",
					borderColor: "red"
				}
			]
		},
		options: {
			responsive: true,
			yAxes: [
				{
					display: true,
					sticks: {
						suggestedMin: -1, //min
                        suggestedMax: 1 //max 
					}
				}
			]
		}
	})
}

function moTaDuLieuBanDauCacDiemBangChart() {
	let array = [];
	for (let i = 0; i < original["data"].length; i++) {
		array.push({
			x: original["data"][i]["visitScore"],
			y: original["data"][i]["spendingRank"],
		});
	}
	new Chart(document.getElementById("originalScatter"), {
		type: "scatter",
		data: {
			datasets: [
				{
					label: "points",
					data: array,
				},
			],
		},
		options: {
			scales: {
				xAxes: [
					{
						type: "linear",
						position: "bottom",
						scaleLabel: {
							labelString: "Visit Score",
							display: true,
						},
						ticks: {
							stepSize: 0.5,
							// autoSkip: true,
						},
					},
				],
				yAxes: [
					{
						type: "linear",
						scaleLabel: {
							labelString: "Spending score",
							display: true,
						},
						ticks: {
							stepSize: 0.5,
							// autoSkip: true,
						},
					},
				],
			},
			responsive: false,
		},
	});
}

function moTaThuocTinhBangChart() {
	let s = `<div class='row'>`;
	Object.keys(original["descriptData"]).forEach((attribute) => {
		if (attribute !== "id") {
			s += `<div class='col-6'>
			  <h3 style="text-align: center">${attribute}</h3><canvas width="500" id="${attribute}_chart"></canvas> 
			</div>`;
		}
	});
	s += "</div>";
	document.getElementById("section4").innerHTML = s;
	Object.keys(original["descriptData"]).forEach((attribute) => {
		if (attribute !== "id") {
			let ctx = document.getElementById(attribute + "_chart");
			new Chart(ctx, {
				type: "bar",
				data: {
					labels: original["descriptData"][attribute]["data"].map(
						(item, index) => index
					),
					datasets: [
						{
							data: original["descriptData"][attribute][
								"data"
							].sort((a, b) => a - b),
							// data: original["descriptData"][attribute]["data"],
							backgroundColor: "blue",
							label: attribute,
						},
					],
				},
			});
		}
	});
}

function moTaDuLieu() {
	var moTaDuLieuCtx = document.getElementById("moTaDuLieu");

	moTaDuLieuCtx.innerHTML = `<p>Dữ liệu ban đầu: ${original["countItemOriginal"]} Dòng</p>
							 <p>Dữ liệu sau khi chúng ta xử lý trùng: ${original["countItemKmeanData"]} Dòng</p>`;
}

function moTaThuocTinhBangTable() {
	let data = original["descriptData"];
	let s = "";
	s += `
  <table cellspacing="0px" cellpadding="5px">
  <tr>
	<td>Thuộc tính</td>
	<td>max</td>
	<td>min</td>
	<td>mean</td>
	<td>null</td>
  </tr>`;

	Object.keys(data).forEach((key) => {
		if (key !== "class") {
			s += `<tr>
			<td><b>${key}</b></td>
			<td>${data[key]["max"]}</td>
			<td>${data[key]["min"]}</td>
			<td>${data[key]["mean"]}</td>
			<td>${data[key]["null"]}</td>
		  <tr>`;
		}
	});
	s += "</table>";
	document.getElementById("section2").innerHTML = s;
}

function moTaInertia() {
	let data = initialKmean["inertias"];
	let ctx = document.getElementById("inertia");
	new Chart(ctx, {
		type: "line",
		data: {
			labels: data.map((item) => `k = ${item.k}`),
			datasets: [
				{
					label: "inertia",
					data: data.map((item) => item.inertia),
				},
			],
		},
		options: {
			scales: {
				yAxes: [
					{
						stacked: true,
					},
				],
			},
			responsive: false,
		},
	});
}

function moTaDistrotion() {
	let data = initialKmean["distortions"];
	let ctx = document.getElementById("distortions");
	new Chart(ctx, {
		type: "line",
		data: {
			labels: data.map((item) => `k = ${item.k}`),
			datasets: [
				{
					label: "distorion",
					data: data.map((item) => item.distortion),
				},
			],
		},
		options: {
			scales: {
				yAxes: [
					{
						stacked: true,
					},
				],
			},
			responsive: false,
		},
	});
}

function hienThiKetQuaCuoiCung() {
	let ctx = document.getElementById("kmean");
	let groupArray = kmean["groupArray"];
	let arr = [];

	let a = "visitScore";
	let b = "spendingRank";

	for (let i = 0; i < groupArray.length; i++) {
		let obj = {
			data: [],
			pointBackgroundColor: colors[i],
			backgroundColor: colors[i],
			label: "Label " + i,
			// borderWidth: 1,
			borderColor: colors[i],
			order: 1,
			fill: false,
		};

		for (let j = 0; j < groupArray[i].length; j++) {
			obj.data.push({
				x: groupArray[i][j][a],
				y: groupArray[i][j][b],
			});
		}
		arr.push(obj);
	}

	let arrayCentroid = [];
	for (let i = 0; i < kmean["arrayCentroid"].length; i++) {
		arrayCentroid.push({
			x: kmean["arrayCentroid"][i][a],
			y: kmean["arrayCentroid"][i][b],
		});
	}
	new Chart(ctx, {
		type: "scatter",
		data: {
			datasets: [
				...arr,
				{
					data: arrayCentroid,
					pointBackgroundColor: "red",
					backgroundColor: "red",
					label: kmean["arrayCentroid"].map(
						(centroid, index) => `Centroid ${index}`
					),
					// borderWidth: 1,
					borderColor: "red",
					order: 0,
				},
			],
		},
		options: {
			scales: {
				xAxes: [
					{
						type: "linear",
						position: "bottom",
						scaleLabel: {
							labelString: "Visit score",
							display: true,
						},
						ticks: {
							stepSize: 1,
							// autoSkip: true,
						},
					},
				],
				yAxes: [
					{
						type: "linear",
						scaleLabel: {
							labelString: "Spending rank",
							display: true,
						},
						ticks: {
							stepSize: 1,
							// autoSkip: true,
						},
					},
				],
			},
			responsive: false,
		},
	});
}
