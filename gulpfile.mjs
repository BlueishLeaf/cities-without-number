import gulp from "gulp";

import * as css from "./config/css.mjs";
import * as javascript from "./config/javascript.mjs";
import * as packs from "./config/packs.mjs";

// Default export - build CSS and watch for updates
export default gulp.series(
  gulp.parallel(css.compile),
  css.watchUpdates
);

// CSS compiling
export const buildCSS = gulp.series(css.compile);

// Javascript compiling & linting
export const buildJS = gulp.series(javascript.compile);
export const lint = gulp.series(javascript.lint);

// Compendium pack management
export const cleanPacks = gulp.series(packs.clean);
export const compilePacks = gulp.series(packs.compile);

// Build all artifacts
export const buildAll = gulp.series(
  css.compile,
  javascript.compile,
  packs.clean,
  packs.compile
);
