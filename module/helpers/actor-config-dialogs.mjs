export const actorConfigDialogs = {
  damageSoak: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="damageSoakInput">Base Damage Soak: </label>
        <input type="number" name="damageSoakInput" data-dtype="Number" value="${actorSystemData.damageSoak.base}"/>
      </div>
    </div>
  `,

  systemStrain: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="permanentModInput">Perm. Sys. Strain Modifier: </label>
        <input type="number" name="permanentModInput" data-dtype="Number" value="${actorSystemData.systemStrain.permanentModifier}"/>
      </div>
      <div class="dialog-row grid grid-2col">
        <label for="maxModInput">Max Sys. Strain Modifier: </label>
        <input type="number" name="maxModInput" data-dtype="Number" value="${actorSystemData.systemStrain.maxModifier}"/>
      </div>
    </div>
  `,

  armorClass: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="baseMeleeInput">Base Melee AC: </label>
        <input type="number" name="baseMeleeInput" data-dtype="Number" value="${actorSystemData.armorClass.baseMelee}"/>
      </div>
      <div class="dialog-row grid grid-2col">
        <label for="baseRangedInput">Base Ranged AC: </label>
        <input type="number" name="baseRangedInput" data-dtype="Number" value="${actorSystemData.armorClass.baseRanged}"/>
      </div>
    </div>
  `,

  traumaTarget: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="traumaTargetInput">Base Trauma Target: </label>
        <input type="number" name="traumaTargetInput" data-dtype="Number" value="${actorSystemData.traumaTarget.base}"/>
      </div>
    </div>
  `,

  lifestyle: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="monthlyCostInput">Monthly Cost: </label>
        <input type="number" name="monthlyCostInput" data-dtype="Number" value="${actorSystemData.lifestyle.monthlyCost}"/>
      </div>
      <div class="dialog-row grid grid-2col">
        <label for="systemStrainModInput">Sys. Strain Modifier: </label>
        <input type="number" name="systemStrainModInput" data-dtype="Number" value="${actorSystemData.lifestyle.systemStrainMod}"/>
      </div>
    </div>
  `,

  monthlyExpenses: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="lifestyleMonthlyCostInput">Lifestyle: </label>
        <input type="number" name="lifestyleMonthlyCostInput" disabled data-dtype="Number" value="${actorSystemData.lifestyle.monthlyCost}"/>
      </div>
      <div class="dialog-row grid grid-2col">
        <label for="cyberwareMaintenanceCostInput">Cyber Maintenance: </label>
        <input type="number" name="cyberwareMaintenanceCostInput" disabled data-dtype="Number" value="${actorSystemData.cyberwareMaintenanceCost}"/>
      </div>
      <div class="dialog-row grid grid-2col">
        <label for="miscMonthlyCostsInput">Miscellaneous: </label>
        <input type="number" name="miscMonthlyCostsInput" data-dtype="Number" value="${actorSystemData.miscMonthlyCosts}"/>
      </div>
    </div>
  `
}