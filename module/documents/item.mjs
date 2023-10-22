import * as StringUtils from "../helpers/string-utils.mjs";

/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CitiesWithoutNumberItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
  getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${StringUtils.titleCase(item.type)}] ${item.name}`;

    // If there's no roll data, send a chat message.
    console.log(this.system)
    if (!this.system.rollFormula) {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ""
      });
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      // Retrieve roll data.
      const rollData = this.getRollData();

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.rollFormula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label
      });
      return roll;
    }
  }

  refresh() {
    if (this.type === "weapon") {
      if (!this.system.magazine) return;
      this.system.magazine.value = this.system.magazine.max;
    } else if (this.type === "armor") {
      if (!this.system.damageSoak) return;
      this.system.damageSoak.value = this.system.damageSoak.max;
    }
    Item.updateDocuments([{_id: this._id, system: this.system}], {parent: this.actor}).then(updates => console.log("Updated item", updates));
  }
}
