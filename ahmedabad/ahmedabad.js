require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/ahmedabad-locations.json')
    var locationJSON = await collectLocations('https://covidamd.com/data/covidamd.com/bed_data.json', "Ahmedabad", exLocations);
    jsonfile.writeFile(__dirname + '/ahmedabad-locations.json', locationJSON)
}

collectData()
