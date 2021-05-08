require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/ts-locations.json')
    var locationJSON = await collectLocations('https://covidtelangana.com/data/covidtelangana.com/bed_data.json', "Telangana", exLocations);
    jsonfile.writeFile(__dirname + '/ts-locations.json', locationJSON)
}

collectData()
