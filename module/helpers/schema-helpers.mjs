const fields = foundry.data.fields;

export function resourceField(initialValue, maxValue) {
  return new fields.SchemaField({
    value: integerField(initialValue),
    max: integerField(maxValue),
  });
}

export function computedResourceField(initialValue, maxValue) {
  return new fields.SchemaField({
    value: integerField(initialValue),
    max: integerField(maxValue),
    maxBonus: integerField(0),
  });
}

export function abilityField(label, initialValue) {
  return new fields.SchemaField({
    label: new fields.StringField({ required: true, initial: label }),
    mod: integerField(0),
    bonusMod: integerField(0),
    value: integerField(initialValue),
  });
}

export function savingThrowField(label, initialValue) {
  return new fields.SchemaField({
    label: new fields.StringField({ required: true, initial: label }),
    value: integerField(initialValue),
  });
}

export function integerField(initialValue) {
  return new fields.NumberField({
    required: true,
    nullable: false,
    integer: true,
    initial: initialValue,
  });
}

export function decimalField(initialValue) {
  return new fields.NumberField({
    required: true,
    nullable: false,
    integer: false,
    initial: initialValue,
  });
}
