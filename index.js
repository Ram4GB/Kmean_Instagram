let data = require("./data/finalUser.json");
const { kmean, silhouette } = require("./algorithm/index.js");
const _ = require("lodash");
const fs = require('fs');
const { distance } = require("./algorithm/utils");

function describeOneClass(arrayItem, attributes) {
    let obj = {};
    let data  = []
    for (let i = 0; i < attributes.length; i++) {
        let max = _.maxBy(arrayItem, function (o) {
            return o[attributes[i]];
        });
        let min = _.minBy(arrayItem, function (o) {
            return o[attributes[i]];
        });
        let mean = _.meanBy(arrayItem, function (o) {
            return o[attributes[i]];
        });

        let nullValue = arrayItem.reduce((accumulator, currentValue) => { 
            if(currentValue[attributes[i]] === null) {
                accumulator = accumulator + 1
            }
            return accumulator
        }, 0)

        data = arrayItem.map(item => item[attributes[i]])

        obj[attributes[i]] = {
            max: max[attributes[i]],
            min: min[attributes[i]],
            mean: mean,
            null: nullValue,
            data
        };
    }
    return obj;
}

function describe(data) {
    let result = describeOneClass(data, [
        "visitScore",
        "spendingRank"
    ])
    return result
}

function mainProcess(k) {
    data = data.map(item => {
        return ({
            "userID": item.userID,
            "visitScore": parseInt(item.visitScore),
            "spendingRank": parseFloat(item.spendingRank)
        })
    })

    // console.log(data.length)

    // tính toán min, max, mean, null của dataset
    let descriptData = describe(data)

    // đếm số lượng dữ liệu ban đầu
    let countItemOriginal = data.length

    // chúng ta sẽ xử lý dữ liệu đầu vào
    trainData = _.uniqWith(data, function(arr, other) {
        return arr.visitScore === other.visitScore && arr.spendingRank === other.spendingRank
    })

    trainData = trainData.filter(item => {
        return item.visitScore >= 0 && item.visitScore <= 100 && item.spendingRank >= 0 && item.spendingRank <= 100
    })

    // console.log(trainData)
    // console.log('unique data', trainData.length)

    // tính giá trị distortion và inertia của k từ 1 cho đến 10
    let distortions = []
    let inertias = []
    for(let i = 1; i <= 10; i++) {
        let r = kmean(trainData, i, [
                "userID",
                // "visitScore",
                // "spendingRank"
            ]);

        distortions.push({
            k: i,
            distortion: r.distortion
        })
        inertias.push({
            k: i,
            inertia: r.inertia
        })
    }

    // sau khi có k xong chúng ta thực hiện dùng k đó để thực hiện phân cụm
    result = kmean(trainData, k, [
            "userID",
            // "visitScore",
            // "spendingRank"
        ])

    // tính toán lại silhoutte của giá trị k
    let silhoutteResult = silhouette(result.groupArray)

    fs.writeFileSync('./data/train.json', JSON.stringify(trainData))
    // tính toán tổng số data point trong dữ liệu
    let countItemKmeanData = trainData.length

    // lưu vào file
    fs.writeFileSync('./data/original.json', JSON.stringify({
        countItemOriginal,
        countItemKmeanData,
        descriptData,
        data
    }), { flag: 'w' })

    // lưu tất cả kết quả của kmean
    fs.writeFileSync('./data/initialKmean.json', JSON.stringify({
        distortions,
        inertias,
        silhoutteResult
    }), { flag: 'w' })

    fs.writeFileSync('./data/kmean.json', JSON.stringify({
        groupArray: result.groupArray,
        arrayCentroid: result.arrayCentroid,
        distortion: result.distortion,
    }), { flag: 'w' })
}

// let r = mainProcess(8)
// console.log('Done')

function demoSmallData() {
    let x = [3, 1, 1, 2, 1, 6, 6, 6, 5, 6, 7, 8, 9, 8, 9, 9, 8]
    let y = [5, 4, 5, 6, 5, 8, 6, 7, 6, 7, 1, 2, 1, 2, 3, 2, 3]

    let arrayPoint = []
    for(let i = 0 ; i < 17; i++) {
        arrayPoint.push({x: x[i], y: y[i]})
    }


    console.log("Tập dữ liệu ban đầu")
    console.table(arrayPoint)

    let result = kmean(arrayPoint, 2, [])
    
    console.log(result.arrayCentroid)
    console.log('inertia', result.inertia)
    console.log("Tập dữ liệu sau khi dùng kmean")
    console.table(result.groupArray)

    let sum = 0
    for(let i = 0 ; i < result.groupArray[0].length; i++) {
        sum += Math.pow(distance(result.groupArray[0][i], result.arrayCentroid[0], []), 2)
        // sum += distance(result.groupArray[0][i], result.arrayCentroid[0], [])
    }
    console.log(sum)

    sum = 0
    for(let i = 0 ; i < result.groupArray[1].length; i++) {
        sum += Math.pow(distance(result.groupArray[1][i], result.arrayCentroid[1], []), 2)
        // sum += distance(result.groupArray[1][i], result.arrayCentroid[1], [])
    }
    console.log(sum)

    console.log(result.distortion)
}

demoSmallData()