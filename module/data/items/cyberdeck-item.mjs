import {ModifiableItemData} from "./templates/modifiable-item.mjs";
import {integerField} from "../../helpers/schema-helpers.mjs";

export default class CyberdeckItemData extends ModifiableItemData {
    static defineSchema() {
        const fields = foundry.data.fields;
        const modifiableData = super.defineSchema();
        return {
            ...modifiableData,
            bonusAccess: integerField(0),
            memory: integerField(0),
            shielding: integerField(0),
            cpu: integerField(0),
            verbs: new fields.ArrayField(new fields.StringField({required: false, blank: true})),
            subjects: new fields.ArrayField(new fields.StringField({required: false, blank: true}))
        }
    }
}