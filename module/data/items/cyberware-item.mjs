import {decimalField, integerField} from "../../helpers/schema-helpers.mjs";
import {ConcealableItemData} from "./templates/concealable-item.mjs";

export default class CyberwearItemData extends ConcealableItemData {
    static defineSchema() {
        const fields = foundry.data.fields;
        const concealableData = super.defineSchema();
        return {
            ...concealableData,
            systemStrain: decimalField(0),
            effect: new fields.StringField({ required: true, blank: true }),
            isDefective: new fields.BooleanField({ required: true, initial: false }),
            defect: new fields.StringField({ required: true, blank: true }),
            alienationCost: integerField(0),
            chromeSyndromes: new fields.ArrayField(new fields.StringField({ required: false, blank: true }))
        }
    }
}