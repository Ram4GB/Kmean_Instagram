/**
 * 
 * @param {*} data array data
 * @param {string} keyX 
 * @param {string} keyY 
 */
function convertArrayObjectToXY(data, keyX, keyY) {
	let array = []
	try {
		for(let i = 0 ; i < data.length; i++) {
			array.push({ x: data[i][keyX], y: data[i][keyY] })
		}
		return array
	} catch (error) {
		console.log('convertArrayObjectToXY', error)
	}
}


function cleanUpData(data) {
	// remove id, Timestamp
	for(let i = 0; i < data.length; i++) {
		// delete data[i].id;
		delete data[i].CustomerID;
		delete data[i].Gender;
		delete data[i].Age;
	}
	
	// for(let i = 0; i < data.length; i++) {
	//     data[i].Gender = data[i].Gender === 'Male' ? 0 : 1
	// }

	for(let i = 0; i < data.length; i++) {
		data[i].AnnualIncome = parseInt(data[i].AnnualIncome)
		data[i].SpendingScore = parseInt(data[i].SpendingScore)
	}
}

// euclidean
function distance(x, y, excludeKeys) {
	// (xv1 - yv1)^2 + (xv2 - yv2)^2 + (xv3 - yv3)^2 = dij^2
	let sum = 0;
	Object.keys(x).forEach(key => {
		if(excludeKeys.indexOf(key) === -1) {
			sum += Math.pow(Math.abs(x[key] - y[key]), 2)
		}
	})
	// console.log('x', x, 'y' , y)
	// console.log(sum)
	return Math.sqrt(sum)
}

// mahattan
// function distance(x, y, excludeKeys) {
//     // (xv1 - yv1) + (xv2 - yv2) + (xv3 - yv3) = dij
//     let sum = 0;
//     Object.keys(x).forEach(key => {
//         if(excludeKeys.indexOf(key) === -1) {
//             sum += Math.abs(x[key] - y[key])
//         }
//     })
//     // console.log('x', x, 'y' , y)
//     // console.log(sum)
//     return Math.sqrt(sum)
// }

/**
 * 
 * @param {*} k number of group
 */
function createArrayTwoDemension(k) {
	let array = []
	for(let i = 0 ; i < k ; i++) {
		array.push([])
	}
	return array
}

function copyObjectWithDefaultValue(object) {
	let o = {}
	Object.keys(object).map(key => {
		if(typeof object[key] === 'number') {
			o[key] = 0
		}
	})
	return o
}

function groupBy(data, followingKey) {
	let obj = {}
	for(let i = 0 ; i < data.length; i++) {
		if(!obj[data[i][followingKey]]) {
			obj[data[i][followingKey]] = [data[i]]
		} else {
			obj[data[i][followingKey]].push(data[i])
		}
	}

	return Object.keys(obj).map(key => {
		return obj[key].map(i => i)
	})
}

function addIndexData(data) {
	// if does not exists id in data
	// append id to data
	if(!data[0].id) {
		for(let i = 0 ; i < data.length; i++) {
			data[i]["id"] = i
		}
	}
	return data
}

function removeKeyInArray(data) {
	for(let i = 0 ; i < data; i++) {
		delete data[key]
	}
}

module.exports = {
	createArrayTwoDemension,
	distance,
	copyObjectWithDefaultValue
}
