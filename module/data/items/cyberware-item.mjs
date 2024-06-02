import {integerField} from "../../helpers/schema-helpers.mjs";
import {ConcealableItemData} from "./templates/concealable-item.mjs";

export default class CyberwearItemData extends ConcealableItemData {
    static defineSchema() {
        const fields = foundry.data.fields;
        const concealableData = super.defineSchema();
        return {
            ...concealableData,
            systemStrain: integerField(0),
            effect: new fields.StringField({ required: true, blank: true })
        }
    }
}