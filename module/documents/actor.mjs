/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class CitiesWithoutNumberActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.cwn || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   * @param actorData
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== "character") return;

    // Make modifications to data here
    this.prepareAbilityModifiers(actorData.system);
    this.prepareArmor(actorData);
  }

  /**
   * Prepare NPC type specific data
   * @param actorData
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== "npc") return;

    // Make modifications to data here
    this.prepareArmor(actorData);
  }

  prepareAbilityModifiers(systemData) {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using CWN rules.
      ability.mod = 0;
      for (let [modifier, range] of Object.entries(CONFIG.CWN.abilityModifiers)) {
        if (range.includes(ability.value)) {
          ability.mod = Number(modifier);
        }
      }
    }
  }

  prepareArmor(actorData) {
    // Find a readied armor item if one exists
    const equippedArmor = actorData.items.find(item => item.type === "armor" && item.system.readied && item.system.subType === "armor");
    const equippedAccessories = actorData.items.filter(item => item.type === "armor" && item.system.readied && item.system.subType === "accessory");

    const baseAC = 10;
    actorData.system.armorClass.melee = equippedArmor ? equippedArmor.system.armorClass.melee : baseAC;
    actorData.system.armorClass.ranged = equippedArmor ? equippedArmor.system.armorClass.ranged : baseAC;

    // Apply dexterity modifier to total AC bonus
    if (actorData.type === "character") {
      actorData.system.armorClass.melee += actorData.system.abilities.dex.mod;
      actorData.system.armorClass.ranged += actorData.system.abilities.dex.mod;
    }

    // Calculate damage soak
    const baseDamageSoak = 0;
    actorData.system.damageSoak.max = equippedArmor ? equippedArmor.system.damageSoak : baseDamageSoak;

    // Calculate trauma target
    const baseTraumaTarget = 6;
    actorData.system.traumaTarget = equippedArmor
      ? baseTraumaTarget + equippedArmor.system.traumaTargetMod
      : baseTraumaTarget;

    // Apply accessory modifiers
    equippedAccessories.forEach(accessory => {
      actorData.system.armorClass.melee += accessory.system.armorClass.melee;
      actorData.system.armorClass.ranged += accessory.system.armorClass.ranged;
      actorData.system.damageSoak.max += accessory.system.damageSoak;
      actorData.system.traumaTarget += accessory.system.traumaTargetMod;
    });
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   * @param data
   */
  _getCharacterRollData(data) {
    if (this.type !== "character") return;

    // Copy the ability scores to the top level, so that rolls can use
    // formulas like `@str.mod + 4`.
    if (data.abilities) {
      for (let [k, v] of Object.entries(data.abilities)) {
        data[k] = foundry.utils.deepClone(v);
      }
    }

    // Add level for easier access, or fall back to 0.
    if (data.level) {
      data.lvl = data.level ?? 0;
    }
  }

  /**
   * Prepare NPC roll data.
   * @param data
   */
  _getNpcRollData(data) {
    if (this.type !== "npc") return;

    // Process additional NPC data here.
  }

}
