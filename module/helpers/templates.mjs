/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @returns {Promise}
 */
export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([
    // Actor partials.
    "systems/cities-without-number/templates/shared/document-mods.hbs",
    "systems/cities-without-number/templates/item/item-cyberwear-chrome-syndromes.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-skills.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-character-skills.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-drone-skills.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-weapons.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-inventory.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-character-equipment.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-humanoid-equipment.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-drone-equipment.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-vehicle-equipment.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-cyberware-section.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-total-cyberware.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-features.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-biography.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-character-biography.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-server-programs.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-server-network.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-stats.hbs",
    "systems/cities-without-number/templates/actor/parts/actor-limited.hbs"
  ]);
};
