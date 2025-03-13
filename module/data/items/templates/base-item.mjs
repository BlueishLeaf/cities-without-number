import CWNDataModel from "../../base-model.mjs";

export class BaseItemData extends CWNDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            description: new fields.HTMLField({initial: ''})
        }
    }
}