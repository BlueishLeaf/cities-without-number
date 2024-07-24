import {BaseItemData} from "./templates/base-item.mjs";
import {integerField} from "../../helpers/schema-helpers.mjs";

export default class ChromeSyndromeItemData extends BaseItemData {
  static defineSchema() {
    const baseData = super.defineSchema();
    return {
      ...baseData,
      effect: new fields.StringField({ required: false, blank: true }),
      maxAlienationMod: integerField(0)
    }
  }
}