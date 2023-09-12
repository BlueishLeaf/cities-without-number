import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

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
    // editable, the items array, and the effects array.
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

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

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

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

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
      if (dataset.rollType == "item") {
        const itemId = element.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      } else if (dataset.rollType == "skill") {
        const skillId = element.closest(".skill").dataset.itemId;
        const skill = this.actor.items.get(skillId);
        this.openSkillDialog(skill);       
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
          this.rollSkill(skill, attributeMod, bonus);
        }
       },
       cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
        callback: () => console.log("Cancelled skill dialog")
       }
      },
      default: "roll"
     });
     skillDialog.render(true);  
  }

  rollSkill(skill, attributeMod, bonus) {
    console.log(`Rolling Skill: ${skill.name}, Attribute Modifier: ${attributeMod}, Bonus: ${bonus}`);
    console.log(skill.system.rollFormula)
    const roll = new Roll(skill.system.rollFormula, {level: skill.system.level, attributeMod: +attributeMod, bonus: +bonus});
    console.log(roll);
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");
    const label = `[${skill.type}] ${skill.name}`;
    roll.toMessage({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label
    });
  }
}
