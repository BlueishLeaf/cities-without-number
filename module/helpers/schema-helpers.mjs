const fields = foundry.data.fields;

export function resourceField(initialValue, maxValue, minValue = 0) {
    return new fields.SchemaField({
        min: integerField(minValue),
        value: integerField(initialValue),
        max: integerField(maxValue),
    });
}

export function abilityField(label, initialValue) {
    return new fields.SchemaField({
        label: new fields.StringField({ required: true, initial: label }),
        mod: integerField(0),
        bonusMod: integerField(0),
        value: integerField(initialValue)
    });
}

export function savingThrowField(label, initialValue) {
    return new fields.SchemaField({
        label: new fields.StringField({ required: true, initial: label }),
        value: integerField(initialValue)
    });
}

export function integerField(initialValue, required = true) {
    return new fields.NumberField({ required, nullable: false, integer: true, initial: initialValue, min: 0 })
}
