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

    context.config = CONFIG;

    // Prepare actor data and items.
    switch (actorData.type) {
      case "character":
        this._prepareItems(context);
        this._prepareCyberware(context);
        this._prepareCharacterData(context);
        break;
      case "npc":
        this._prepareItems(context);
        this._prepareCyberware(context);
        break;
      case "drone":
        this._prepareOperatorData(context);
        this._prepareItems(context);
        this._prepareFittingsAndMods(context);
        this._prepareOperators(context);
        this._prepareDroneData(context);
        break;
      case "vehicle":
        this._prepareItems(context);
        this._prepareFittingsAndMods(context);
        this._prepareVehicleData(context);
        break;
      case "server":
        this._prepareVerbsAndSubjects(context);
        this._prepareServerData(context);
    }

    // Update open item renders
    this.actor.items.filter(item => item._sheet && item._sheet.rendered)
      .forEach(openItem => openItem.sheet._render(openItem));

    return context;
  }

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Ignore mods and other items that are supposed to be attached to a child item
    if (!["drone", "vehicle", "server"].includes(this.actor.type) && ["mod", "verb", "subject"].includes(itemData.type)) return;

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }

  _prepareOperatorData(context) {
    if (!this.actor.system.operator || this.actor.system.operator === "undefined") return;

    const operator = game.actors.find(actor => actor._id === this.actor.system.operator).toObject(false); // Use safe clone
    const operatorSkills = operator.items.filter(item => item.type === "skill");
    const operatorDriveSkill = operatorSkills.find(skill => skill.name === "Drive");
    operatorSkills.forEach(operatorSkill => {
      this._setSkillCap(this.actor.items, operatorDriveSkill, operatorSkill);
      this._setSkillCap(context.items, operatorDriveSkill, operatorSkill);
    });
    context.driveSkill = operatorDriveSkill;
    this.actor.system.abilities = operator.system.abilities;
  }

  _setSkillCap(itemCollection, capSkill, sourceSkill) {
    const cappedSkill = itemCollection.find(item => item.type === "skill" && item.name === sourceSkill.name);
    cappedSkill.system.level = capSkill.system.level < sourceSkill.system.level
      ? capSkill.system.level
      : sourceSkill.system.level;
  }

  _prepareFittingsAndMods(context) {
    // Initialize containers.
    const fittings = [];
    const mods = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to fittings.
      if (i.type === "fitting" || i.type === "vehicleFitting") {
        fittings.push(i);
      }
      // Append to mods.
      else if (i.type === "mod") {
        mods.push(i);
      }
    }

    // Assign and return
    context.fittings = fittings;
    context.mods = mods;
  }

  _prepareOperators(context) {
    context.operators = {};
    context.operators[undefined] = "No one";
    game.actors.filter(actor => actor.type === "character").forEach(character => context.operators[character._id] = character.name);
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
    context.system.encumbrance.stowed.max = context.system.abilities.str.value;
    context.system.encumbrance.readied.max = Math.floor(context.system.abilities.str.value / 2);
    context.system.encumbrance.stowed.value = 0;
    context.system.encumbrance.readied.value = 0;
    context.items.forEach(item => {
      if (item.system.readied !== undefined) {
        if (item.system.readied) {
          context.system.encumbrance.readied.value += item.system.encumbrance * item.system.quantity;
        } else {
          context.system.encumbrance.stowed.value += item.system.encumbrance * item.system.quantity;
        }
      }
    });
  }

  _prepareDroneData(context) {
    // Set stowed cargo and hardpoints/fittings
    context.system.hardpoints.value = 0;
    context.system.fittings.value = 0;
    context.system.cargoEncumbrance.stowed.value = 0;
    context.items.forEach(item => {
      if (CONFIG.CWN.inventoryItemTypes.includes(item.type)) {
        context.system.cargoEncumbrance.stowed.value += item.system.encumbrance * item.system.quantity;
      } else if (item.type === "fitting") {
        context.system.fittings.value++;
      } else if (item.type === "weapon") {
        context.system.hardpoints.value++;
      }
    });
  }

  _prepareVerbsAndSubjects(context) {
    // Initialize containers.
    const verbs = [];
    const subjects = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to verbs.
      if (i.type === "verb") {
        verbs.push(i);
      }
      // Append to subjects.
      else if (i.type === "subject") {
        subjects.push(i);
      }
    }

    // Assign and return
    context.verbs = verbs;
    context.subjects = subjects;
  }

  _prepareVehicleData(context) {
    // Set stowed cargo and hardpoints/fittings
    context.system.hardpoints.value = 0;
    context.system.power.value = 0;
    context.system.mass.value = 0;
    context.items.forEach(item => {
      if (item.type === "vehicleFitting") {
        context.system.power.value += item.system.power;
        context.system.mass.value += item.system.mass;
      } else if (item.type === "weapon") {
        context.system.hardpoints.value++;
        context.system.power.value += item.system.mounted.power;
        context.system.mass.value += item.system.mounted.mass;
      }
    });
  }

  _prepareServerData(context) {
    context.system.nodes.value = context.system.nodeDetails.length;
    context.system.demons.value = 0;
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
      else if (CONFIG.CWN.inventoryItemTypes.includes(i.type)) {
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

  _prepareCyberware(context) {
    // Initialize containers.
    const body = [];
    const head = [];
    const skin = [];
    const limb = [];
    const sensory = [];
    const medical = [];
    const nerve = [];

    // Iterate through items, allocating to containers
    for (let i of context.items.filter(item => item.type === "cyberware")) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to body ware.
      if (i.system.subType === "body") {
        body.push(i);
      }
      // Append to head ware.
      else if (i.system.subType === "head") {
        head.push(i);
      }
      // Append to skin ware.
      else if (i.system.subType === "skin") {
        skin.push(i);
      }
      // Append to limb ware.
      else if (i.system.subType === "limb") {
        limb.push(i);
      }
      // Append to sensory ware.
      else if (i.system.subType === "sensory") {
        sensory.push(i);
      }
      // Append to medical ware.
      else if (i.system.subType === "medical") {
        medical.push(i);
      }
      // Append to nerve ware.
      else if (i.system.subType === "nerve") {
        nerve.push(i);
      }
    }

    // Assign and return
    context.body = body;
    context.head = head;
    context.skin = skin;
    context.limb = limb;
    context.sensory = sensory;
    context.medical = medical;
    context.nerve = nerve;
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

    // Refresh Item
    html.find(".item-refresh").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.refresh();
    });

    // Delete Inventory Item
    html.find(".item-delete").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Rollable abilities.
    html.find(".rollable").click(this._onRoll.bind(this));
    html.find(".rollable-img").hover(this._onRollableItemHover.bind(this));

    // Expandable items
    html.find(".expandable").click(this._toggleItemExpand.bind(this));

    // Skill pill level changes.
    html.find(".skill-level").change(this.updateSkillLevel.bind(this));

    // Readied checkbox changes.
    html.find(".readiable").change(this.updateReadiedFlag.bind(this));

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

  _toggleItemExpand(event) {
    const descriptionElement = event.target.parentElement.parentElement.nextElementSibling;
    $(descriptionElement).toggleClass("hidden");
  }

  _onRollableItemHover(event) {
    if (event.type === "mouseenter") {
      event.target.src = "/icons/svg/d20-black.svg";
    } else if (event.type === "mouseleave") {
      const itemId = event.target.parentElement.parentElement.parentElement.parentElement.dataset.itemId;
      const item = this.actor.items.get(itemId);
      event.target.src = item.img;
    }
  }

  updateReadiedFlag(event) {
    const newReadiedState = event.target.checked;
    const itemId = event.target.dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.system.readied = newReadiedState;
    Item.updateDocuments([{ _id: item._id, system: { readied: newReadiedState } }], { parent: this.actor }).then(updatedItem => console.log("Updated item", updatedItem));
  }

  updateSkillLevel(event) {
    const newSkillLevel = event.target.value;
    const skillId = event.currentTarget.dataset.skillId;
    const skill = this.actor.items.get(skillId);
    skill.system.level = newSkillLevel;
    Item.updateDocuments([{ _id: skill._id, system: { level: newSkillLevel } }], { parent: this.actor }).then(updatedSkill => console.log("Updated skill", updatedSkill));
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
      system: data,
      sort: -1
    };

    // Add cyberware sub-type
    if (type === "cyberware" && data.subtype) {
      itemData.system.subType = data.subtype;
    }

    // Open dialog to let user specify which inventory item type to use
    if (CONFIG.CWN.inventoryItemTypes.includes(type)) {
      this.openCreateItemDialog(itemData);
      return;
    }

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  openCreateItemDialog(itemData) {
    const itemTypeOptions = CONFIG.CWN.inventoryItemTypes.map((k, _v) => `<option value="${k}"}>${k}</option>\n`);
    const createItemDialog = new Dialog({
      title: "Create new item",
      content: DialogTemplates.itemTypeDialog(itemTypeOptions),
      buttons: DialogUtils.createButtons(html => this.handleCreateCustomItem(itemData, html)),
      default: "Create"
    });
    createItemDialog.render(true);
  }

  handleCreateCustomItem(itemData, html) {
    const selectedItemType = html.find('[name="itemTypeSelect"]').val();
    console.info("selectedItemType", selectedItemType);
    itemData.type = selectedItemType;
    itemData.name = `New ${selectedItemType.capitalize()}`;

    return Item.create(itemData, { parent: this.actor });
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
      if (dataset.rollType === "skill") {
        if (this.actor.type === "character") {
          const skillId = element.closest(".skill").dataset.itemId;
          const skill = this.actor.items.get(skillId);
          this.openSkillDialog(skill);
        } else {
          this.openBasicSkillDialog(this.actor.system.skillBonus);
        }
      } else if (dataset.rollType === "weapon") {
        const weaponId = element.closest(".item").dataset.itemId;
        const weapon = this.actor.items.get(weaponId);
        if (this.actor.type === "npc") {
          this.actor.openNpcAttackTypeDialog(weapon);
        } else if (this.actor.type === "drone") {
          this.actor.openDroneWeaponDialog(weapon);
        } else if (this.actor.type === "vehicle") {
          this.openVehicleWeaponDialog(weapon);
        } else {
          this.actor.openWeaponDialog(weapon);
        }
      } else if (dataset.rollType === "save") {
        let save;
        if (this.actor.type === "character") {
          save = this.actor.system.savingThrows.saveTargets[dataset.save];
        } else {
          // Build general NPC save
          save = {
            name: "Save",
            label: "Generic Saving Throw",
            value: this.actor.system.saveTarget
          };
        }
        this.openSaveDialog(save);
      } else if (dataset.rollType === "morale") {
        this.openMoraleDialog(this.actor.system.moraleTarget);
      } else if (dataset.rollType === "hitdice") {
        this.rollHitDice();
      } else {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
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

  rollHitDice() {
    const roll = new Roll(this.actor.system.hitDice);
    roll.evaluate({async: false});
    this.actor.system.health.max = roll.total;
    this._render();
  }

  openBasicSkillDialog(skillBonus) {
    const skillDialog = new Dialog({
      title: "Roll Skill",
      content: DialogTemplates.basicRollDialog(),
      buttons: DialogUtils.rollButtons(html => this.handleBasicSkillRoll(skillBonus, html)),
      default: "Roll"
    });
    skillDialog.render(true);
  }

  handleBasicSkillRoll(skillBonus, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    this.rollBasicSkill({ skillBonus, situationalBonus });
  }

  rollBasicSkill(rollData) {
    console.log("Rolling [skill]", rollData);
    const roll = new Roll(CONFIG.CWN.system.basicSkillCheckFormula, rollData);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const flavor = "[skill] Generic Skill Check";
    roll.toMessage({ speaker, rollMode, flavor }).then(message => console.log(message));
  }

  openMoraleDialog(moraleTarget) {
    const moraleDialog = new Dialog({
      title: "Roll Morale",
      content: DialogTemplates.basicRollDialog(),
      buttons: DialogUtils.rollButtons(html => this.handleMoraleRoll(moraleTarget, html)),
      default: "Roll"
    });
    moraleDialog.render(true);
  }

  handleMoraleRoll(moraleTarget, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    this.rollMorale({value: moraleTarget}, { situationalBonus });
  }

  rollMorale(moraleCheck, rollData) {
    console.log("Rolling [morale]", rollData);
    const roll = new Roll(CONFIG.CWN.system.moraleFormula, rollData);

    roll.render().then(rollRender => {
      moraleCheck.type = "morale";
      moraleCheck.name = "Morale Check";
      const messageData = ChatUtils.initializeChatData(this.actor, moraleCheck);
      const moraleCheckPassed = roll.total < moraleCheck.value;
      const content = ChatRenders.passOrFailRender(rollRender, moraleCheckPassed);
      ChatMessage.create({ ...messageData, content }).then(message => console.log(message));
    });
  }

  openVehicleWeaponDialog(weapon) {
    const currentCharacter = game.users.current.character;
    if (currentCharacter) {
      const vehicleGunnerTypeDialog = new Dialog({
        title: "Choose a gunner",
        buttons: DialogUtils.gunnerModeButtons(
          _html => this.handleGunnerSelect(weapon),
          _html => currentCharacter.openWeaponDialog(weapon)
        ),
        default: "Manual"
      });
      vehicleGunnerTypeDialog.render(true);
    } else {
      this.handleGunnerSelect(weapon);
    }
  }

  handleGunnerSelect(weapon) {
    const availableGunners = game.users.current.isGM
      ? game.actors.filter(actor => ["character", "npc"].includes(actor.type))
      : game.actors.filter(actor => actor.type === "character" && actor.isOwner);
    const gunnerOptions = availableGunners.map(gunner => `<option value="${gunner._id}">${gunner.name}</option>\n`);
    const vehicleGunnerDialog = new Dialog({
      title: "Choose a gunner",
      content: DialogTemplates.gunnerSelectDialog(gunnerOptions),
      buttons: DialogUtils.gunnerButtons(html => this.handleGunnerConfirmation(html, weapon)),
      default: "Confirm"
    });
    vehicleGunnerDialog.render(true);
  }

  handleGunnerConfirmation(html, weapon) {
    const selectedGunnerId = html.find('[name="gunnerSelect"]').val();
    const selectedGunner = game.actors.find(actor => actor._id === selectedGunnerId);
    selectedGunner.openWeaponDialog(weapon);
  }

  openSkillDialog(skill) {
    const abilityOptions = Object.entries(this.actor.system.abilities).map((k, _v) => `<option value="${k[0]}" ${skill.system.attribute === k[0] ? "selected" : ""}>${k[1].label}</option>\n`);
    const skillDialog = new Dialog({
      title: `Roll ${skill.name}`,
      content: DialogTemplates.skillRollDialog(abilityOptions),
      buttons: DialogUtils.rollButtons(html => this.handleSkillRoll(skill, html)),
      default: "Roll"
    });
    skillDialog.render(true);
  }

  handleSkillRoll(skill, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    const selectedAttributeCode = html.find('[name="attributeSelect"]').val();
    const attributeMod = this.actor.system.abilities[selectedAttributeCode].mod;

    // Update default attribute for this skill for next time
    skill.system.attribute = selectedAttributeCode;
    Item.updateDocuments([{ _id: skill._id, system: { attribute: selectedAttributeCode } }], { parent: this.actor }).then(updates => console.log("Updated skill", updates));

    this.rollSkill(skill, { attributeMod, level: skill.system.level, situationalBonus });
  }

  rollSkill(skill, rollData) {
    console.log(`Rolling [${skill.type}] ${skill.name}`, rollData);
    const roll = new Roll(skill.system.rollFormula, rollData);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const flavor = `[${skill.type}] ${skill.name}`;
    roll.toMessage({ speaker, rollMode, flavor }).then(message => console.log(message));
  }

  openSaveDialog(save) {
    const saveDialog = new Dialog({
      title: `Roll ${save.label}`,
      content: DialogTemplates.basicRollDialog(),
      buttons: DialogUtils.rollButtons(html => this.handleSaveRoll(save, html)),
      default: "Roll"
    });
    saveDialog.render(true);
  }

  handleSaveRoll(save, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    this.rollSave(save, { situationalBonus });
  }

  rollSave(save, rollData) {
    console.log(`Rolling [save] ${save.label}`, rollData);
    const roll = new Roll(CONFIG.CWN.system.savingThrowFormula, rollData);

    roll.render().then(rollRender => {
      save.type = "save";
      save.name = save.label;
      const messageData = ChatUtils.initializeChatData(this.actor, save);
      const savePassed = roll.total >= save.value;
      const content = ChatRenders.passOrFailRender(rollRender, savePassed);
      ChatMessage.create({ ...messageData, content }).then(message => console.log(message));
    });
  }
}
