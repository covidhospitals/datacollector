var fs = require('fs');
var striptags = require('striptags');
var { parse } = require('node-html-parser');
const tabletojson = require('tabletojson').Tabletojson;
const jsonfile = require('jsonfile')

var _ = require('lodash');



const NodeGeocoder = require('node-geocoder');

const BATCH_SIZE = 90;

function fetchData(url, options) {
    options = Object.assign({
        useFirstRowForHeadings: true,
        countDuplicateHeadings: true,
        stripHtmlFromCells: false
    }, options)


    return tabletojson.convertUrl(
        url,
        options
    )
}

function parseDistrictData(tablesAsJson) {
    var result = [];
    var table = tablesAsJson[0];
    table.forEach((row, idx) => {
        if (idx <= 1 || idx == table.length - 1) {
            // Skip header and total row
            return;
        }
        var districtName, districtId
        if (row.District !== "District") {
            districtName = striptags(row.District);
            var click = parse(row.District).firstChild.getAttribute("onclick")
            districtId = click.substr(click.lastIndexOf('=') + 1, 3)
        }
        var details = {
            district: districtName,
            districtId: districtId,
            totalHospitals: row["No.of Hospitals"],
            general: {
                total: row["10"],
                occupied: row["11"],
                available: row["12"],
            },
            icu: {
                total: row["ICU Beds"],
                occupied: row["O2 General Beds"],
                available: row["General Beds"],
            },
            o2: {
                total: row["Ventilator"],
                occupied: row["8"],
                available: row["9"],
            },
            Ventilators: row["Ventilator"]
        }
        result.push(details);
    });
    return result;
}

function parseHospitalData(tablesAsJson) {
    var result = [];
    var table = tablesAsJson[0];
    table.forEach((row, idx) => {
        if (idx <= 1 || idx == table.length - 1) {
            // Skip header and total row
            return;
        }
        var details = {
            name: row["Hospital"],
            phoneNumber: row["Hospital Number"],
            otherDetails: `Aarogyasri Empanelment status: ${row["Aarogyasri Empanelment status"]}`,
            general: {
                total: row["10"],
                occupied: row["11"],
                available: row["12"],
            },
            icu: {
                total: row["ICU Beds"],
                occupied: row["O2 General Beds"],
                available: row["General Beds"],
            },
            o2: {
                total: row["Ventilator"],
                occupied: row["8"],
                available: row["9"],
            },
            Ventilators: row["13"]
        }
        result.push(details);
    });
    return result;
}

async function getHospitalData() {
    console.log('Fetching district wise hospital data..')
    var allDistrictData = await fetchData("http://dashboard.covid19.ap.gov.in/ims/hospbed_reports/process.php?districtGraph=1").then(parseDistrictData)
    var allHospitalsData = [];

    for await (let districtData of allDistrictData) {
        console.log(`Fetching hospital data of ${districtData.district} ...`);
        var dtHospitalData = await fetchData(`http://dashboard.covid19.ap.gov.in/ims/hospbed_reports/process.php?district=${districtData.districtId}&hospdata=1`).then(parseHospitalData);
        dtHospitalData.forEach(dt => {
            dt.district = districtData.district;
        });
        console.log(`Completed fetching hospital data of ${districtData.district}.`);
        allHospitalsData = allHospitalsData.concat(dtHospitalData);
    }
    return allHospitalsData;
}

async function collectHospitalData() {
    var allHospitals = await getHospitalData()
    jsonfile.writeFile("ap-hospitals.json", {
        time: new Date(),
        hospitals: allHospitals
    });
}

async function collectionHospitalLocations() {

    const options = {
        provider: 'mapquest',

        // Optional depending on the providers
        // fetch: customFetchImplementation,
        apiKey: process.env.MAP_API_KEY, // for Mapquest, OpenCage, Google Premier
        formatter: null // 'gpx', 'string', ...
    };

    const geocoder = NodeGeocoder(options);

    var hospitalFile = await jsonfile.readFile("ap-hospitals.json")
    var allHospitals = hospitalFile.hospitals;
    console.log(`Total hospitals ${allHospitals.length}`)
    var allHospitalsWithLocation = [];
    let index = 0;
    for (; index < (allHospitals.length) / BATCH_SIZE;) {
        let startIndex = index * BATCH_SIZE;
        const batch = allHospitals.slice(startIndex, startIndex + BATCH_SIZE);

        console.log(`Fetching locations of ${startIndex} to ${startIndex + BATCH_SIZE} hospitals. Size: ${batch.length}`)
        var batchLocationQuery = batch.map(h => {
            return {
                address: `${h.name}, ${h.district}, Andhra Pradesh`,
                countryCode: 'IN',
                limit: 1
            }
        })

        const res = await geocoder.batchGeocode(batchLocationQuery);
        var locations = res.map(r => {
            return r.value[0];
        })
        console.log(`Locations identified ${locations.length}`)

        batch.forEach((b, idx) => {
            b.location = locations[idx]
        });

        allHospitalsWithLocation = allHospitalsWithLocation.concat(batch);
        index++
    }

    jsonfile.writeFile("ap-hospitals-locations.json", {
        time: new Date(),
        hospitals: allHospitalsWithLocation
    });

}

// collectHospitalData()
// collectionHospitalLocations();


async function updateBeds() {
    var allHospitals = await getHospitalData();
    var updatedData = _.groupBy(allHospitals, 'name');

    var hospitalFile = await jsonfile.readFile("ap-hospitals-locations.json")

    var deletedHospitals = []

    console.log('ALL LATEST ', Object.keys(updatedData))

    var finalList = hospitalFile.hospitals.map(h => {
        var updated = updatedData[h.name];
        if (!updated) {
            deletedHospitals.push(updated)
        } else {
            delete updatedData[h.name];
            return _.extend(h, updated);
        }
    });

    console.log('DELETE HOSPITAL ', deletedHospitals);
    console.log('NEW HOSPITALS', updatedData);

    jsonfile.writeFile("ap-hospitals-locations-07052021.json", {
        lastUpdatedAt: new Date(),
        stateOrLocality: "Andhra Pradesh",
        source: "http://dashboard.covid19.ap.gov.in/",
        hospitals: finalList
    });
}

updateBeds();
