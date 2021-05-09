

require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = {}; // await jsonfile.readFile(__dirname + '/nashik-locations.json')
    var locationJSON = await collectLocations('https://covidnashik.com/data/covidnashik.com/bed_data.json', "Nashik", exLocations);
    jsonfile.writeFile(__dirname + '/nashik-locations.json', locationJSON)
}

collectData()
