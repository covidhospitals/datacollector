

require('dotenv').config()

var { collectLocations } = require('../shared')

const jsonfile = require('jsonfile')

async function collectData() {
    var exLocations = await jsonfile.readFile(__dirname + '/beed-locations.json')
    var locationJSON = await collectLocations('https://covidbeed.com/data/covidbeed.com/bed_data.json', "Beed", exLocations, "aaa");
    jsonfile.writeFile(__dirname + '/beed-locations.json', locationJSON)
}

collectData()
