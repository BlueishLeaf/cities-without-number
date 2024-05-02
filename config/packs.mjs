import Datastore from "nedb";
import fs from "fs";
import gulp from "gulp";
import logger from "fancy-log";
import mergeStream from "merge-stream";
import path from "path";
import through2 from "through2";
import yargs from "yargs";


/**
 * Parsed arguments passed in through the command line.
 * @type {object}
 */
const parsedArgs = yargs(process.argv).argv;

/**
 * Folder where the compiled compendium packs should be located relative to the base CWN system folder.
 * @type {string}
 */
const PACK_DEST = "packs";

/**
 * Folder where source JSON files should be located relative to the CWN system folder.
 * @type {string}
 */
const PACK_SRC = "packs/src";

/**
 * Cache of DBs so they aren't loaded repeatedly when determining IDs.
 * @type {Object<string,Datastore>}
 */
const DB_CACHE = {};


/* ----------------------------------------- */
/*  Clean Packs
/* ----------------------------------------- */

/**
 * Removes unwanted flags, permissions, and other data from entries before extracting or compiling.
 * @param {object} data  Data for a single entry to clean.
 * @param {object} [options]
 * @param {boolean} [options.clearSourceId]  Should the core sourceId flag be deleted.
 */
function cleanPackEntry(data, { clearSourceId=true }={}) {
  if ( data.ownership ) data.ownership = { default: 0 };
  if ( clearSourceId ) delete data.flags?.core?.sourceId;
  if ( typeof data.folder === "string" ) data.folder = null;
  delete data.flags?.importSource;
  delete data.flags?.exportSource;
  if ( data._stats?.lastModifiedBy ) data._stats.lastModifiedBy = "cwnBuilder0000";

  // Remove empty entries in flags
  if ( !data.flags ) data.flags = {};
  Object.entries(data.flags).forEach(([key, contents]) => {
    if ( Object.keys(contents).length === 0 ) delete data.flags[key];
  });

  if ( data.effects ) data.effects.forEach(i => cleanPackEntry(i, { clearSourceId: false }));
  if ( data.items ) data.items.forEach(i => cleanPackEntry(i, { clearSourceId: false }));
  if ( data.system?.description ) data.system.description = cleanString(data.system.description);
  if ( data.label ) data.label = cleanString(data.label);
  if ( data.name ) data.name = cleanString(data.name);
  data.sort = 0;
}


/**
 * Attempts to find an existing matching ID for an item of this name, otherwise generates a new unique ID.
 * @param {object} data        Data for the entry that needs an ID.
 * @param {string} pack        Name of the pack to which this item belongs.
 * @returns {Promise<string>}  Resolves once the ID is determined.
 */
function determineId(data, pack) {
  const db_path = path.join(PACK_DEST, `${pack}.db`);
  if ( !DB_CACHE[db_path] ) {
    DB_CACHE[db_path] = new Datastore({ filename: db_path, autoload: true });
    DB_CACHE[db_path].loadDatabase();
  }
  const db = DB_CACHE[db_path];

  return new Promise((resolve, reject) => {
    db.findOne({ name: data.name }, (err, entry) => {
      if ( entry ) {
        resolve(entry._id);
      } else {
        resolve(db.createNewId());
      }
    });
  });
}

/**
 * Removes invisible whitespace characters and normalises single- and double-quotes.
 * @param {string} str  The string to be cleaned.
 * @returns {string}    The cleaned string.
 */
function cleanString(str) {
  return str.replace(/\u2060/gu, "").replace(/[‘’]/gu, "'").replace(/[“”]/gu, '"');
}

/**
 * Cleans and formats source JSON files, removing unnecessary permissions and flags
 * and adding the proper spacing.
 *
 * - `gulp cleanPacks` - Clean all source JSON files.
 * - `gulp cleanPacks --pack classes` - Only clean the source files for the specified compendium.
 * - `gulp cleanPacks --pack classes --name Barbarian` - Only clean a single item from the specified compendium.
 */
function cleanPacks() {
  const packName = parsedArgs.pack;
  const entryName = parsedArgs.name?.toLowerCase();
  const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true }).filter(file =>
    file.isDirectory() && ( !packName || (packName === file.name) )
  );
  console.info(folders);

  const packs = folders.map(folder => {
    logger.info(`Cleaning pack ${folder.name}`);
    return gulp.src(path.join(PACK_SRC, folder.name, "/**/*.json"))
      .pipe(through2.obj(async (file, enc, callback) => {
        const json = JSON.parse(file.contents.toString());
        const name = json.name.toLowerCase();
        if ( entryName && (entryName !== name) ) return callback(null, file);
        cleanPackEntry(json);
        if ( !json._id ) json._id = await determineId(json, folder.name);
        fs.rmSync(file.path, { force: true });
        fs.writeFileSync(file.path, `${JSON.stringify(json, null, 2)}\n`, { mode: 0o664 });
        callback(null, file);
      }));
  });
  console.info(packs);

  return mergeStream(packs);
}
export const clean = cleanPacks;


/* ----------------------------------------- */
/*  Compile Packs
/* ----------------------------------------- */

/**
 * Compile the source JSON files into compendium packs.
 *
 * - `gulp compilePacks` - Compile all JSON files into their NEDB files.
 * - `gulp compilePacks --pack classes` - Only compile the specified pack.
 */
function compilePacks() {
  const packName = parsedArgs.pack;
  // Determine which source folders to process
  const folders = fs.readdirSync(PACK_SRC, { withFileTypes: true }).filter(file =>
    file.isDirectory() && ( !packName || (packName === file.name) )
  );

  const packs = folders.map(folder => {
    const filePath = path.join(PACK_DEST, `${folder.name}.db`);
    fs.rmSync(filePath, { force: true });
    const db = fs.createWriteStream(filePath, { flags: "a", mode: 0o664 });
    const data = [];
    logger.info(`Compiling pack ${folder.name}`);
    return gulp.src(path.join(PACK_SRC, folder.name, "/**/*.json"))
      .pipe(through2.obj((file, enc, callback) => {
        const json = JSON.parse(file.contents.toString());
        cleanPackEntry(json);
        data.push(json);
        callback(null, file);
      }, callback => {
        data.sort((lhs, rhs) => lhs._id > rhs._id ? 1 : -1);
        data.forEach(entry => db.write(`${JSON.stringify(entry)}\n`));
        callback();
      }));
  });
  return mergeStream(packs);
}
export const compile = compilePacks;
