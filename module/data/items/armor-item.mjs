import {integerField} from "../../helpers/schema-helpers.mjs";
import {ConcealableItemData} from "./templates/concealable-item.mjs";

export default class ArmorItemData extends ConcealableItemData {
    static defineSchema() {
        const fields = foundry.data.fields;
        const concealableData = super.defineSchema();
        return {
            ...concealableData,
            armorClass: new fields.SchemaField({
                melee: integerField(0),
                ranged: integerField(0)
            }),
            canEquipWithSuit: new fields.BooleanField({required: true, initial: false}),
            isHeavy: new fields.BooleanField({required: true, initial: false}),
            isSuit: new fields.BooleanField({required: true, initial: false}),
            damageSoak: integerField(0),
            traumaTargetMod: integerField(0)
        }
    }
}