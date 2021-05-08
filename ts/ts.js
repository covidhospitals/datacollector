require('dotenv').config()

const jsonfile = require('jsonfile')

const NodeGeocoder = require('node-geocoder');
const fetch = require('node-fetch')


var BATCH_SIZE = 49;


// var json = tabletojson.convertUrl(
//     "http://164.100.112.24/SpringMVC/getHospital_Beds_Status_Citizen.htm?hospital=G",
//     {
//         useFirstRowForHeadings: true,
//         countDuplicateHeadings: true,
//         stripHtmlFromCells: false,
//         got: {
//             method: 'POST'
//         }
//     }, async r => {
//         var a = r[0]
//         var batch = a.slice(3, 5)
//         console.log('RESULT ', batch);

//         var batchLocationQuery = batch.map(h => {
//             return {
//                 address: `Bhadri, Srikakulam, Andhra Pradesh`,
//                 // countryCode: 'IN',
//                 country: 'India',
//                 limit: 1
//             }
//         })

//         console.log('QUER ', batchLocationQuery);


//         const options = {
//             provider: 'mapquest',

//             // Optional depending on the providers
//             // fetch: customFetchImplementation,
//             apiKey: process.env.MAP_API_KEY, // 'AIzaSyBXaBrugij8OryGNqGG0-gyDHCeFwgmO9E', // for Mapquest, OpenCage, Google Premier
//         };

//         console.log('options ', options)

//         const geocoder = NodeGeocoder(options);
//         const res = await geocoder.batchGeocode(batchLocationQuery);
//         var locations = res.map(r => {
//             return r.value[0];
//         });
//         console.log("LOCATIONS ", locations);
//     }
// )

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function collectTSLocations() {
    var data = await fetch('https://covidtelangana.com/data/covidtelangana.com/bed_data.json').then(r => r.json())
    console.log('Total hospitals ', data.length);
    var addresses = data.map(d => {
        return d.hospital_address;
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
            address: a,
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

        var locationJSON = batch.reduce((result, current, idx) => {
            result[current] = locations[idx];
            return result;
        }, {});

        jsonfile.writeFile('ts-locations.json', locationJSON)
        index++
        await sleep(2000);
    }

    console.log('geocodeResult length ', geocodeResult.length);

    var locationJSON = addresses.reduce((result, current, idx) => {
        result[current] = geocodeResult[idx];
        return result;
    }, {});
    jsonfile.writeFile('ts-locations.json', locationJSON)
}


async function testGeocoding() {

    const options = {
        provider: 'google',
        apiKey: process.env.MAP_API_KEY,
    };

    console.log('options ', options)

    const geocoder = NodeGeocoder(options);
    const res = await geocoder.geocode(
        {
            address: 'Bhadri, Srikakulam, Andhra Pradesh',
            country: "India",
            limit: 1
        }
    );
    // var locations = res.map(r => {
    //     return r.value[0];
    // });
    console.log("LOCATIONS ", res);

}


// testGeocoding();
collectTSLocations()