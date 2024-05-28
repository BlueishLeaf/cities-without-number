import * as ChatRenders from "../helpers/chat-renders.mjs";
import * as ChatUtils from "../helpers/chat-utils.mjs";
import * as DialogTemplates from "../helpers/dialog-templates.mjs";
import * as DialogUtils from "../helpers/dialog-utils.mjs";

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
  }

  prepareAbilityModifiers(systemData) {
    // Loop through ability scores, and add their modifiers to our sheet output.
    for (let [key, ability] of Object.entries(systemData.abilities)) {
      // Calculate the modifier using CWN rules.
      ability.mod = 0;
      for (let [modifier, range] of Object.entries(CONFIG.CWN.abilityModifiers)) {
        if (range.includes(ability.value)) {
          ability.mod = Number(modifier) + ability.bonusMod;
        }
      }
    }
  }

  prepareArmor(actorData) {
    // Find a readied armor item if one exists
    const equippedArmor = actorData.items.find(item => item.type === "armor" && item.system.readied && item.system.subType === "armor");
    const equippedAccessories = actorData.items.filter(item => item.type === "armor" && item.system.readied && item.system.subType === "accessory");

    const baseMeleeAC = Number(actorData.system.armorClass.baseMelee);
    actorData.system.armorClass.melee = baseMeleeAC;
    if (equippedArmor && equippedArmor.system.armorClass.melee > baseMeleeAC) {
      actorData.system.armorClass.melee = equippedArmor ? equippedArmor.system.armorClass.melee : baseMeleeAC;
    }

    const baseRangedAC = Number(actorData.system.armorClass.baseRanged);
    actorData.system.armorClass.ranged = baseRangedAC;
    if (equippedArmor && equippedArmor.system.armorClass.ranged > baseRangedAC) {
      actorData.system.armorClass.ranged = equippedArmor ? equippedArmor.system.armorClass.ranged : baseRangedAC;
    }

    // Apply dexterity modifier to total AC bonus
    if (actorData.type === "character") {
      actorData.system.armorClass.melee += actorData.system.abilities.dex.mod;
      actorData.system.armorClass.ranged += actorData.system.abilities.dex.mod;
    }

    // Calculate damage soak
    const baseDamageSoak = Number(actorData.system.damageSoak.base);
    actorData.system.damageSoak.max = equippedArmor ? Number(equippedArmor.system.damageSoak) + baseDamageSoak : baseDamageSoak;

    // Calculate trauma target
    const baseTraumaTarget = Number(actorData.system.traumaTarget.base);
    actorData.system.traumaTarget.total = equippedArmor
      ? baseTraumaTarget + equippedArmor.system.traumaTargetMod
      : baseTraumaTarget;

    // Apply accessory modifiers
    equippedAccessories.forEach(accessory => {
      actorData.system.armorClass.melee += accessory.system.armorClass.melee;
      actorData.system.armorClass.ranged += accessory.system.armorClass.ranged;
      actorData.system.damageSoak.max += accessory.system.damageSoak;
      actorData.system.traumaTarget.total += accessory.system.traumaTargetMod;
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

  openNpcAttackTypeDialog(weapon) {
    const attackBonusDialog = new Dialog({
      title: "Choose which attack bonus to use",
      buttons: DialogUtils.attackBonusButtons(
        _html => this.openNpcWeaponDialog(weapon, false),
        _html => this.openNpcWeaponDialog(weapon, true)
      ),
      default: "Roll"
    });
    attackBonusDialog.render(true);
  }

  openNpcWeaponDialog(weapon, useRangedBonus) {
    const weaponDialog = new Dialog({
      title: `Roll ${weapon.name}`,
      content: DialogTemplates.autoWeaponRollDialog(weapon.system.isBurstFireable),
      buttons: DialogUtils.rollButtons(html =>
        this.handleAutoWeaponRoll(weapon, this.getBaseAttackBonusByActorType(useRangedBonus, false), html)),
      default: "Roll"
    });
    weaponDialog.render(true);
  }

  openDroneWeaponDialog(weapon) {
    const droneAttackTypeDialog = new Dialog({
      title: "Choose an attack mode",
      buttons: DialogUtils.attackModeButtons(
        _html => this.openWeaponDialog(weapon),
        _html => this.openAutoWeaponDialog(weapon)
      ),
      default: "Manual"
    });
    droneAttackTypeDialog.render(true);
  }

  openAutoWeaponDialog(weapon) {
    const weaponDialog = new Dialog({
      title: `Roll ${weapon.name}`,
      content: DialogTemplates.autoWeaponRollDialog(weapon.system.isBurstFireable),
      buttons: DialogUtils.rollButtons(html =>
        this.handleAutoWeaponRoll(weapon, this.getBaseAttackBonusByActorType(false, true), html)),
      default: "Roll"
    });
    weaponDialog.render(true);
  }

  openWeaponDialog(weapon) {
    const abilityOptions = Object.entries(this.system.abilities).map((k, _v) => `<option value="${k[0]}" ${weapon.system.attribute === k[0] ? "selected" : ""}>${k[1].label}</option>\n`);
    const skills = this.items.filter(item => item.type === "skill");
    const skillOptions = skills.map(skill => `<option value="${skill._id}" ${weapon.system.skill === skill.name ? "selected" : ""}>${skill.name}</option>\n`);
    const weaponDialog = new Dialog({
      title: `Roll ${weapon.name}`,
      content: DialogTemplates.weaponRollDialog(weapon.system.isBurstFireable, abilityOptions, skillOptions),
      buttons: DialogUtils.rollButtons(html => this.handleWeaponRoll(weapon, html)),
      default: "Roll"
    });
    weaponDialog.render(true);
  }

  handleWeaponRoll(weapon, html) {
    const baseAB = this.getBaseAttackBonusByActorType(false);
    const situationalAB = html.find('[name="situationalABInput"]').val();

    const selectedAttributeCode = html.find('[name="attributeSelect"]').val();
    const attributeMod = this.system.abilities[selectedAttributeCode].mod;

    const selectedSkill = this.items.get(html.find('[name="skillSelect"]').val());
    const skillMod = selectedSkill.system.level;

    const isNonLethal = html.find('[name="nonLethalInput"]')[0].checked;
    const burstFireElements = html.find('[name="burstFireInput"]');
    const isBurstFire = burstFireElements.length > 0 ? burstFireElements[0].checked : false;

    // Update default attribute and skill for this weapon for next time
    weapon.system.attribute = selectedAttributeCode;
    weapon.system.skill = selectedSkill.name;

    if (!weapon.system.magazine || this.magazineHasEnoughAmmo(weapon.system.magazine, isBurstFire)) {
      this.rollWeapon(weapon, isNonLethal, isBurstFire, { attributeMod, skillMod, baseAB, situationalAB });
      const updatedMagazine = this.getUpdatedMagazine(isBurstFire, weapon.system.magazine);
      Item.updateDocuments([{ _id: weapon._id, system: { attribute: selectedAttributeCode, skill: selectedSkill.name, magazine: updatedMagazine } }], { parent: weapon.actor }).then(updates => console.log("Updated weapon", updates));
    } else {
      this.sendReloadMessage(weapon);
    }
  }

  handleAutoWeaponRoll(weapon, baseAB, html) {
    const situationalAB = html.find('[name="situationalABInput"]').val();

    const burstFireElements = html.find('[name="burstFireInput"]');
    const isBurstFire = burstFireElements.length > 0 ? burstFireElements[0].checked : false;

    const isNonLethal = html.find('[name="nonLethalInput"]')[0].checked;

    if (!weapon.system.magazine || this.magazineHasEnoughAmmo(weapon.system.magazine, isBurstFire)) {
      this.rollWeapon(weapon, isNonLethal, isBurstFire, { baseAB, situationalAB });
      const updatedMagazine = this.getUpdatedMagazine(isBurstFire, weapon.system.magazine);
      Item.updateDocuments([{ _id: weapon._id, system: { magazine: updatedMagazine } }], { parent: this }).then(updates => console.log("Updated weapon", updates));
    } else {
      this.sendReloadMessage(weapon);
    }
  }

  getBaseAttackBonusByActorType(useRangedBonus, isAutoFire) {
    if (this.type === "drone") {
      return isAutoFire
        ? CONFIG.CWN.system.droneNativeBonus
        : game.actors.find(actor => actor._id === this.system.operator).system.attackBonus;
    } else if (this.type === "npc") {
      return useRangedBonus ? this.system.attackBonus.ranged : this.system.attackBonus.melee;
    }
    return this.system.attackBonus;
  }

  sendReloadMessage(weapon) {
    const messageData = ChatUtils.initializeChatData(this, weapon);
    const content = ChatUtils.getReloadMessage(weapon);
    ChatMessage.create({ ...messageData, content }).then(message => console.log(message));
  }

  magazineHasEnoughAmmo(magazine, isBurstFire) {
    const bulletsToFire = isBurstFire ? 3 : 1;
    return magazine.value >= bulletsToFire;
  }

  getUpdatedMagazine(isBurstFire, magazine) {
    if (!magazine) return null;

    const bulletsFired = isBurstFire ? 3 : 1;
    magazine.value -= bulletsFired;
    return magazine;
  }

  rollWeapon(weapon, isNonLethal, isBurstFire, rollData) {
    console.log(`Rolling [${weapon.type}] ${weapon.name}`, rollData);
    const rollRenderPromises = [];

    if (weapon.system.rollFormula) {
      const finalAttackRollFormula = isBurstFire
        ? `${weapon.system.rollFormula} + ${CONFIG.CWN.system.burstFireBonus}`
        : weapon.system.rollFormula;
      const attackRoll = new Roll(finalAttackRollFormula, rollData);
      rollRenderPromises[0] = attackRoll.render();
    }

    let damageRoll;
    if (weapon.system.damageFormula) {
      const finalDamageFormula = isBurstFire
        ? `${weapon.system.damageFormula} + ${CONFIG.CWN.system.burstFireBonus}`
        : weapon.system.damageFormula;
      damageRoll = new Roll(finalDamageFormula, rollData);
      rollRenderPromises[1] = damageRoll.render();
    }

    // Only roll trauma die if the weapon has one and the attack isn't non-lethal
    if (!isNonLethal && weapon.system.trauma && weapon.system.damageFormula) {
      const traumaRoll = new Roll(weapon.system.trauma.die, rollData);
      rollRenderPromises[2] = traumaRoll.render();
    }

    if (rollRenderPromises.length > 0) {
      Promise.all(rollRenderPromises).then(rollRenders => {
        const messageData = ChatUtils.initializeChatData(this, weapon);
        const content = ChatRenders.buildChatContentForAttackRoll(weapon, isNonLethal, damageRoll, rollRenders);
        ChatMessage.create({ ...messageData, content }).then(message => console.log(message));
      });
    } else {
      // If there is no roll to be made, simply output the weapon description
      weapon.roll();
    }
  }
}
