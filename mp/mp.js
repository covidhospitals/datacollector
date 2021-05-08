

require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/mp-locations.json')
    var locationJSON = await collectLocations('https://covidmp.com/data/covidmp.com/bed_data.json', "Madhya Pradesh", exLocations);
    jsonfile.writeFile(__dirname + '/mp-locations.json', locationJSON)
}

collectData()
