// Import document classes.
import { CitiesWithoutNumberActor } from "./documents/actor.mjs";
import { CitiesWithoutNumberItem } from "./documents/item.mjs";
// Import sheet classes.
import { CitiesWithoutNumberActorSheet } from "./sheets/actor-sheet.mjs";
import { CitiesWithoutNumberItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { CWN } from "./helpers/config.mjs";
// Import DataModel classes
import * as models from "./data/module.mjs";
import { registerSettings } from "./helpers/settings.mjs";
import registerHandlebarsHelpers from "./helpers/handlebars-helpers.mjs";

// Register additional helpers
registerHandlebarsHelpers();

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.cwn = {
    CitiesWithoutNumberActor,
    CitiesWithoutNumberItem,
  };

  // Add custom constants for configuration.
  CONFIG.CWN = CWN;

  /**
   * Set an initiative formula for the system
   * @type {string}
   */
  CONFIG.Combat.initiative = {
    formula: "1d8 + @abilities.dex.mod",
    decimals: 2,
  };

  // Define custom Document classes
  CONFIG.Actor.documentClass = CitiesWithoutNumberActor;
  CONFIG.Item.documentClass = CitiesWithoutNumberItem;

  // Declare data models
  CONFIG.Actor.dataModels = {
    character: models.CharacterActorData,
    npc: models.NpcActorData,
    drone: models.DroneActorData,
    vehicle: models.VehicleActorData,
    server: models.ServerActorData,
  };
  CONFIG.Item.dataModels = {
    gear: models.GearItemData,
    weapon: models.WeaponItemData,
    armor: models.ArmorItemData,
    edge: models.EdgeItemData,
    focus: models.FocusItemData,
    skill: models.SkillItemData,
    cyberware: models.CyberwareItemData,
    mod: models.ModItemData,
    fitting: models.FittingItemData,
    vehicleFitting: models.VehicleFittingItemData,
    drug: models.DrugItemData,
    cyberdeck: models.CyberdeckItemData,
    verb: models.VerbItemData,
    subject: models.SubjectItemData,
    node: models.NodeItemData,
    demon: models.DemonItemData,
    contact: models.ContactItemData,
    chromeSyndrome: models.ChromeSyndromeItemData,
    implantComplication: models.ImplantComplicationItemData,
  };

  // Add system settings
  registerSettings();

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cwn", CitiesWithoutNumberActorSheet, {
    makeDefault: true,
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cwn", CitiesWithoutNumberItemSheet, {
    makeDefault: true,
  });

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Create Actor Hook                           */
/* -------------------------------------------- */
Hooks.on("createActor", async (actor) => {
  if (!CONFIG.CWN.actorsWithSkills.includes(actor.type)) return;
  const skillPack = game.packs.get("cities-without-number.skills");
  const skills = await skillPack.getDocuments({
    name__in: CONFIG.CWN.startingSkills,
  });
  await actor.createEmbeddedDocuments("Item", skills);
});
