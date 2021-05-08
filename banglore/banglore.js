require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/bangalore-locations.json')
    var locationJSON = await collectLocations('https://covidbengaluru.com/data/covidbengaluru.com/bed_data.json', "Banglore", exLocations);
    jsonfile.writeFile(__dirname + '/bangalore-locations.json', locationJSON)
}

collectData()
