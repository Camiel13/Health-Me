import fs from 'fs';
const data = fs.readFileSync('index.html', 'utf-8');
console.log("File is readable");
