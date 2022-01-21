////////////////////////////////////////
// required packages
////////////////////////////////////////
const express = require('express');
require('dotenv/config');

////////////////////////////////////////
// Server constsants
////////////////////////////////////////
const PORT = process.env.PORT || 3001;
const app = express();
const serv = require('http').Server(app);

////////////////////////////////////////
// File Stream
////////////////////////////////////////
const fs = require("fs");
const { callbackify } = require('util');

// Exports the given array as a text file 
function ExportFile(stringArray, fName, dir) {
    // Get dir
    var fileDir = dir || "";
    
    // Format array for text file
    var saveData = "";
    for (var i = 0; i < stringArray.length; i++) {
        if (i === 0) saveData += stringArray[i];
        else saveData += `\n${stringArray[i]}`;
    }

    // Save file
    if (fileDir != "") {
        // Create directory if it doesn't exist
        if (!fs.existsSync(fileDir)){
            fs.mkdirSync(fileDir);
        }
        // Write file to directory
        fs.writeFile(`${fileDir}/${fName}`, saveData, function(err, data){
            if (err) {
                return console.log(err);
            }
        });
    }
    else {
        // Write file
        fs.writeFile(`./${fName}`, saveData, function(err, data){
            if (err) {
                return console.log(err);
            }
        });
    }
}

// Imports the given file as a string array
function ImportFile(fName, callback) {
    let output = [];
    // Read entire file and split it up
    if (fs.existsSync(fName)){
        fs.readFile(fName, function(err, data) {
            if(err) throw err;
            var array = data.toString().split("\n");
            for(i in array) {
                // Append each line to array
                array[i] = array[i].replace(/(\r\n|\n|\r)/gm, ""); // removes text file formats and line breaks
                output.push(array[i]);
            }

            console.log(`File ${fName} has finished loading.`);
            //console.log(output);
            callback(output);
        });
    }
    else {
        const message = `${fName} does not exist.`; 
        console.log(message);
    }
}

////////////////////////////////////////
// Server setup
////////////////////////////////////////
// the __dirname is the current directory from where the script is running
app.use(express.static(__dirname + '/client'));

// listen for requests
serv.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

///////////////////////////////////////
// Server started
///////////////////////////////////////
console.log(
    "Server has started!",
    `Go here to test: http://localhost:${PORT}`
    //`Command test link: http://localhost:${PORT}/testcommand`
);

