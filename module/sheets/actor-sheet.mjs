import * as ChatRenders from "../helpers/chat-renders.mjs";
import * as ChatUtils from "../helpers/chat-utils.mjs";
import * as DialogTemplates from "../helpers/dialog-templates.mjs";
import * as DialogUtils from "../helpers/dialog-utils.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CitiesWithoutNumberActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "actor"],
      template: "systems/cities-without-number/templates/actor/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/cities-without-number/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, and the items array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type === "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type === "npc") {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {object} actorData The actor to prepare.
   *
   * @param context
   * @returns {undefined}
   */
  _prepareCharacterData(context) {
    // Set max system strain
    context.system.systemStrain.max = context.system.abilities.con.value;

    // Set stowed and readied items
    context.system.encumberance.stowed.max = context.system.abilities.str.value;
    context.system.encumberance.readied.max = Math.floor(context.system.abilities.str.value / 2);
    context.system.encumberance.stowed.value = 0;
    context.system.encumberance.readied.value = 0;
    context.items.forEach(item => {
      if (item.system.readied !== undefined) {
        if (item.system.readied) {
          context.system.encumberance.readied.value += item.system.encumberance;
        } else {
          context.system.encumberance.stowed.value += item.system.encumberance;
        }
      }
    });
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {object} actorData The actor to prepare.
   *
   * @param context
   * @returns {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const skills = [];
    const inventory = [];
    const weapons = [];
    const armory = [];
    const foci = [];
    const edges = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to skills.
      if (i.type === "skill") {
        skills.push(i);
      }
      // Append to inventory.
      else if (i.type === "gear") {
        inventory.push(i);
      }
      // Append to weapons.
      else if (i.type === "weapon") {
        weapons.push(i);
      }
      // Append to armory.
      else if (i.type === "armor") {
        armory.push(i);
      }
      // Append to foci.
      else if (i.type === "focus") {
        foci.push(i);
      }
      // Append to edges.
      else if (i.type === "edge") {
        edges.push(i);
      }
    }

    // Assign and return
    context.skills = skills;
    context.inventory = inventory;
    context.weapons = weapons;
    context.armory = armory;
    context.foci = foci;
    context.edges = edges;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find(".rollable").click(this._onRoll.bind(this));

    // Skill pill level changes.
    html.find(".skill-level").change(ev => this.updateSkillLevel(ev, this.actor));

    // Readied checkbox changes.
    html.find(".readiable").change(ev => this.updateReadiedFlag(ev, this.actor));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  updateReadiedFlag(event, actor) {
    console.log("event", event);
    const newReadiedState = event.target.checked;
    const itemId = event.target.dataset.itemId;
    const item = actor.items.get(itemId);
    item.system.readied = newReadiedState;
    Item.updateDocuments([{_id: item._id, system: { readied: newReadiedState }}], {parent: actor}).then(updatedItem => console.log("Updated item", updatedItem));
  }

  updateSkillLevel(event, actor) {
    const newSkillLevel = event.target.value;
    const skillId = event.currentTarget.dataset.skillId;
    const skill = actor.items.get(skillId);
    skill.system.level = newSkillLevel;
    Item.updateDocuments([{_id: skill._id, system: { level: newSkillLevel }}], {parent: actor}).then(updatedSkill => console.log("Updated skill", updatedSkill));
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system.type;

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType === "gear" || dataset.rollType === "armor") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      } else if (dataset.rollType === "skill") {
        const skillId = element.closest(".skill").dataset.itemId;
        const skill = this.actor.items.get(skillId);
        this.openSkillDialog(skill);
      } else if (dataset.rollType === "weapon") {
        const weaponId = element.closest(".item").dataset.itemId;
        const weapon = this.actor.items.get(weaponId);
        this.openWeaponDialog(weapon);
      } else if (dataset.rollType === "save") {
        this.openSaveDialog(this.actor.system.savingThrows.saveTargets[dataset.save]);
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : "";
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get("core", "rollMode")
      });
      return roll;
    }
  }

  openWeaponDialog(weapon) {
    const abilityOptions = Object.entries(this.actor.system.abilities).map((k, _v) => `<option value="${k[0]}" ${weapon.system.attribute === k[0] ? "selected" : ""}>${k[1].label}</option>\n`);
    const skills = this.actor.items.filter(item => item.type === "skill");
    const skillOptions = skills.map(skill => `<option value="${skill._id}" ${weapon.system.skill === skill.name ? "selected" : ""}>${skill.name}</option>\n`);
    const weaponDialog = new Dialog({
      title: `Roll ${weapon.name}`,
      content: DialogTemplates.weaponRollDialog(abilityOptions, skillOptions),
      buttons: DialogUtils.rollButtons(html => this.handleWeaponRoll(weapon, html)),
      default: "roll"
    });
    weaponDialog.render(true);
  }

  handleWeaponRoll(weapon, html) {
    const baseAB = this.actor.system.attackBonus;
    const situationalAB = html.find('[name="situationalABInput"]').val();
    const equipmentDB = html.find('[name="equipmentDBInput"]').val();

    const selectedAttributeCode = html.find('[name="attributeSelect"]').val();
    const attributeMod = this.actor.system.abilities[selectedAttributeCode].mod;

    const selectedSkill = this.actor.items.get(html.find('[name="skillSelect"]').val());
    const skillMod = selectedSkill.system.level;

    const isNonLethal = html.find('[name="nonLethalInput"]')[0].checked;

    // Update default attribute and skill for this weapon for next time
    weapon.system.attribute = selectedAttributeCode;
    weapon.system.skill = selectedSkill._id;
    Item.updateDocuments([{_id: weapon._id, system: { attribute: selectedAttributeCode, skill: selectedSkill.name }}], {parent: this.actor}).then(updates => console.log("Updated weapon", updates));

    this.rollWeapon(weapon, isNonLethal, { attributeMod, skillMod, baseAB, situationalAB, equipmentDB });
  }

  rollWeapon(weapon, isNonLethal, rollData) {
    console.log(`Rolling [${weapon.type}] ${weapon.name}`, rollData);
    const attackRoll = new Roll(weapon.system.rollFormula, rollData);
    const damageRoll = new Roll(weapon.system.damageFormula, rollData);
    const rollRenderPromises = [attackRoll.render(), damageRoll.render()];

    // Only roll trauma die if the weapon has one and the attack isn't non-lethal
    if (!isNonLethal && weapon.system.traumaDie && weapon.system.traumaRating) {
      const traumaRoll = new Roll(weapon.system.traumaDie, rollData);
      rollRenderPromises.push(traumaRoll.render());
    }

    Promise.all(rollRenderPromises).then(rollRenders => {
      const messageData = ChatUtils.initializeChatData(this.actor, weapon);
      const content = ChatRenders.buildChatContentForAttackRoll(weapon, isNonLethal, damageRoll, rollRenders);
      ChatMessage.create({...messageData, content}).then(message => console.log(message));
    });
  }

  openSkillDialog(skill) {
    const abilityOptions = Object.entries(this.actor.system.abilities).map((k, _v) => `<option value="${k[0]}" ${skill.system.attribute === k[0] ? "selected" : ""}>${k[1].label}</option>\n`);
    const skillDialog = new Dialog({
      title: `Roll ${skill.name}`,
      content: DialogTemplates.skillRollDialog(abilityOptions),
      buttons: DialogUtils.rollButtons(html => this.handleSkillRoll(skill, html)),
      default: "roll"
    });
    skillDialog.render(true);
  }

  handleSkillRoll(skill, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    const selectedAttributeCode = html.find('[name="attributeSelect"]').val();
    const attributeMod = this.actor.system.abilities[selectedAttributeCode].mod;

    // Update default attribute for this skill for next time
    skill.system.attribute = selectedAttributeCode;
    Item.updateDocuments([{_id: skill._id, system: { attribute: selectedAttributeCode }}], {parent: this.actor}).then(updates => console.log("Updated skill", updates));

    this.rollSkill(skill, { attributeMod, level: skill.system.level, situationalBonus });
  }

  rollSkill(skill, rollData) {
    console.log(`Rolling [${skill.type}] ${skill.name}`, rollData);
    const roll = new Roll(skill.system.rollFormula, rollData);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const flavor = `[${skill.type}] ${skill.name}`;
    roll.toMessage({speaker, rollMode, flavor}).then(message => console.log(message));
  }

  openSaveDialog(save) {
    const saveDialog = new Dialog({
      title: `Roll ${save.label}`,
      content: DialogTemplates.saveRollDialog(),
      buttons: DialogUtils.rollButtons(html => this.handleSaveRoll(save, html)),
      default: "roll"
    });
    saveDialog.render(true);
  }

  handleSaveRoll(save, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    this.rollSave(save, { situationalBonus });
  }

  rollSave(save, rollData) {
    console.log(`Rolling [save] ${save.label}`, rollData);
    const roll = new Roll(this.actor.system.savingThrows.rollFormula, rollData);

    roll.render().then(rollRender => {
      save.type = "save";
      save.name = save.label;
      const messageData = ChatUtils.initializeChatData(this.actor, save);
      const savePassed = roll.total >= save.value;
      const content = ChatRenders.saveRender(rollRender, savePassed);
      ChatMessage.create({...messageData, content}).then(message => console.log(message));
    });
  }
}
