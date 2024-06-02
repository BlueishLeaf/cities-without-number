import CWNDataModel from "../../base-model.mjs";

export class SkillRequiredItemData extends CWNDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            requiredSkills: new fields.StringField({ required: true, blank: true })
        }
    }
}