export const weaponRollDialog = (isBurstFireable, canDealNonLethalDamage, abilityOptions, skillOptions) => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="attributeSelect">Choose an attribute: </label>
      <select name="attributeSelect">
        ${abilityOptions}
      </select>
    </div>

    <div class="dialog-row grid grid-2col">
      <label for="skillSelect">Choose a skill: </label>
      <select name="skillSelect">
        ${skillOptions}
      </select>
    </div>

    ${addSituationalAttackBonus}
    ${addNonLethal(canDealNonLethalDamage)}
    ${addBurstFire(isBurstFireable)}
  </div>
`;

const addBurstFire = isBurstFireable => isBurstFireable ? `
  <div class="dialog-row grid grid-2col">
    <label for="burstFireInput">Burst-Fire? </label>
    <div style="text-align: center">
      <input type="checkbox" name="burstFireInput"/>
    </div>
  </div>
` : "";

const addNonLethal = canDealNonLethalDamage => canDealNonLethalDamage ? `
  <div class="dialog-row grid grid-2col">
    <label for="nonLethalInput">Non-Lethal? </label>
    <div style="text-align: center">
      <input type="checkbox" name="nonLethalInput"/>
    </div>
  </div>
` : "";

const addSituationalAttackBonus = `
  <div class="dialog-row grid grid-2col">
    <label for="situationalABInput">Situational Attack Bonus: </label>
    <input type="number" name="situationalABInput" data-dtype="Number" value="0"/>
  </div>
`;

export const autoWeaponRollDialog = isBurstFireable => `
  <div class="form-group">
    ${addSituationalAttackBonus}
    ${addNonLethal}
    ${addBurstFire(isBurstFireable)}
  </div>
`;

export const skillRollDialog = abilityOptions => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="attributeSelect">Choose an attribute: </label>
      <select name="attributeSelect">
        ${abilityOptions}
      </select>
    </div>
    <div class="dialog-row grid grid-2col">
      <label for="situationalBonusInput">Situational Bonus: </label>
      <input type="number" name="situationalBonusInput" data-dtype="Number" value="0"/>
    </div>
  </div>
`;

export const itemTypeDialog = itemTypeOptions => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="itemTypeSelect">Choose an item type: </label>
      <select name="itemTypeSelect">
        ${itemTypeOptions}
      </select>
    </div>
  </div>
`;

export const basicRollDialog = () => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="situationalBonusInput">Situational Bonus: </label>
      <input type="number" name="situationalBonusInput" data-dtype="Number" value="0"/>
    </div>
  </div>
`;

export const gunnerSelectDialog = gunnerOptions => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="gunnerSelect">Choose a gunner: </label>
      <select name="gunnerSelect">
        ${gunnerOptions}
      </select>
    </div>
  </div>
`;

export const configDialogDamageSoak = baseDamageSoak => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="damageSoakInput">Base Damage Soak: </label>
      <input type="number" name="damageSoakInput" data-dtype="Number" value="${baseDamageSoak}"/>
    </div>
  </div>
`;

export const configDialogSystemStrain = systemStrain => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="permanentModInput">Perm. Sys. Strain Modifier: </label>
      <input type="number" name="permanentModInput" data-dtype="Number" value="${systemStrain.permanentModifier}"/>
    </div>
    <div class="dialog-row grid grid-2col">
      <label for="maxModInput">Max Sys. Strain Modifier: </label>
      <input type="number" name="maxModInput" data-dtype="Number" value="${systemStrain.maxModifier}"/>
    </div>
  </div>
`;

export const configDialogArmorClass = armorClass => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="baseMeleeInput">Base Melee AC: </label>
      <input type="number" name="baseMeleeInput" data-dtype="Number" value="${armorClass.baseMelee}"/>
    </div>
    <div class="dialog-row grid grid-2col">
      <label for="baseRangedInput">Base Ranged AC: </label>
      <input type="number" name="baseRangedInput" data-dtype="Number" value="${armorClass.baseRanged}"/>
    </div>
  </div>
`;

export const configDialogTraumaTarget = baseTraumaTarget => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="traumaTargetInput">Base Trauma Target: </label>
      <input type="number" name="traumaTargetInput" data-dtype="Number" value="${baseTraumaTarget}"/>
    </div>
  </div>
`;
