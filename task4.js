// const fs = require('fs');

// // read data from JSON file
// const data = fs.readFileSync("products-catalog.json","utf-8");
// const prodData = JSON.parse(data);
// console.log(prodData);

// // write and storing data in another .txt file in json format
// const newData = [];

// for (const product of prodData) {
//     newData.push(product);
// }

// fs.writeFileSync("output.txt", JSON.stringify(newData, null, 2));

const fs = require('fs');

// 1. Read and parse the source JSON file
const data = fs.readFileSync("products-catalog.json", "utf-8");
const prodData = JSON.parse(data);

// 2. Clear or initialize the output file as empty
const outputFile = "output.txt";
fs.writeFileSync(outputFile, "");

// 3. Loop through and write each product
prodData.forEach((product) => {
    fs.appendFileSync(outputFile, JSON.stringify(product) + "\n");
});

console.log("File written successfully!");

// 4. Read back the file, parse it, and put it into an array
const finalOutput = fs.readFileSync(outputFile, "utf-8");
const jsonData = finalOutput.split('\n');

const arr = [];
jsonData.forEach((line) => {
    if (line) { 
        arr.push(JSON.parse(line));
    }
});

console.log(arr);




