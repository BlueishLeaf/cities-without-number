/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CitiesWithoutNumberItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cwn", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cities-without-number/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.hbs`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.hbs`.
    console.info("path", `${path}/item-${this.item.type}-sheet.hbs`);
    return `${path}/item-${this.item.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    const config = CONFIG;

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;
    context.config = config;
    context.flags.isAccessory = itemData.system.subType === "accessory";

    // Populate mods if applicable
    if (itemData.system.mods) {
      context.mods = itemData.system.mods
        .map(id => this.actor.items.get(id))
        .sort((a, b) => a.sort - b.sort);
    }

    return context;
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

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Rollable abilities.
    html.find(".rollable").click(this._onRoll.bind(this));
    html.find(".rollable-img").hover(this._onRollableItemHover.bind(this));

    // Expandable items
    html.find(".expandable").click(this._toggleItemExpand.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();

      let childCollection; let systemUpdate;
      if (this.item.system.mods && item.type === "mod") {
        childCollection = this.item.system.mods;
        systemUpdate = { mods: childCollection };
      } else return;

      childCollection.splice(childCollection.indexOf(item._id), 1);
      Item.updateDocuments([{_id: this.item._id, system: systemUpdate}], {parent: this.actor}).then(updates => console.log("Updated item", updates));
    });

    // Drag events for macros.
    if (this.actor && this.actor.isOwner) {
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

  _canDragStart(_selector) {
    return this.isEditable;
  }

  _canDragDrop(_selector) {
    return this.isEditable;
  }

  _onDragStart(event) {
    const li = event.currentTarget;
    if ( event.target.classList.contains("content-link") ) return;

    // Create drag data
    let dragData;

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const actor = this.actor;
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if ( allowed === false ) return;
    if ( data.type !== "Item" ) return;

    return this._onDropItem(event, data);
  }

  async _onDropItem(event, data) {
    if ( !this.actor.isOwner ) return false;
    const item = await Item.implementation.fromDropData(data);
    const itemData = item.toObject();

    // Handle item sorting within the same Actor
    if ( this.actor.uuid === item.parent?.uuid ) return this._onSortItem(event, itemData);

    // Create the owned item
    return this._onDropItemCreate(itemData);
  }

  async _onDropItemCreate(itemData) {
    itemData = itemData instanceof Array ? itemData : [itemData];
    let childCollection; let systemUpdate;
    if (this.item.system.mods && itemData[0].type === "mod") {
      childCollection = this.item.system.mods;
      systemUpdate = { mods: this.item.system.mods };
    } else return;

    const newItems = await this.actor.createEmbeddedDocuments("Item", itemData);
    childCollection.push(newItems[0]._id);
    Item.updateDocuments([{_id: this.item._id, system: systemUpdate}], {parent: this.actor}).then(updates => console.log("Updated item", updates));
    return newItems;
  }

  _onSortItem(event, itemData) {
    // Get the drag source and drop target
    const items = this.actor.items;
    const source = items.get(itemData._id);
    const dropTarget = event.target.closest("[data-item-id]");
    if ( !dropTarget ) return;
    const target = items.get(dropTarget.dataset.itemId);

    // Don't sort on yourself
    if ( source.id === target.id ) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for ( let el of dropTarget.parentElement.children ) {
      const siblingId = el.dataset.itemId;
      if ( siblingId && (siblingId !== source.id) ) siblings.push(items.get(el.dataset.itemId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(source, {target, siblings});
    const updateData = sortUpdates.map(u => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    this.actor.updateEmbeddedDocuments("Item", updateData).then(() => this.item.sheet.render(this.item));
  }

  swapElements(array, index1, index2) {
    return [array[index1], array[index2]] = [array[index2], array[index1]];
  }

  /**
   * Handle creating a new Owned Item for the item using initial data defined in the HTML dataset
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
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system.type;

    // Finally, create the item!
    const createdItem = await Item.create(itemData, {parent: this.actor});

    let childCollection; let systemUpdate;
    if (this.item.system.mods && createdItem.type === "mod") {
      childCollection = this.item.system.mods;
      systemUpdate = { mods: childCollection };
    } else return;

    childCollection.push(createdItem._id);
    Item.updateDocuments([{_id: this.item._id, system: systemUpdate}], {parent: this.actor}).then(updates => console.log("Updated item", updates));
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;

    // Handle item rolls.
    const itemId = element.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) return item.roll();
  }
}
