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
            specialist: new fields.StringField({required: true, initial: 'None (2d6)'}),
            level: new fields.NumberField({required: true, nullable: false, integer: true, initial: -1, min: -1})
        }
    }
}