import * as ChatRenders from "../helpers/chat-renders.mjs";
import * as ChatUtils from "../helpers/chat-utils.mjs";
import * as DialogTemplates from "../helpers/dialog-templates.mjs";
import * as DialogUtils from "../helpers/dialog-utils.mjs";
import {actorConfigDialogs} from "../helpers/actor-config-dialogs.mjs";
import {actorConfigHandlers} from "../helpers/actor-config-handlers.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CitiesWithoutNumberActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "actor"],
      template: "systems/cities-without-number/templates/actor/actor-sheet.hbs",
      width: 650,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }]
    });
  }

  /** @override */
  get template() {
    return `systems/cities-without-number/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    context.config = CONFIG;

    // Prepare actor data and items.
    this._prepareActorData(actorData.type, context);
    this.actor.system = context.system;

    // Update open item renders
    this.actor.items.filter(item => item._sheet && item._sheet.rendered)
      .forEach(openItem => openItem.sheet._render(openItem));

    return context;
  }

  _prepareActorData(actorType, context) {
    this._prepareItems(context);
    switch (actorType) {
      case "character":
        this._prepareCyber(context);
        this._prepareCharacterData(context);
        this._prepareBiographyData(context);
        break;
      case "npc":
        this._prepareCyber(context);
        break;
      case "drone":
        this._prepareOperatorData(context);
        this._prepareOperators(context);
        this._prepareDroneData(context);
        break;
      case "vehicle":
        this._prepareVehicleData(context);
        break;
      default:
        break;
    }
  }

  async _onDropItem(event, data) {
    if (!this.actor.isOwner) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Ignore mods and other items that are supposed to be attached to a child item
    if (!["drone", "vehicle", "server"].includes(this.actor.type) && ["mod", "implant-complication", "chrome-syndrome", "verb", "subject", "node", "demon"].includes(itemData.type)) return;

    // Handle item sorting within the same Actor
    if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }

  _prepareOperatorData(context) {
    if (!this.actor.system.operator || this.actor.system.operator === "undefined") return;

    const operatorFound = game.actors.find(actor => actor._id === this.actor.system.operator);
    if (!operatorFound) return;

    const operator = operatorFound.toObject(false); // Use safe clone
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
    // Set max and permanent system strain
    context.system.systemStrain.max = context.system.abilities.con.value
    if (context.system.systemStrain.maxModifier) {
      context.system.systemStrain.max += Number(context.system.systemStrain.maxModifier);
    }
    if (context.system.lifestyle.systemStrainMod) {
      context.system.systemStrain.max += Number(context.system.lifestyle.systemStrainMod);
    }
    context.system.systemStrain.permanent = 0;
    if (context.system.systemStrain.permanentModifier) {
      context.system.systemStrain.permanent += Number(context.system.systemStrain.permanentModifier);
    }

    // Set max and permanent alienation score
    console.info(context.system)
    context.system.alienationScore.max = context.system.abilities.wis.value + context.system.alienationScore.maxModifier
    context.system.alienationScore.permanent = context.system.alienationScore.permanentModifier;

    // Set stowed and readied items
    context.system.encumbrance.stowed.max = context.system.abilities.str.value + context.system.encumbrance.stowed.maxBonus;
    context.system.encumbrance.readied.max = Math.floor(context.system.abilities.str.value / 2) + context.system.encumbrance.readied.maxBonus;
    context.system.encumbrance.stowed.value = 0;
    context.system.encumbrance.readied.value = 0;

    context.implantComplication = [];
    context.chromeSyndrome = [];

    context.items.forEach(item => {
      if (item.system.readied !== undefined) {
        if (item.system.readied && !item.system.wearable) {
          context.system.encumbrance.readied.value += item.system.encumbrance * item.system.quantity;
        } else {
          context.system.encumbrance.stowed.value += item.system.encumbrance * item.system.quantity;
        }
      }
      // Calculate permanent system strain based on the cyberware equipped
      if (item.type === "cyberware" && item.system.systemStrain) {
        context.system.systemStrain.permanent += item.system.systemStrain;
        context.system.alienationScore.permanent += item.system.alienationCost;

        if (item.system.chromeSyndromes) {
          item.system.chromeSyndromes.forEach(id => {
            const syndrome = this.actor.items.get(id);
            if (syndrome) {
              context.system.alienationScore.max += syndrome.system.maxAlienationMod;
              context.chromeSyndrome.push(syndrome);
            }
          });
        }

        if (item.system.implantComplications) {
          item.system.implantComplications.forEach(id => {
            const complication = this.actor.items.get(id);
            if (complication) {
              context.implantComplication.push(complication);
            }
          });
        }
      }
    });

    context.system.systemStrain.value = context.system.systemStrain.permanent + context.system.systemStrain.temporary;
    context.system.alienationScore.value = context.system.alienationScore.permanent + context.system.alienationScore.temporary;

    // Calculate maintenance score
    const fixSkill = context.skill.find(skill => skill.name.toLowerCase() === "fix");
    if (fixSkill) {
      // Floor the value to 0 if fix is -1 or something
      context.system.maintenanceScore.max = Math.max((context.system.abilities['int'].mod + context.system.abilities['con'].mod) + (3 * fixSkill.system.level) + context.system.maintenanceScore.maxBonus, 0);
    }
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
        context.system.fittings.value += item.system.quantity;
      } else if (item.type === "weapon") {
        context.system.hardpoints.value++;
      }
    });
  }

  _prepareVehicleData(context) {
    // Set stowed cargo and hardpoints/fittings
    context.system.hardpoints.value = 0;
    context.system.power.value = 0;
    context.system.mass.value = 0;
    context.items.forEach(item => {
      if (item.type === "vehicleFitting") {
        context.system.power.value += item.system.power * item.system.quantity;
        context.system.mass.value += item.system.mass * item.system.quantity;
      } else if (item.type === "weapon") {
        context.system.hardpoints.value++;
        context.system.power.value += item.system.mounted.power;
        context.system.mass.value += item.system.mounted.mass;
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
    context.items.forEach(item => {
      if (context[item.type] === undefined) {
        context[item.type] = [];
      }
      context[item.type].push(item);
    });

    // Group inventory items together
    context.inventory = [];
    CONFIG.CWN.inventoryItemTypes.forEach(inventoryItemType => {
      if (context[inventoryItemType] instanceof Array) {
        context.inventory.push(...context[inventoryItemType]);
      }
    });
  }

  _prepareCyber(context) {
    let totalCyberCost = 0;

    if (context.cyberware === undefined) {
      context.cyberware = [];
    }

    context.cyberware.forEach(cyberItem => {
      if (context[cyberItem.system.subType] === undefined) {
        context[cyberItem.system.subType] = [];
      }
      context[cyberItem.system.subType].push(cyberItem);

      totalCyberCost += cyberItem.system.cost ? cyberItem.system.cost : 0;
    })

    context.cyberwareMaintenanceCost = Math.round((totalCyberCost / 100) * 5);
    this.actor.system.cyberwareMaintenanceCost = context.cyberwareMaintenanceCost;
  }

  _prepareBiographyData(context) {
    context.goals = context.system.goals;
    context.languages = context.system.languages;
    context.totalMonthlyCost = context.cyberwareMaintenanceCost + context.system.lifestyle.monthlyCost + context.system.miscMonthlyCosts;
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

    // Manipulate list items
    html.find(".list-item-create").click(this._onListItemCreate.bind(this));
    html.find(".list-item-delete").click(this._onListItemDelete.bind(this));

    // Configurable buttons
    html.find(".configurable").click(this._onConfig.bind(this));

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

  async _onListItemCreate(event) {
    event.preventDefault();
    const listType = event.currentTarget.dataset.listType;

    if (this.actor.system[listType] instanceof Array) {
      this.actor.system[listType].push('');

      const systemUpdate = {[listType]: this.actor.system[listType]}
      Actor.updateDocuments([{_id: this.actor._id, system: systemUpdate}]).then(updates => console.log("Updated actor", updates));
    }
  }

  async _onListItemDelete(event) {
    event.preventDefault();
    const listType = event.currentTarget.dataset.listType;

    if (this.actor.system[listType] instanceof Array) {
      const idx = this.actor.system[listType].findIndex(item => item === event.currentTarget.parentNode.children[0].value);
      if (idx > -1) {
        this.actor.system[listType].splice(idx, 1);

        const systemUpdate = {[listType]: this.actor.system[listType]}
        Actor.updateDocuments([{_id: this.actor._id, system: systemUpdate}]).then(updates => console.log("Updated actor", updates));
      }
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
    const selectedItem = this.actor.items.get(itemId);
    selectedItem.system.readied = newReadiedState;

    let itemUpdates = [{ _id: selectedItem._id, system: { readied: newReadiedState } }];
    // Un-equip other armor if readied item is also armor
    if (selectedItem.type === "armor" && selectedItem.system.subType === "armor" && selectedItem.system.readied) {
      const otherEquippedArmorItems = this.actor.items.filter(actorItem => actorItem.type === "armor" && actorItem.system.subType === "armor" && actorItem.system.readied && actorItem.id !== selectedItem.id);
      otherEquippedArmorItems.forEach(equippedArmorItem => itemUpdates.push({ _id: equippedArmorItem._id, system: { readied: false } }));

      // If newly equipped armor is a suit, disable any accessories that are incompatible with suit armors
      if (selectedItem.system.isSuit) {
        const incompatibleAccessories = this.actor.items.filter(actorItem => actorItem.type === "armor" && actorItem.system.subType === "accessory" && !actorItem.system.canEquipWithSuit && actorItem.system.readied);
        incompatibleAccessories.forEach(incompatibleAccessory => itemUpdates.push({ _id: incompatibleAccessory._id, system: { readied: false } }))
      }
    }
    Item.updateDocuments(itemUpdates, { parent: this.actor }).then(updatedItems => console.log("Updated items", updatedItems));
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
    } else if (type === "contact") {
      itemData.img = 'icons/svg/mystery-man.svg';
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
      default: "create"
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
        if (this.actor.type === "character" || this.actor.type === "drone") {
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
          save = this.actor.system.savingThrows[dataset.save];
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
      } else if (dataset.rollType === "alienation") {
        this.openAlienationDialog(this.actor.system.alienationScore.value);
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

  _onConfig(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    const configDialog = new Dialog({
      title: `Configure ${dataset.configLabel}`,
      content: actorConfigDialogs[dataset.configType](this.actor.system),
      buttons: DialogUtils.confirmButtons(html => actorConfigHandlers[dataset.configType](this.actor, html)),
      default: 'roll'
    });
    configDialog.render(true);
  }

  rollHitDice() {
    const roll = new Roll(this.actor.system.hitDice);
    roll.evaluate().then(result => {
      this.actor.system.health.max = result.total;
      this._render();
    });
  }

  openBasicSkillDialog(skillBonus) {
    const skillDialog = new Dialog({
      title: "Roll Skill",
      content: DialogTemplates.basicRollDialog(),
      buttons: DialogUtils.rollButtons(html => this.handleBasicSkillRoll(skillBonus, html)),
      default: "roll"
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
      default: "roll"
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

  openAlienationDialog(alienationScoreValue) {
    const alienationDialog = new Dialog({
      title: "Roll Alienation",
      content: DialogTemplates.basicRollDialog(),
      buttons: DialogUtils.rollButtons(html => this.handleAlienationRoll(alienationScoreValue, html)),
      default: "roll"
    });
    alienationDialog.render(true);
  }

  handleAlienationRoll(alienationScoreValue, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    this.rollAlienation({value: alienationScoreValue}, { situationalBonus });
  }

  rollAlienation(alienationCheck, rollData) {
    console.log("Rolling [alienation]", rollData);
    const roll = new Roll(CONFIG.CWN.system.alienationCheckFormula, rollData);

    roll.render().then(rollRender => {
      alienationCheck.type = "alienation";
      alienationCheck.name = "Alienation Check";
      const messageData = ChatUtils.initializeChatData(this.actor, alienationCheck);
      const alienationCheckPassed = roll.total > alienationCheck.value;
      const content = ChatRenders.passOrFailRender(rollRender, alienationCheckPassed);
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
        default: "manual"
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
      buttons: DialogUtils.confirmButtons(html => this.handleGunnerConfirmation(html, weapon)),
      default: "confirm"
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
    const specialistOptions = ['None (2d6)', 'Level 1 (3d6)', 'Level 2 (4d6)'].map((k, _v) => `<option value="${k}" ${skill.system.specialist === k ? "selected" : ""}>${k}</option>\n`);
    const skillDialog = new Dialog({
      title: `Roll ${skill.name}`,
      content: DialogTemplates.skillRollDialog(abilityOptions, specialistOptions),
      buttons: DialogUtils.rollButtons(html => this.handleSkillRoll(skill, html)),
      default: "roll"
    });
    skillDialog.render(true);
  }

  handleSkillRoll(skill, html) {
    const situationalBonus = html.find('[name="situationalBonusInput"]').val();

    const selectedAttributeCode = html.find('[name="attributeSelect"]').val();
    const attributeMod = this.actor.system.abilities[selectedAttributeCode].mod;

    const selectedSpecialistLevel = html.find('[name="specialistSelect"]').val();

    // Update default attribute for this skill for next time
    skill.system.attribute = selectedAttributeCode;
    skill.system.specialist = selectedSpecialistLevel;
    Item.updateDocuments([{ _id: skill._id, system: { attribute: selectedAttributeCode, specialist: selectedSpecialistLevel } }], { parent: this.actor }).then(updates => console.log("Updated skill", updates));

    // Apply armor penalty if applicable to this skill
    let armorPenalty = 0;
    const equippedHeavyArmorItems = this.actor.items.filter(item => item.type === "armor" && item.system.readied && item.system.isHeavy);
    if (['exert', 'sneak'].includes(skill.name.toLowerCase()) && equippedHeavyArmorItems.length > 0) {
      armorPenalty = -equippedHeavyArmorItems.length;
    }

    this.rollSkill(skill, { attributeMod, level: skill.system.level, situationalBonus, armorPenalty });
  }

  rollSkill(skill, rollData) {
    console.log(`Rolling [${skill.type}] ${skill.name}`, rollData);
    const roll = new Roll(this.determineSkillRollFormula(skill.system.specialist), rollData);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const flavor = `[${skill.type}] ${skill.name}`;
    roll.toMessage({ speaker, rollMode, flavor }).then(message => console.log(message));
  }

  determineSkillRollFormula(specialistLevel) {
    switch (specialistLevel) {
      case 'Level 1 (3d6)':
        return CONFIG.CWN.system.specialisedLevel1SkillRollFormula;
      case 'Level 2 (4d6)':
        return CONFIG.CWN.system.specialisedLevel2SkillRollFormula;
      case 'None (2d6)':
      default:
        return CONFIG.CWN.system.skillRollFormula;
    }
  }

  openSaveDialog(save) {
    const saveDialog = new Dialog({
      title: `Roll ${save.label}`,
      content: DialogTemplates.basicRollDialog(),
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
