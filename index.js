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

let r = mainProcess(5)
console.log('Done')

function demoSmallData() {
    let arrayPoint = [
        { x: 3, y: 5 },
        { x: 1, y: 4 },
        { x: 1, y: 5 },
        { x: 2, y: 6 },
        { x: 8, y: 8 },
        { x: 7, y: 6 },
        { x: 6, y: 7 },
        { x: 5, y: 6 }
    ]

    // let xC = 6.5
    // let yC = 6.75
    // arrayPoint.forEach(item=>{
    //     console.log(item)
    //     console.log(Math.sqrt(Math.pow(item.x - xC, 2) + Math.pow(item.y - yC, 2)))
    // })

    console.log("Tập dữ liệu ban đầu")
    console.log(arrayPoint)

    let result = kmean(arrayPoint, 2, [])
    
    console.log(result.arrayCentroid)
    console.log('inertia', result.inertia)
    console.log("Tập dữ liệu sau khi dùng kmean")
    console.log(result.groupArray)

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

// demoSmallData()

// •	Bước 1: Chỉ định ra số lượng K clsuters
// •	Bước 2: Khởi tạo các điểm centroid bằng việc trộn tất cả dataset và lấy ngẫu nhiên ra K điểm data points làm centroid.
// •	Bước 3: Tính khoảng cách giữa centroid và datapoint. Sau đó, gán data point với cluster gần nhất (centroid).
// •	Bước 4: Tính toán lại tất cả centroid bằng việc tính trung bình cộng của tất cả data point mà những điểm thuộc mỗi cluster.
// •	Bước 5: Lặp cho đến khi không có sự thay đổi giữa các centroid (những điểm data point được gán tới clusters không bị thay đổi)
// •	Bước 6: Nếu phần tử của bất kì clusters nào đó không bị đổi thì dừng thuật toán, nếu không thì tiếp tục bước 3.
// •	Bước 7: Tính trung bình của bình phương khoảng cách giữa datapoints và centroid – Distortion (Có nghĩa là trước hết với một cụm, tính tổng bình phương khoảng cách từ centroid với các điểm thuộc về centroid đó, làm tương tự với những cluster khác, cuối cùng thì chúng ta sẽ chia cho tổng số lượng tất cả datapoint. Một cluster sẽ có 1 centroid và nhiều datapoint của cluster đó, chọn 2C1 để tính khoảng cách thì sẽ có n trường hợp. Ví dụ: cluster1 (n1 trường hợp), cluster 2 (n2 trường hợp), cluster 3 (n3 trường hợp) thì cuối cùng cũng bằng với tổng số lượng datapoints).
