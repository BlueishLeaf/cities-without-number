import CWNDataModel from "../../base-model.mjs";
import {resourceField} from "../../../helpers/schema-helpers.mjs";

export class BaseActorData extends CWNDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            health: resourceField(0, 0),
            biography: new fields.HTMLField({initial: ''})
        }
    }
}