import { PurchasableItemData } from "./templates/purchasable-item.mjs";
import { integerField } from "../../helpers/schema-helpers.mjs";

export default class VehicleFittingItemData extends PurchasableItemData {
  static defineSchema() {
    const purchasableData = super.defineSchema();
    const fields = foundry.data.fields;
    return {
      ...purchasableData,
      quantity: integerField(1),
      power: integerField(0),
      mass: integerField(0),
      minimumSize: new fields.StringField({ required: false, blank: true }),
    };
  }
}
