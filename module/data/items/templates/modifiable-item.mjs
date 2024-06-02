import {TransportableItemData} from "./transportable-item.mjs";

export class ModifiableItemData extends TransportableItemData {
    static defineSchema() {
        const fields = foundry.data.fields;
        const transportableData = super.defineSchema();
        return {
            ...transportableData,
            mods: new fields.ArrayField(new fields.StringField({ required: false, blank: true }))
        }
    }
}