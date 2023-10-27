/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @returns {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    // Actor partials.
    "systems/cities-without-number/templates/actor/parts/actor-skills.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-character-inventory.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-inventory.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-machine-inventory.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-cyberware.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-features.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-biography.hbs"
  ]);
};
