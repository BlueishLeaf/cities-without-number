import {integerField} from "../../../helpers/schema-helpers.mjs";
import {PurchasableItemData} from "./purchasable-item.mjs";

export class TransportableItemData extends PurchasableItemData {
    static defineSchema() {
        const purchasableData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...purchasableData,
            encumbrance: integerField(0),
            readied: new fields.BooleanField({required: true, initial: false}),
            quantity: integerField(1)
        }
    }
}