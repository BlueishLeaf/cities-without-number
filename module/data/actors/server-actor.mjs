import { integerField } from "../../helpers/schema-helpers.mjs";
import CWNDataModel from "../base-model.mjs";

export default class ServerActorData extends CWNDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      cost: integerField(0),
      biography: new fields.HTMLField({ initial: "" }),
      verbs: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      subjects: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      demons: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      nodes: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      maxNodes: integerField(0),
      maxBarriers: integerField(0),
      maxDemons: new fields.SchemaField({
        total: integerField(0),
        perNode: integerField(0),
      }),
    };
  }
}
