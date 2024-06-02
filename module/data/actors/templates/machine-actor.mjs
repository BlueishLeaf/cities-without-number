import {integerField, resourceField} from "../../../helpers/schema-helpers.mjs";
import {PhysicalActorData} from "./physical-actor.mjs";

export class MachineActorData extends PhysicalActorData {
    static defineSchema() {
        const physicalData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...physicalData,
            hardpoints: resourceField(0, 0),
            armorClass: new fields.SchemaField({
                melee: integerField(10),
                ranged: integerField(10),
            }),
            cargoEncumbrance: new fields.SchemaField({
                stowed: resourceField(0, 0)
            }),
            cost: integerField(0)
        }
    }
}