export const weaponRollDialog = (abilityOptions, skillOptions) => `
  <div class="form-group">
    <label for="attributeSelect">Choose an attribute for this weapon: </label>
    <select name="attributeSelect">
      ${abilityOptions}
    </select>
    <br>
    <label for="skillSelect">Choose a skill for this weapon: </label>
    <select name="skillSelect">
      ${skillOptions}
    </select>
    <br>
    <label for "situationalABInput">Situational Attack Bonus: </label>
    <input type="text" name="situationalABInput" value="0"/>
    <br>
    <label for "equipmentDBInput">Equipment Damage Bonus: </label>
    <input type="text" name="equipmentDBInput" value="0"/>
    <br>
    <label for "nonLethalInput">Non-Lethal?: </label>
    <input type="checkbox" name="nonLethalInput"/>
  </div>
  <br>
`;

export const skillRollDialog = abilityOptions => `
  <div class="form-group">
    <label for="attributeSelect">Choose an attribute for this skill: </label>
    <select name="attributeSelect">
      ${abilityOptions}
    </select>
    <br>
    <label for "situationalBonusInput">Situational Bonus: </label>
    <input type="text" name="situationalBonusInput" value="0"/>
  </div>
  <br>
`;

export const saveRollDialog = () => `
<div class="form-group">
  <label for "situationalBonusInput">Situational Bonus: </label>
  <input type="text" name="situationalBonusInput" value="0"/>
</div>
<br>
`;