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

  experience: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="nextLevelXPInput">Next Level XP: </label>
        <input type="number" name="nextLevelXPInput" data-dtype="Number" value="${actorSystemData.xp.nextLevel}"/>
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
  `,

  stowedItems: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="stowedItemsBonusInput">Max Stowed Mod.: </label>
        <input type="number" name="stowedItemsBonusInput" data-dtype="Number" value="${actorSystemData.encumbrance.stowed.maxBonus}"/>
      </div>
    </div>
  `,

  readiedItems: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="readiedItemsBonusInput">Max Readied Mod.: </label>
        <input type="number" name="readiedItemsBonusInput" data-dtype="Number" value="${actorSystemData.encumbrance.readied.maxBonus}"/>
      </div>
    </div>
  `,

  maintenanceScore: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="maintenanceScoreBonusInput">Max Maint. Score Mod.: </label>
        <input type="number" name="maintenanceScoreBonusInput" data-dtype="Number" value="${actorSystemData.maintenanceScore.maxBonus}"/>
      </div>
    </div>
  `,

  alienationScore: (actorSystemData) => `
    <div class="form-group">
      <div class="dialog-row grid grid-2col">
        <label for="permanentModInput">Perm. Alien. Score Modifier: </label>
        <input type="number" name="permanentModInput" data-dtype="Number" value="${actorSystemData.alienationScore.permanentModifier}"/>
      </div>
      <div class="dialog-row grid grid-2col">
        <label for="maxModInput">Max Alien. Score Modifier: </label>
        <input type="number" name="maxModInput" data-dtype="Number" value="${actorSystemData.alienationScore.maxModifier}"/>
      </div>
    </div>
  `,
}