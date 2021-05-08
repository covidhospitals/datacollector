require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = {}; //await jsonfile.readFile(__dirname + '/vadodara-locations.json')
    var locationJSON = await collectLocations('https://covidbaroda.com/data/covidbaroda.com/bed_data.json', "Ahmedabad", exLocations);
    jsonfile.writeFile(__dirname + '/vadodara-locations.json', locationJSON)
}

collectData()
