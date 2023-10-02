/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @returns {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    // Actor partials.
    "systems/cities-without-number/templates/actor/parts/actor-skills.html",
    "systems/cities-without-number/templates/actor/parts/actor-inventory.html",
    "systems/cities-without-number/templates/actor/parts/actor-features.html",
    "systems/cities-without-number/templates/actor/parts/actor-biography.html"
  ]);
};
