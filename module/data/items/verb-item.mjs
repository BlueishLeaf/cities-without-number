import { PurchasableItemData } from "./templates/purchasable-item.mjs";
import { integerField } from "../../helpers/schema-helpers.mjs";

export default class VerbItemData extends PurchasableItemData {
  static defineSchema() {
    const purchasableData = super.defineSchema();
    const fields = foundry.data.fields;
    return {
      ...purchasableData,
      targetTypes: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      accessCost: integerField(0),
      skillCheckMod: integerField(0),
      selfTerminating: new fields.BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}
