import gulp from "gulp";
import gulpSass from "gulp-sass";
import * as dartSass from "sass";

const sass = gulpSass(dartSass);
const SASS_DEST = "./css";
const SASS_SRC = "scss/cwn.scss";
const SASS_WATCH = ["scss/*.scss"];


/**
 * Compile the SASS sources into a single CSS file.
 */
function compileSASS() {
  return gulp.src(SASS_SRC)
    .pipe(sass())
    .pipe(gulp.dest(SASS_DEST));
}
export const compile = compileSASS;


/**
 * Update the CSS if any of the SASS sources are modified.
 */
export function watchUpdates() {
  gulp.watch(SASS_WATCH, compile);
}
