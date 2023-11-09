export const weaponRollDialog = (isBurstFireable, abilityOptions, skillOptions) => `
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

    <div class="dialog-row grid grid-2col">
      <label for="situationalABInput">Situational Attack Bonus: </label>
      <input type="text" name="situationalABInput" value="0"/>
    </div>

    <div class="dialog-row grid grid-2col">
      <label for="nonLethalInput">Non-Lethal?: </label>
      <input type="checkbox" name="nonLethalInput"/>
    </div>

    ${addBurstFire(isBurstFireable)}
  </div>
`;

const addBurstFire = isBurstFireable => isBurstFireable ? `
  <div class="dialog-row grid grid-2col">
    <label for="burstFireInput">Burst-Fire?: </label>
    <input type="checkbox" name="burstFireInput"/>
  </div>
` : "";

export const autoWeaponRollDialog = isBurstFireable => `
  <div class="form-group">
    <div class="dialog-row grid grid-2col">
      <label for="situationalABInput">Situational Attack Bonus: </label>
      <input type="text" name="situationalABInput" value="0"/>
    </div>
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
      <input type="text" name="situationalBonusInput" value="0"/>
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
      <input type="text" name="situationalBonusInput" value="0"/>
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
