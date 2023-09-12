/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CitiesWithoutNumberActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "actor"],
      template: "systems/cities-without-number/templates/actor/actor-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/cities-without-number/templates/actor/actor-${this.actor.type}-sheet.html`;
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
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
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
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.CWN.abilities[k]) ?? k;
    }

    // Set max system strain
    context.system.systemStrain.max = context.system.abilities["con"].value;
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

    // Skill pill
    html.find(".skill-level").change(ev => this.updateSkillLevel(ev, this.actor));

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

  updateSkillLevel(event, actor) {
    const newSkillLevel = event.target.value;
    const skillId = event.currentTarget.dataset.skillId;
    const skill = actor.items.get(skillId);
    console.log(`Updating skill level of ${skill.name} (${skill._id}) to ${newSkillLevel}`);
    skill.system.level = newSkillLevel;
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
      if (dataset.rollType == "gear" || dataset.rollType == "armor") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      } else if (dataset.rollType == "skill") {
        const skillId = element.closest(".skill").dataset.itemId;
        const skill = this.actor.items.get(skillId);
        this.openSkillDialog(skill);       
      } else if (dataset.rollType == "weapon") {
        const weaponId = element.closest(".item").dataset.itemId;
        const weapon = this.actor.items.get(weaponId);
        this.openWeaponDialog(weapon);       
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
    this._prepareCharacterData(this.actor); // Assign localised labels
    const abilityOptions = Object.entries(this.actor.system.abilities).map((k, v) => `<option value="${k[1].mod}">${k[1].label}</option>\n`);
    console.log(this.actor.items);
    const skills = this.actor.items.filter(item => item.type === "skill");
    const skillOptions = skills.map(skill => `<option value="${skill.system.level}">${skill.name}</option>\n`);
    const weaponDialog = new Dialog({
      title: `Roll ${weapon.name}`,
      content: `
        <div class="form-group">
          <label for="attributeSelect">Choose an attribute for this weapon: </label>
          <select name="attributeSelect">
              ${abilityOptions}
          </select>
          <br>
          <label for="skillSelect">Choose a skill for this weapon: </label>
          <select name="skillSelect">
              ${skillOptions}
          </select>
          <br>
          <label for "bonusInput">Bonus: </label>
          <input type="number" name="bonusInput" value="0"/>
        </div>
        <br>
      `,
      buttons: {
       roll: {
        icon: '<i class="fas fa-check"></i>',
        label: "Roll",
        callback: (html) => {
          const attributeMod = html.find('[name="attributeSelect"]').val();
          const skillMod = html.find('[name="skillSelect"]').val();
          const attackBonus = this.actor.system.attackBonus;
          const bonus = html.find('[name="bonusInput"]').val();
          this.rollItem(weapon, { attributeMod, skillMod, attackBonus, bonus });
        }
       },
       cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
        callback: () => console.log("Cancelled weapon dialog")
       }
      },
      default: "roll"
     });
     weaponDialog.render(true);  
  }

  openSkillDialog(skill) {
    this._prepareCharacterData(this.actor); // Assign localised labels
    const options = Object.entries(this.actor.system.abilities).map((k, v) => `<option value="${k[1].mod}">${k[1].label}</option>\n`);
    const skillDialog = new Dialog({
      title: `Roll ${skill.name}`,
      content: `
        <div class="form-group">
          <label for="attributeSelect">Choose an attribute for this skill: </label>
          <select name="attributeSelect">
              ${options}
          </select>
          <br>
          <label for "bonusInput">Bonus: </label>
          <input type="number" name="bonusInput" value="0"/>
        </div>
        <br>
      `,
      buttons: {
       roll: {
        icon: '<i class="fas fa-check"></i>',
        label: "Roll",
        callback: (html) => {
          const attributeMod = html.find('[name="attributeSelect"]').val();
          const bonus = html.find('[name="bonusInput"]').val();
          this.rollItem(skill, { attributeMod, bonus });
        }
       },
       cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
        callback: () => console.log("Cancelled dialog")
       }
      },
      default: "roll"
     });
     skillDialog.render(true);  
  }

  rollItem(item, rollData) {
    console.log(`Rolling [${item.type}] ${item.name}`);
    console.log(rollData);
    const roll = new Roll(item.system.rollFormula, rollData);

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${item.type}] ${item.name}`;
    roll.toMessage({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label
    });
  }
}
