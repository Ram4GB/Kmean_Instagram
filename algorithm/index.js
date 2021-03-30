const { createArrayTwoDemension, distance, copyObjectWithDefaultValue } = require('./utils.js')

function kmean(data, k, excludeKeys = []) {
	if(data.length <= 0) {
		throw new Error("missing data")
	}

	if(!k || isNaN(k)) {
		throw new Error("missing k")
	}
	
	if(k > data.length) {
		throw new Error("k is greater than data.length")
	}

	// Initialize centroids by first shuffling the dataset and then randomly selecting K data points for the centroids without replacement.
	// copy array from source array
	let arrayCentroid = []
	let copyArr = [...data]
	for(let i = 0 ; i < k; i ++) {
		// random index in copy array
		let index = Math.floor(Math.random() * copyArr.length); 
		// get item from  index in copy array
		arrayCentroid.push({...copyArr[index]})
		// delete that item in copy array
		copyArr = [
			...copyArr.slice(0, index),
			...copyArr.slice(index + 1)
		]
	}

	// console.log(JSON.stringify(arrayCentroid))
	// lưu tất cả id để kiểm tra trùng lần sau
	let m = 0
	let previousArrayId = []
	while(true) {
		// console.log('Time:  ', m)
		// save data into group centroid [[1,2,3], [4], [5,6], [7]]
		let groupArray = createArrayTwoDemension(k)
		
		for(let i = 0 ; i < data.length; i++) {
			// calculate distance between centroid (j) and current point (data[i])
			let arrayDistance = []
			for(let j = 0 ; j < k ; j++) {
				arrayDistance.push(distance(arrayCentroid[j], data[i], excludeKeys))
			}

			// find min distance between centroid (j) and current point (data[i])
			let min = arrayDistance[0]
			let minCentroidIndex = 0
			for(let j = 1 ; j < k ; j++) {
				if(min > arrayDistance[j]) {
					min = arrayDistance[j]
					minCentroidIndex = j
				}
			}
			// put data into group minCentroidIndex
			groupArray[minCentroidIndex].push(data[i])
		}

		// calculate new centroid
		for(let i = 0 ; i < k ; i ++) {
			// loop each k group centroid
			let tempCentroid = copyObjectWithDefaultValue(data[0]);
			// sum by key in groupArray
			for(let j = 0; j < groupArray[i].length; j++) {
				Object.keys(tempCentroid).forEach(key => {
					if(excludeKeys.indexOf(key) === -1) {
						tempCentroid[key] += groupArray[i][j][key]
					}
				})
			}
			// average by key in groupArray
			Object.keys(tempCentroid).forEach(key => {
				if(excludeKeys.indexOf(key) === -1) {
					tempCentroid[key] = tempCentroid[key] / groupArray[i].length
				}
			})

			// update centroid 
			arrayCentroid[i] = tempCentroid
		}

		// check differ pre and current array group
		let count = 0
		let currentArrayId = []
		for(let i = 0 ; i < k ; i++) {
			let mapId = groupArray[i].map(item => item.id)
			// previousArrayId[i] = undefined
			let p = previousArrayId[i] ? previousArrayId[i].sort().toString() : ""
			if(mapId.sort().toString() === p) {
				count++
			}
			currentArrayId.push(mapId)
		}

		if(count === k) {
			let distortion = 0
			let inertia = 0

			for(let m  = 0 ; m < k; m++) {
				for(let n = 0 ; n < groupArray[m].length; n ++) {
					// by default distortion is calculated by: total_distortion(sum of distance from cluster to respective cluster) / total_item
					// distortion = distortion + distance({ x: groupArray[m][n].x, y: groupArray[m][n].y }, arrayCentroid[m])
					distortion = distortion + Math.pow(distance(groupArray[m][n], arrayCentroid[m], excludeKeys), 2)
				}
			}

			inertia = distortion
			distortion = distortion / data.length

			return {
				groupArray,
				arrayCentroid,
				distortion: distortion,
				inertia: inertia
			}
		} else {
			previousArrayId = currentArrayId
		}
		m++
	}
}

function silhouette(groupArray) {
	let result = []
	groupArray.forEach((pointsCurrentCluster, indexCurrentCluster) => {
		// let arr = []
		for (let k = 0; k < pointsCurrentCluster.length; k++) {
			// chọn 1 con trong Ai ra
			let i = pointsCurrentCluster[k];
			// tính Ai hiện tại
			let Ai = 0;
			for (let m = 0; m < pointsCurrentCluster.length; m++) {
				if (m !== k) {
					j = pointsCurrentCluster[m];
					Ai += distance(i, j, ["userID"]);
				}
			}
			Ai = Ai / (pointsCurrentCluster.length - 1);
			let minBi = Infinity;
			for (let m = 0; m < groupArray.length; m++) {
				if (m !== indexCurrentCluster) {
					let pointOtherCluster = groupArray[m];
					let Bi = 0;
					for (let n = 0; n < pointOtherCluster.length; n++) {
						Bi += distance(i, pointOtherCluster[n], ["userID"]);
					}
					Bi = Bi / pointOtherCluster.length;
					if (Bi < minBi) {
						minBi = Bi;
					}
				}
			}
			let silhouetteValue = 0
			if(Ai < minBi) {
				silhouetteValue = 1 - Ai/minBi
			} else if(Ai === minBi) {
				silhouetteValue = 0
			} else {
				silhouetteValue = minBi/Ai - 1
			}
			if(silhouetteValue < 0) {
				console.log(silhouetteValue)
			}
			// arr.push(silhouetteValue)
			result.push(silhouetteValue)
		}
		// result.push(arr)
	});
	return result
}

module.exports = {
	kmean,
	silhouette
}

// kmean()

// 1. hỏi thầy cái dummy variable nếu dữ liệu dạng categorical
// 2. hỏi distortion phải công thức là [tổng của tất cả centroil [tổng của bình phương khoảng centroid với điểm thuộc centroid]]
// 3. nên chọn features như thế nào nếu như mà có trên 2 features để biểu diễn visualize
