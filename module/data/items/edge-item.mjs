import {BaseItemData} from "./templates/base-item.mjs";
import {integerField} from "../../helpers/schema-helpers.mjs";

export default class EdgeItemData extends BaseItemData {
    static defineSchema() {
        const baseData = super.defineSchema();
        return {
            ...baseData,
            costPercentage: integerField(0),
            specialTechRequired: integerField(0)
        }
    }
}