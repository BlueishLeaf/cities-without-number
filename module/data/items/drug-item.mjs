import { SkillRequiredItemData } from "./templates/skill-required-item.mjs";
import { TransportableItemData } from "./templates/transportable-item.mjs";

export default class DrugItemData extends TransportableItemData {
  static defineSchema() {
    const transportableData = super.defineSchema();
    const skillRequiredData = SkillRequiredItemData.defineSchema();
    return {
      ...transportableData,
      ...skillRequiredData,
    };
  }
}
