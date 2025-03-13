import {integerField} from "../../helpers/schema-helpers.mjs";
import {HumanoidActorData} from "./templates/humanoid-actor.mjs";

export default class NpcActorData extends HumanoidActorData {
    static defineSchema() {
        const humanoidData = super.defineSchema();
        const fields = foundry.data.fields;
        return {
            ...humanoidData,
            hitDice: new fields.StringField({required: true, initial: '1d6'}),
            skillBonus: integerField(0),
            saveTarget: integerField(0),
            attackBonus: new fields.SchemaField({
                melee: integerField(0),
                ranged: integerField(0)
            }),
            moraleTarget: integerField(0),
            dangerValue: integerField(0)
        }
    }
}