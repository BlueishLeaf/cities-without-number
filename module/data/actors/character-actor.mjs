import {
  abilityField,
  computedResourceField,
  decimalField,
  integerField,
  savingThrowField,
} from "../../helpers/schema-helpers.mjs";
import { HumanoidActorData } from "./templates/humanoid-actor.mjs";

export default class CharacterActorData extends HumanoidActorData {
  static defineSchema() {
    const humanoidData = super.defineSchema();
    const fields = foundry.data.fields;
    return {
      ...humanoidData,
      background: new fields.StringField({ required: false, blank: true }),
      abilities: new fields.SchemaField({
        str: abilityField("Strength", 10),
        dex: abilityField("Dexterity", 10),
        con: abilityField("Constitution", 10),
        int: abilityField("Intelligence", 10),
        wis: abilityField("Wisdom", 10),
        cha: abilityField("Charisma", 10),
      }),
      systemStrain: new fields.SchemaField({
        value: decimalField(0),
        max: decimalField(10),
        permanent: decimalField(0),
        temporary: decimalField(0),
        maxModifier: decimalField(0),
        permanentModifier: decimalField(0),
      }),
      alienationScore: new fields.SchemaField({
        value: integerField(0),
        max: integerField(10),
        permanent: integerField(0),
        temporary: integerField(0),
        maxModifier: decimalField(0),
        permanentModifier: decimalField(0),
      }),
      savingThrows: new fields.SchemaField({
        physical: savingThrowField("Physical", 10),
        evasion: savingThrowField("Evasion", 10),
        mental: savingThrowField("Mental", 10),
        luck: savingThrowField("Luck", 10),
      }),
      encumbrance: new fields.SchemaField({
        stowed: computedResourceField(0, 0),
        readied: computedResourceField(0, 0),
      }),
      level: integerField(1),
      xp: new fields.SchemaField({
        value: integerField(0),
        nextLevel: integerField(0),
      }),
      availableSkillPoints: integerField(0),
      attackBonus: integerField(0),
      money: integerField(0),
      languages: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      goals: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      maintenanceScore: computedResourceField(0, 0),
      majorInjuries: new fields.ArrayField(
        new fields.StringField({ required: false, blank: true }),
      ),
      lifestyle: new fields.SchemaField({
        label: new fields.StringField({ required: false, blank: true }),
        monthlyCost: integerField(0),
        systemStrainMod: decimalField(0),
      }),
      miscMonthlyCosts: integerField(0),
      cyberwareMaintenanceCost: integerField(0),
    };
  }
}
