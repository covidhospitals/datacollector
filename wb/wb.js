require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/wb-locations.json')
    var locationJSON = await collectLocations('https://covidwb.com/data/covidwb.com/bed_data.json', "West Bengal", exLocations);
    jsonfile.writeFile(__dirname + '/wb-locations.json', locationJSON)
}

collectData()
