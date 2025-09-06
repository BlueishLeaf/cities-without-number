import { BaseItemData } from "./templates/base-item.mjs";

export default class NodeItemData extends BaseItemData {
  static defineSchema() {
    const baseData = super.defineSchema();
    const fields = foundry.data.fields;
    return {
      ...baseData,
      unblockedConnections: new fields.StringField({
        required: true,
        blank: true,
      }),
      blockedConnections: new fields.StringField({
        required: true,
        blank: true,
      }),
    };
  }
}
