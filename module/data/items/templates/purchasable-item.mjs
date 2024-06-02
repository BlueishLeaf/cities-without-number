import {integerField} from "../../../helpers/schema-helpers.mjs";
import {BaseItemData} from "./base-item.mjs";

export class PurchasableItemData extends BaseItemData {
    static defineSchema() {
        const baseData = super.defineSchema();
        return {
            ...baseData,
            cost: integerField(0)
        }
    }
}