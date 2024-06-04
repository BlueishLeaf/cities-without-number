import {PurchasableItemData} from "./templates/purchasable-item.mjs";
import {integerField} from "../../helpers/schema-helpers.mjs";
import {SkillRequiredItemData} from "./templates/skill-required-item.mjs";

export default class ModItemData extends PurchasableItemData {
    static defineSchema() {
        const purchasableData = super.defineSchema();
        const skillRequiredData = SkillRequiredItemData.defineSchema();
        return {
            ...purchasableData,
            ...skillRequiredData,
            quantity: integerField(1),
            costPercentage: integerField(0),
            specialTechRequired: integerField(0)
        }
    }
}