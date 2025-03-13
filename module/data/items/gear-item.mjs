import {TransportableItemData} from "./templates/transportable-item.mjs";

export default class GearItemData extends TransportableItemData {
    static defineSchema() {
        const fields = foundry.data.fields;
        const transportableData = super.defineSchema();
        return {
            ...transportableData,
            wearable: new fields.BooleanField({required: true, initial: false})
        }
    }
}