import {BaseItemData} from "./templates/base-item.mjs";
import {integerField} from "../../helpers/schema-helpers.mjs";

export default class FittingItemData extends BaseItemData {
    static defineSchema() {
        const baseData = super.defineSchema();
        return {
            ...baseData,
            quantity: integerField(0),
            costPercentage: integerField(0)
        }
    }
}