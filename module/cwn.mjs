// Import document classes.
import {CitiesWithoutNumberActor} from "./documents/actor.mjs";
import {CitiesWithoutNumberItem} from "./documents/item.mjs";
// Import sheet classes.
import {CitiesWithoutNumberActorSheet} from "./sheets/actor-sheet.mjs";
import {CitiesWithoutNumberItemSheet} from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import {preloadHandlebarsTemplates} from "./helpers/templates.mjs";
import {CWN} from "./helpers/config.mjs";
// Import DataModel classes
import * as models from './data/module.mjs';
import {registerSettings} from "./helpers/settings.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {

    // Add utility classes to the global game object so that they're more easily
    // accessible in global contexts.
    game.cwn = {
        CitiesWithoutNumberActor,
        CitiesWithoutNumberItem,
        rollItemMacro
    };

    // Add custom constants for configuration.
    CONFIG.CWN = CWN;

    /**
     * Set an initiative formula for the system
     * @type {string}
     */
    CONFIG.Combat.initiative = {
        formula: "1d8 + @abilities.dex.mod",
        decimals: 2
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
        server: models.ServerActorData
    }
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
    }

    // Add system settings
    registerSettings();

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("cwn", CitiesWithoutNumberActorSheet, {makeDefault: true});
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("cwn", CitiesWithoutNumberItemSheet, {makeDefault: true});

    // Preload Handlebars templates.
    return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async function () {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => createItemMacro(data, slot));
});

/* -------------------------------------------- */
/*  Create Actor Hook                                  */
/* -------------------------------------------- */
Hooks.on("createActor", async (actor, _options, _userId) => {
    if (!CONFIG.CWN.actorsWithSkills.includes(actor.type)) return;
    const skillPack = game.packs.get("cities-without-number.skills");
    const skills = await skillPack.getDocuments({name__in: CONFIG.CWN.startingSkills});
    actor.createEmbeddedDocuments("Item", skills);
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */

/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
    // First, determine if this is a valid-owned item.
    if (data.type !== "Item") return;
    if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
        return ui.notifications.warn("You can only create macro buttons for owned Items");
    }
    // If it is, retrieve it based on the uuid.
    const item = await Item.fromDropData(data);

    // Create the macro command using the uuid.
    const command = `game.cwn.rollItemMacro("${data.uuid}");`;
    let macro = game.macros.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: {"cwn.itemMacro": true}
        });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
    // Reconstruct the drop data so that we can load the item.
    const dropData = {
        type: "Item",
        uuid: itemUuid
    };
    // Load the item from the uuid.
    Item.fromDropData(dropData).then(item => {
        // Determine if the item loaded and if it's an owned item.
        if (!item || !item.parent) {
            const itemName = item?.name ?? itemUuid;
            return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`);
        }

        // Trigger the item roll
        item.roll();
    });
}

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper("concat", function () {
    let outStr = "";
    for (let arg in arguments) {
        if (typeof arguments[arg] != "object") {
            outStr += arguments[arg];
        }
    }
    return outStr;
});

Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
});

Handlebars.registerHelper("isChecked", function (condition) {
    return condition ? "checked" : "";
});

Handlebars.registerHelper("isArmorReadiable", function (selectedArmor, allArmor) {
    let readiable = true;
    if (selectedArmor.system.subType === 'accessory' && !selectedArmor.system.canEquipWithSuit && allArmor.find(armorItem => armorItem.system.subType === 'armor' && armorItem.system.readied && armorItem.system.isSuit)) {
        readiable = false;
    }
    return readiable ? "" : "disabled title=\"Cannot equip this accessory while wearing an armored suit\"";
});

Handlebars.registerHelper("isSelected", function (condition) {
    return condition ? "selected" : "";
});

Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("isSettingEnabled", function (settingKey, options) {
    return game.settings.get("cities-without-number", settingKey) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("formatChromeDefect", function (defectId, defectCollection, headerClass) {
    const defect = defectCollection.find(s => s.id === defectId);
    return defect ? `<h4 class="${headerClass}"><b>${defect.name}:</b>${defect.system.description}</h4>` : '';
});
