require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/ap-locations.json')
    var locationJSON = await collectLocations('https://covidaps.com/data/covidaps.com/bed_data.json', "Andhra Pradesh", exLocations);
    jsonfile.writeFile(__dirname + '/ap-locations.json', locationJSON)
}

collectData()