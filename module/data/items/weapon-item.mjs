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
            isThrowable: new fields.BooleanField({required: true, initial: false}),

            isBurstFireable: new fields.BooleanField({required: true, initial: false}),
            rollFormula: new fields.StringField({ required: true, initial: '1d20 + @attributeMod + @skillMod + @baseAB + @situationalAB' }),

            canDealNonLethalDamage: new fields.BooleanField({required: true, initial: false}),
            damageFormula: new fields.StringField({ required: true, initial: '1d6 + @attributeMod' }),

            hasRangedAttack: new fields.BooleanField({required: true, initial: true}),
            range: new fields.SchemaField({
                effective: integerField(0),
                max: integerField(0)
            }),

            hasMagazine: new fields.BooleanField({required: true, initial: true}),
            magazine: resourceField(0, 0),

            canDealTraumaticHits: new fields.BooleanField({required: true, initial: true}),
            trauma: new fields.SchemaField({
                die: new fields.StringField({ required: true, initial: '1d6' }),
                rating: integerField(0)
            }),

            canDealShockDamage: new fields.BooleanField({required: true, initial: true}),
            shock: new fields.SchemaField({
                damage: integerField(0),
                threshold: integerField(0)
            }),

            canBeMounted: new fields.BooleanField({required: true, initial: true}),
            mounted: new fields.SchemaField({
                power: integerField(0),
                mass: integerField(0),
                minimumSize: new fields.StringField({ required: true, initial: 'small' })
            })
        }
    }
}