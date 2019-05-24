const fs = require("fs");
const levenshtein = require("fast-levenshtein");
const { performance } = require("perf_hooks");

const wyJson = JSON.parse(fs.readFileSync("wy_competition.json", "utf8"));
const tmJson = JSON.parse(fs.readFileSync("tm_competition.json", "utf8"));
let wyElCounter = 0;

let t0 = performance.now();

const wyJsonKeys = Object.keys(wyJson);

let stream = fs.createWriteStream("results_competition.json");
let streamCSV = fs.createWriteStream("resultCSV_competition.csv");
stream.write("[");
streamCSV.write("wyElementId;wyElementName;bestId;bestName;bestLevenshteinDist;\n");

// function check(wyElement, tmElement, match, worst = null) {
//     if (wyElement.name === "Spvg Solingen-Wald 03") {
//         if (tmElement.name === "Spvg. Solingen-Wald 03") {
//             console.log(
//                 wyElement.name,
//                 tmElement.name,
//                 match.levenshteinDist,
//                 worst
//             );
//             return true;
//         }
//     }
// }

for (let i = 0; i < wyJsonKeys.length; i++) {
    let wyCountry = wyJsonKeys[i];

    let tmElToLoop = tmJson[wyCountry];

    for (let j = 0; j < wyJson[wyCountry].length; j++) {
        let wyElement = wyJson[wyCountry][j];
        if (++wyElCounter % 100 === 0) {
            let t1 = performance.now();
            console.log(
                `Execution time after ${wyElCounter} elements: ${t1 -
                    t0} millisecond`
            );
            t0 = t1;
        }
        if (tmElToLoop) {
            let matches = [];
            let worst = {
                levenshteinDist: -1,
                index: -1
            };

            let best = {
                levenshteinDist: 9999 
            };

            for (let x = 0; x < tmElToLoop.length; x++) {
                let tmElement = tmElToLoop[x];
                let wyElementKeys = Object.keys(wyElement);
                let length = wyElementKeys.length;
                const match = {
                    tmElement
                };
                for (let y = 0; y < length; y++) {
                    const key = wyElementKeys[y];
                    if (key === "name") {
                        let levenshteinDist = levenshtein.get(
                            wyElement[key],
                            tmElement[key]
                        );
                        match.levenshteinDist = levenshteinDist;
                    }
                }

                if (match.levenshteinDist < best.levenshteinDist) {
                    best.levenshteinDist = match.levenshteinDist;
                    best.id = match.tmElement.id;
                    best.name = match.tmElement.name;
                }

                if (matches.length < 10) {
                    if (match.levenshteinDist > worst.levenshteinDist) {
                        worst.levenshteinDist = match.levenshteinDist;
                        worst.index = matches.length;
                    }
                    matches.push(match);
                } else {
                    if (match.levenshteinDist < worst.levenshteinDist) {
                        matches[worst.index] = match;
                        worst = {
                            index: -1,
                            levenshteinDist: -1
                        };
                        for (let z = 0; z < matches.length; z++) {
                            if (
                                worst.levenshteinDist <
                                matches[z].levenshteinDist
                            ) {
                                worst.index = z;
                                worst.levenshteinDist = matches[z].levenshteinDist;
                            }   
                        }
                    }
                }
            }

            let dataToAppend = "";
            if (j != 0) {
                dataToAppend = ",";
            }

            dataToAppend += JSON.stringify({ wyElement, matches });

            stream.write(dataToAppend);
            streamCSV.write(`${wyElement.id};${wyElement.name};${best.id};${best.name};${best.levenshteinDist};\n`);
        }
    }

    if (i + 1 == wyJsonKeys.length) {
        stream.write("]");
    }
}

stream.end();
streamCSV.end();
