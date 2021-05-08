require('dotenv').config()

const jsonfile = require('jsonfile')

const NodeGeocoder = require('node-geocoder');
const fetch = require('node-fetch')


var BATCH_SIZE = 49;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function collectTSLocations() {
    var data = await fetch('https://covidaps.com/data/covidaps.com/bed_data.json').then(r => r.json())
    console.log('Total hospitals ', data.length);
    var addresses = data.map(h => {
        var addr = h.hospital_address;
        if (!addr) {
            addr = `${h.hospital_name}, ${h.district}, Andhra Pradesh`
        }
        return {
            key: `${h.hospital_name}::${h.district}`,
            address: addr
        }
    }).filter(d => !!d);
    console.log('Total hospitals addresses ', addresses.length);

    const geocoder = NodeGeocoder({
        provider: 'google',
        apiKey: process.env.MAP_API_KEY,
    });

    let geocodeResult = []

    let index = 0;
    for (; index < (addresses.length) / BATCH_SIZE;) {
        let startIndex = index * BATCH_SIZE;
        const batch = addresses.slice(startIndex, startIndex + BATCH_SIZE);

        console.log(`Fetching locations of ${startIndex} to ${startIndex + BATCH_SIZE} hospitals. Size: ${batch.length}`)
        var batchLocationQuery = batch.map(a => ({
            address: a.address,
            country: "India",
            limit: 1
        }))

        const res = await geocoder.batchGeocode(batchLocationQuery);
        var locations = res.map(r => {
            if (r.error) {
                console.log('Location error ', r.error)
                return;
            }
            return r.value[0];
        }).filter(l => !!l)
        console.log(`Locations identified ${locations.length}`)

        geocodeResult = geocodeResult.concat(locations)
        index++
        await sleep(2000);
    }

    console.log('geocodeResult length ', geocodeResult.length);

    var locationJSON = addresses.reduce((result, current, idx) => {
        result[current.key] = geocodeResult[idx];
        return result;
    }, {});
    jsonfile.writeFile(__dirname + '/ap-locations.json', locationJSON)
}

collectTSLocations()