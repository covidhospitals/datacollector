

require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/tn-locations.json')
    var locationJSON = await collectLocations('https://covidtnadu.com/data/covidtnadu.com/bed_data.json', "Tamil Nadu", exLocations);
    jsonfile.writeFile(__dirname + '/tn-locations.json', locationJSON)
}

collectData()
