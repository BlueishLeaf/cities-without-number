import {integerField} from "../../../helpers/schema-helpers.mjs";
import {PhysicalActorData} from "./physical-actor.mjs";

export class HumanoidActorData extends PhysicalActorData {
    static defineSchema() {
        const physicalData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...physicalData,
            cyberwareMaintenanceCost: integerField(0),
            armorClass: new fields.SchemaField({
                baseMelee: integerField(10),
                melee: integerField(10),
                baseRanged: integerField(10),
                ranged: integerField(10),
            }),
            damageSoak: new fields.SchemaField({
                value: integerField(10),
                max: integerField(10),
                base: integerField(10)
            })
        }
    }
}