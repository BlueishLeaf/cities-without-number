import {ModifiableItemData} from "./modifiable-item.mjs";

export class ConcealableItemData extends ModifiableItemData {
    static defineSchema() {
        const fields = foundry.data.fields;
        const modifiableData = super.defineSchema();
        return {
            ...modifiableData,
            concealment: new fields.StringField({ required: true, blank: true }),
            subType: new fields.StringField({ required: true, blank: true })
        }
    }
}