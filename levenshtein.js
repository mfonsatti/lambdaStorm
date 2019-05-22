const fs = require("fs");
const levenshtein = require("fast-levenshtein");
const { performance } = require("perf_hooks");

const wyJson = JSON.parse(fs.readFileSync("wyscout.json", "utf8"));
const tmJson = JSON.parse(fs.readFileSync("transfermarkt.json", "utf8"));
let wyElCounter = 0;

function calculateLev(acc, key) {
    const keyToCompare = ["name", "club"];
    if (keyToCompare.includes(key)) {
        let levenshteinDist = levenshtein.get(acc.wyElement[key], acc.tmElement[key]);
        acc.levenshteinAvg =
            acc.levenshteinAvg + levenshteinDist / 2; //keyToCompare.length;
        acc[key] = levenshteinDist;
    }
    return acc;
}

let t0 = performance.now();
let results = [];
Object.keys(wyJson).forEach(function(wyCountry) {
    let tmElToLoop = tmJson[wyCountry];
    let rows = wyJson[wyCountry].map(function(wyElement) {
        if (++wyElCounter % 100 === 0) {
            let t1 = performance.now();
            console.log(
                `Execution time after ${wyElCounter} elements: ${t1 -
                    t0} millisecond`
            );
            t0 = t1;
        }
        if (tmElToLoop) {
            let matches = tmElToLoop.map(function(tmElement) {
                let match = Object.keys(wyElement).reduce(calculateLev, {
                    tmElement,
                    wyElement,
                    levenshteinAvg: 0
                });
                return match;
            });
            return {
                wyElement,
                matches
            };
        }
    });
    //results.concat(rows);
});

fs.writeFile("results.json", JSON.stringify(results), err => {
    if (err) throw err;
    console.log("Saved");
});

// Object.keys(wyJson).forEach(country => {
//     tmJson[country].forEach(tmElement => {
//         let levenshteinDist = 0;
//         let row = {};
//         let counter = 0;
//         let levenshteinDistSum = 0;
//         Object.keys(tmElement).forEach(key => {
//             if (!keyToSkip.includes(key)) {
//                 counter++;
//                 wyJson[country].forEach(wyElement => {
//                     let maxLength =
//                         (wyElement[key].length > tmElement[key].length)
//                             ? wyElement[key].length
//                             : tmElement[key].length;
//                     levenshteinDist = Math.round(100 - (levenshtein.get(wyElement[key], tmElement[key]) * 100) / maxLength);
//                     levenshteinDistSum += levenshteinDist;
//                     row[key] = {
//                         wyData: wyElement[key],
//                         source: tmElement[key],
//                         levenshtein: `${levenshteinDist}%`
//                     };
//                     // console.log(wyElement[key]);
//                 });
//             }
//         });
//         row['avgLevenshteinPerRow'] = `${Math.round(levenshteinDistSum / counter)}%`;
//         results.push(row);
//         console.log(row);
//     });
// });
