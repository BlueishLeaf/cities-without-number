import {abilityField, integerField, resourceField} from "../../helpers/schema-helpers.mjs";
import {MachineActorData} from "./templates/machine-actor.mjs";

export default class DroneActorData extends MachineActorData {
    static defineSchema() {
        const machineData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...machineData,
            abilities: new fields.SchemaField({
                str: abilityField('Strength', 10),
                dex: abilityField('Dexterity', 10),
                con: abilityField('Constitution', 10),
                int: abilityField('Intelligence', 10),
                wis: abilityField('Wisdom', 10),
                cha: abilityField('Charisma', 10),
            }),
            fittings: resourceField(0, 0),
            encumbrance: integerField(0),
            operator: new fields.StringField({required: true, blank: true})
        }
    }
}