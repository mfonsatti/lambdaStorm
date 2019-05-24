const fs = require('fs');
const readline = require('readline');

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
            if(row[2] !== 'NULL'){
                if(!Array.isArray(wyJson[row[2]])){
                    wyJson[row[2]] = []; 
                };
                wyJson[row[2]].push({
                    [headers[0]]: row[0],
                    [headers[1]]: row[1],
                    [headers[2]]: row[2]
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

csvToJson('wy_competition.csv','wy_competition.json');
csvToJson('tm_competition.csv', 'tm_competition.json');




