import { PurchasableItemData } from "./templates/purchasable-item.mjs";

export default class SubjectItemData extends PurchasableItemData {
  static defineSchema() {
    const purchasableData = super.defineSchema();
    const fields = foundry.data.fields;
    return {
      ...purchasableData,
      type: new fields.StringField({ required: false, blank: true }),
    };
  }
}
