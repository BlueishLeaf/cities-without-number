import {integerField, resourceField} from "../../helpers/schema-helpers.mjs";
import {MachineActorData} from "./templates/machine-actor.mjs";

export default class VehicleActorData extends MachineActorData {
    static defineSchema() {
        const machineData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...machineData,
            armor: integerField(0),
            maxCrew: integerField(0),
            power: resourceField(0, 0),
            mass: resourceField(0, 0),
            size: new fields.StringField({required: true, blank: true})
        }
    }
}