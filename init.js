const line = require('line-by-line')
const fs = require('fs')

function readFileCSVAndParseToJSON() {
    let lr = new line('./data/Instagram visits clustering.csv',{
        encoding: 'utf8',
        start: 0
    })
    
    lr.on('error', function (err) {
        console.log(err)
    });
    
    let result =  []
    lr.on('line', function(line) {
        let string = line 
        let split = string.split(",")
        let obj = {}
        let userID = split[0]
        let visitScore = split[1]
        let spendingRank = split[2]
        
        obj = {
            userID,
            visitScore,
            spendingRank
        }
        result.push(obj)
    })
    
    lr.on('end', function () {
        fs.writeFileSync('./data/finalUser.json', JSON.stringify(result), {flag: 'w'})
    });
}

readFileCSVAndParseToJSON()