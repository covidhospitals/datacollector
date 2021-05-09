

const NodeGeocoder = require('node-geocoder');
const fetch = require('node-fetch')


var BATCH_SIZE = 49;


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.collectLocations = async function collectLocations(url, state, existingData, addressKey) {
    if (!existingData) {
        existingData = {};
    }
    var finalResult = existingData;
    var data = await fetch(url).then(r => r.json())
    console.log('Total hospitals ', data.length);
    console.log('Existing locations ', Object.keys(existingData).length)
    var addresses = data.map(h => {
        var key = `${h.hospital_name}::${h.district}`;
        if (!!existingData[key]) {
            return;
        }
        var addr = h[addressKey || "hospital_address"];
        if (!addr) {
            addr = `${h.hospital_name}, ${h.district}, ${state}`
        }
        return {
            key: key,
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

    finalResult = addresses.reduce((result, current, idx) => {
        result[current.key] = geocodeResult[idx];
        return result;
    }, finalResult);
    console.log('Final Result ', Object.keys(finalResult).length)
    return finalResult;
}


