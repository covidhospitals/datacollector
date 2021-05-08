require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/pune-locations.json')
    var locationJSON = await collectLocations('https://covidpune.com/data/covidpune.com/bed_data.json', "Pune", exLocations);
    jsonfile.writeFile(__dirname + '/pune-locations.json', locationJSON)
}

collectData()
