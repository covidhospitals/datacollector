
const FormData = require('form-data');
var striptags = require('striptags');
var { parse } = require('node-html-parser');

const NodeGeocoder = require('node-geocoder');



const tabletojson = require('tabletojson').Tabletojson;

// tabletojson.convertUrl('https://coronabeds.jantasamvad.org/beds.html',
//     {
//         // got: {
//         //     method: "POST",
//         // }
//     },
//     function (tablesAsJson) {
//         console.log(tablesAsJson)
//     });

// tabletojson.convertUrl(
//     'http://dashboard.covid19.ap.gov.in/ims/hospbed_reports/process.php',
//     {
//         useFirstRowForHeadings: true,
//         countDuplicateHeadings: true,
//         stripHtmlFromCells: false,
//         got: {
//             method: 'POST',
//             body: form
//         }
//     },
//     function (tablesAsJson) {
//         var table = tablesAsJson[0];
//         table .forEach((row, idx) => {
//             if (idx == table.length - 1) {
//                 return;
//             }
//             if (row.District !== "District") {
//                 console.log(row)
//                 console.log(striptags(row.District));
//                 var ht = parse(row.District);
//                 var click = parse(row.District).firstChild.getAttribute("onclick")
//                 console.log(click.substr(click.lastIndexOf('=')+1, 3))



//             }
//         });
//     }
// );


// tabletojson.convertUrl(
//     `http://dashboard.covid19.ap.gov.in/ims/hospbed_reports/process.php?district=519&hospdata=1`,
//     {
//         useFirstRowForHeadings: true,
//         countDuplicateHeadings: true,
//         stripHtmlFromCells: false
//     },
//     function (tablesAsJson) {
//         var table = tablesAsJson[0];
//         table .forEach((row, idx) => {
//             if (idx <= 1 || idx == table.length - 1) {
//                 // Skip header and total row
//                 return;
//             }
//             // if (row.District !== "District") {
//             //     console.log(row)
//             //     console.log(striptags(row.District));
//             //     var ht = parse(row.District);
//             //     var click = parse(row.District).firstChild.getAttribute("onclick")
//             //     console.log(click.substr(click.lastIndexOf('=')+1, 3))
//             // }
//             var details = {
//                 name: "Hospital",
//                 phoneNumber: row["Hospital Number"],
//                 otherDetails: `Aarogyasri Empanelment status: ${row["Aarogyasri Empanelment status"]}`,
//                 general: {
//                     total: row["10"],
//                     occupied: row["11"],
//                     available: row["12"],
//                 },
//                 icu: {
//                     total: row["ICU Beds"],
//                     occupied: row["O2 General Beds"],
//                     available: row["General Beds"],
//                 },
//                 o2: {
//                     total: row["Ventilator"],
//                     occupied: row["8"],
//                     available: row["9"],
//                 },
//                 Ventilators: row["13"]
//             }
//             console.log(details);
//         });
//     }
// );


const options = {
    provider: 'google',

    // Optional depending on the providers
    // fetch: customFetchImplementation,
    apiKey: 'AIzaSyBwRp1e12ec1vOTtGiA4fcCt2sCUS78UYc', // 'AIzaSyBXaBrugij8OryGNqGG0-gyDHCeFwgmO9E', // for Mapquest, OpenCage, Google Premier
    formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

const res = geocoder.geocode({
    address: 'AH KUPPAM, Chittoor, Andhra Pradesh',
    countryCode: 'IN',
    limit: 1
});

res.then(function(result) {
    console.log('RESULT ', result)
})