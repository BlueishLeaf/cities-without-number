import {integerField} from "../../../helpers/schema-helpers.mjs";
import {BaseActorData} from "./base-actor.mjs";

export class PhysicalActorData extends BaseActorData {
    static defineSchema() {
        const baseData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...baseData,
            traumaTarget: new fields.SchemaField({
                base: integerField(10),
                total: integerField(10),
            }),
            movement: new fields.SchemaField({
                speed: integerField(10),
                type: new fields.StringField({required: true, initial: 'ground'}),
            })
        }
    }
}