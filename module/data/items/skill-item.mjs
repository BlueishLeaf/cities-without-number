import {BaseItemData} from "./templates/base-item.mjs";
import {AttributeRequiredItemData} from "./templates/attribute-required-item.mjs";

export default class SkillItemData extends BaseItemData {
    static defineSchema() {
        const baseData = super.defineSchema();
        const attributeRequiredData = AttributeRequiredItemData.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...baseData,
            ...attributeRequiredData,
            rollFormula: new fields.StringField({ required: true, initial: '2d6 + @level + @attributeMod + @situationalBonus + @armorPenalty' }),
            level: new fields.NumberField({ required: true, nullable: false, integer: true, initial: -1, min: -1 })
        }
    }
}