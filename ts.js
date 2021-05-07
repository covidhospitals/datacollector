require('dotenv').config()

const tabletojson = require('tabletojson').Tabletojson;



const NodeGeocoder = require('node-geocoder');



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


async function testGeocoding() {

    const options = {
        provider: 'mapquest',
        apiKey: process.env.MAP_API_KEY,
    };

    console.log('options ', options)

    const geocoder = NodeGeocoder(options);
    const res = await geocoder.batchGeocode([
        {
            address: 'Bhadri, Srikakulam, Andhra Pradesh',
            country: "India"
        }
    ]);
    var locations = res.map(r => {
        return r.value[0];
    });
    console.log("LOCATIONS ", locations);

}


testGeocoding();