import {AttributeRequiredItemData} from "./templates/attribute-required-item.mjs";
import {integerField, resourceField} from "../../helpers/schema-helpers.mjs";
import {ModifiableItemData} from "./templates/modifiable-item.mjs";

export default class WeaponItemData extends ModifiableItemData {
    static defineSchema() {
        const modifiableData = super.defineSchema();
        const attributeRequiredData = AttributeRequiredItemData.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...modifiableData,
            ...attributeRequiredData,
            skill: new fields.StringField({ required: true, blank: true }),
            rollFormula: new fields.StringField({ required: true, initial: '1d20 + @attributeMod + @skillMod + @baseAB + @situationalAB' }),
            damageFormula: new fields.StringField({ required: true, blank: true }),
            range: new fields.SchemaField({
                effective: integerField(0),
                max: integerField(0)
            }),
            isBurstFireable: new fields.BooleanField({required: true, initial: false}),
            magazine: resourceField(0, 0),
            trauma: new fields.SchemaField({
                die: new fields.StringField({ required: true, blank: true }),
                rating: integerField(0)
            }),
            shock: new fields.SchemaField({
                damage: integerField(0),
                threshold: integerField(0)
            }),
            mounted: new fields.SchemaField({
                power: integerField(0),
                mass: integerField(0),
                minimumSize: new fields.StringField({ required: true, blank: true })
            })
        }
    }
}