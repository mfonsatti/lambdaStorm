const fs = require('fs');
const readline = require('readline');
const levenshtein = require('fast-levenshtein');
const faker = require('faker');
const { performance } = require('perf_hooks');



const csvToJson = (fileToReadPath,fileToCreatePath) => {
    let wyJson = {};
    let headersFlag = false;
    let headers = null;
    const rl = readline.createInterface({
        input: fs.createReadStream(fileToReadPath),
        crlfDelay: Infinity
    });

    rl.on('line', (line) => {
        line = line.replace(/\"/g,'');
        let row = line.split(",");
        if(!headersFlag){
            headers = row;
            headersFlag = true;
        } else {
            if(row[3] !== 'NULL'){
                if(!Array.isArray(wyJson[row[3]])){
                    wyJson[row[3]] = []; 
                };
                wyJson[row[3]].push({
                    [headers[0]]: row[0],
                    [headers[1]]: row[1],
                    [headers[2]]: row[2],
                    [headers[3]]: row[3]
                });
            }
        }
    });

    rl.on('close', () => {
        writeJson(fileToCreatePath,wyJson);
    });
};

const writeJson = (filePath, json) => {
    fs.writeFile(
        filePath,
        JSON.stringify(json),
        err => {
            if(err) throw err;
            console.log('json created!');
        }
    );
}

csvToJson('wyscout_teams.csv','wyscout.json');
csvToJson('transfermarkt_teams.csv', 'transfermarkt.json');


/////////////////////////////////////////////

// function lambdaTwo(string, filePath){
//     const rl = readline.createInterface({
//         input: fs.createReadStream('data.csv'),
//         crlfDelay: Infinity
//     });

//     rl.on('line', (line) => {
//         console.log(levenshtein.get(string,line));
//     });
// };

// lambdaTwo('row','data.cvs');

const wyData = [];
const sourceData = [];
const results = [];
// for (let index = 0; index < 3; index++) {
//     wyData.push({
//         firstName: faker.name.firstName(),
//         lastName: faker.name.lastName(),
//         city: faker.address.city(),
//         country: faker.address.country()
//     });
//     sourceData.push({
//         firstName: faker.name.firstName(),
//         lastName: faker.name.lastName(),
//         city: faker.address.city(),
//         country: faker.address.country(),

//     });
// }

wyData.push({
    id: 24,
    NAME: "Skånland IF",
    club: "Skånland",
    countryName: "Norway"
});
sourceData.push({
    id: 73777,
    NAME: "Skanland OIF",
    club: "Skanland OIF",
    countryName: "Norway"
});

let fieldsThatMatch = ['id'];

// console.log(wyData);
// console.log(sourceData);



const lambdaFromArray = (wyElement, sourceToCompare, fieldsThatMatch) => {
    let row = {};
    sourceToCompare.forEach(element => {
        let sum = 0;
        let counter = 0;
        let maxLength =0;
        let levenshteinDist=0;
        Object.keys(element).forEach(key => {
            if (key == 'test') {
                counter++;
                maxLength = (wyElement[key].length > element[key].length) ? wyElement[key].length : element[key].length;
                levenshteinDist = Math.round(100 - (levenshtein.get(wyElement[key], element[key]) * 100) / maxLength);
                sum += levenshteinDist;
                row[key] = {
                    wyData: wyElement[key],
                    source: element[key],
                    levenshtein: `${levenshteinDist}%`
                };
            }
        });
        row['avgLevenshteinPerRow'] = `${Math.round(sum / counter)}%`;
    });

    results.push(row);
}

const dataMapping = () => {
    wyData.forEach(element => {
        lambdaFromArray(element, sourceData, fieldsThatMatch);
    });
}

// setTimeout(() => {
//     console.log(results);
// }, 1000);
let t0 = performance.now();
//dataMapping();
let t1 = performance.now();
// console.log(`Execution time ${(t1-t0)} millisecond`);
// console.log(results);




