import {BaseItemData} from "./templates/base-item.mjs";

export default class ContactItemData extends BaseItemData {
    static defineSchema() {
        const baseData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...baseData,
            relationship: new fields.StringField({required: true, blank: true}),
            summary: new fields.StringField({required: true, blank: true})
        }
    }
}