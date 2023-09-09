/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @returns {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/cities-without-number/templates/actor/parts/actor-features.html",
    "systems/cities-without-number/templates/actor/parts/actor-items.html",
    "systems/cities-without-number/templates/actor/parts/actor-spells.html",
    "systems/cities-without-number/templates/actor/parts/actor-effects.html"
  ]);
};
