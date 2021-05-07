const fetch = require('node-fetch')
const jsonfile = require('jsonfile')

// eslint-disable-next-line
function fetchDelhiHospitals() {
    return Promise.all(
        [fetch('https://coronabeds.jantasamvad.org/covid-facilities.js', { mode: 'no-cors' }).then(r => r.text()),
        fetch('https://coronabeds.jantasamvad.org/covid-info.js', { mode: 'no-cors' }).then(r => r.text())]
    ).then((responses) => {
        let [hData, bData] = responses;
        hData = hData.replace('var gnctd_covid_facilities_data =', '').replace('};', '}')
        hData = JSON.parse(hData)
        bData = bData.replace('var gnctd_covid_data =', '').replace('};', '}')
        bData = JSON.parse(bData);

        var allHospitals = []
        for (let hName of Object.keys(hData)) {
            let hValue = hData[hName];
            let locationLink = hValue.location;
            if (!locationLink) {
                continue;
            }
            let locIdx = locationLink.indexOf('/@'),
                startIdx = locIdx + 2,
                latLong = locationLink.substring(startIdx, startIdx + 21).split(",");
            if (locIdx < 0) {
                continue;
            }
            // bData.beds[hName];
            var general = {}, icu = {}, o2 = {};
            if (bData.beds[hName]) {
                general = {
                    total: bData.beds[hName].total,
                    occupied: bData.beds[hName].occupied,
                    available: bData.beds[hName].vacant
                }
            }
            if (bData.covid_icu_beds[hName]) {
                icu = {
                    total: bData.covid_icu_beds[hName].total,
                    occupied: bData.covid_icu_beds[hName].occupied,
                    available: bData.covid_icu_beds[hName].vacant
                }
            }
            if (bData.oxygen_beds[hName]) {
                o2 = {
                    total: bData.oxygen_beds[hName].total,
                    occupied: bData.oxygen_beds[hName].occupied,
                    available: bData.oxygen_beds[hName].vacant
                }
            }

            allHospitals.push({
                name: hName,
                type: hValue.type,
                phoneNumber: hValue.contact_numbers,
                general: general,
                o2: o2,
                icu: icu,
                location: {
                    formattedAddress: hValue.address,
                    link: hValue.location,
                    latitude: latLong[0],
                    longitude: latLong[1],
                }
            })
        }
        return {
            lastUpdatedAt: bData.last_updated_at,
            stateOrLocality: "Delhi",
            source: "https://coronabeds.jantasamvad.org/",
            hospitals: allHospitals
        }
    })
}


fetchDelhiHospitals().then(result => {
    jsonfile.writeFile("delhi-hospitals-06052021.json", result);
}, err => {
    console.log("ERROR ", err)
})