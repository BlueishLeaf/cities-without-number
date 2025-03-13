import {integerField, resourceField} from "../../helpers/schema-helpers.mjs";
import {PurchasableItemData} from "./templates/purchasable-item.mjs";

export default class DemonItemData extends PurchasableItemData {
    static defineSchema() {
        const purchasableData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...purchasableData,
            health: resourceField(0, 0),
            maxCommandLines: integerField(0),
            skillMod: integerField(0),
            commandLines: new fields.ArrayField(new fields.StringField({required: false, blank: true}))
        }
    }
}