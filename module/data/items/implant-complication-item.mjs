import {BaseItemData} from "./templates/base-item.mjs";

export default class ImplantComplicationItemData extends BaseItemData {
    static defineSchema() {
        const baseData = super.defineSchema();
        return {
            ...baseData
        }
    }
}