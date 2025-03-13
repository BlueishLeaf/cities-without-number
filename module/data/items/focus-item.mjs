import {BaseItemData} from "./templates/base-item.mjs";
import {integerField} from "../../helpers/schema-helpers.mjs";

export default class FocusItemData extends BaseItemData {
    static defineSchema() {
        const baseData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...baseData,
            level: integerField(1),
            level1Benefit: new fields.StringField({required: true, blank: true}),
            level2Benefit: new fields.StringField({required: true, blank: true})
        }
    }
}