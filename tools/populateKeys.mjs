import { promises as fs } from 'fs';

// This script is used to help migrate compendium data to LevelDB
const packs = await fs.readdir('./src/packs');
for (const pack of packs) {
    if (pack === '.gitattributes') continue;
    console.log('Beginning processing for pack: ' + pack);
    const directory = `./src/packs/${pack}`;
    await processDirectory(directory);
    console.log('Operation success!');
}

async function processDirectory (directory){
    console.log('Opening files in directory: ' + directory);
    for (const file of await fs.readdir(directory)) {
        const filePath = `${directory}/${file}`;

        const isDirectory = (await fs.lstat(filePath)).isDirectory();
        if (!isDirectory) {
            console.log('Reading file contents for: ' + filePath);
            const json = JSON.parse(await fs.readFile(filePath, "utf8"));
            await populateKeyForFile(filePath, json);
        } else {
            await processDirectory(filePath);
        }
    }
}

async function populateKeyForFile(filePath, json) {
    json._key = `${json._id}!${json.type}`;
    console.log('Set key for file: ' + filePath, json._key);
    await fs.writeFile(filePath, JSON.stringify(json, null, 2));
}