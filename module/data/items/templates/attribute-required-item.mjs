import CWNDataModel from "../../base-model.mjs";

export class AttributeRequiredItemData extends CWNDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            attribute: new fields.StringField({required: true, blank: true})
        }
    }
}