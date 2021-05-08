

require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/gandhinagar-locations.json')
    var locationJSON = await collectLocations('https://covidgandhinagar.com/data/covidgandhinagar.com/bed_data.json', "Gandhinagar, Gujarat", exLocations);
    jsonfile.writeFile(__dirname + '/gandhinagar-locations.json', locationJSON)
}

collectData()
