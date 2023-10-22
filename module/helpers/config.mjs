export const CWN = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {object}
 */
CWN.abilities = {
  str: "CWN.AbilityStr",
  dex: "CWN.AbilityDex",
  con: "CWN.AbilityCon",
  int: "CWN.AbilityInt",
  wis: "CWN.AbilityWis",
  cha: "CWN.AbilityCha"
};

CWN.abilityAbbreviations = {
  str: "CWN.AbilityStrAbbr",
  dex: "CWN.AbilityDexAbbr",
  con: "CWN.AbilityConAbbr",
  int: "CWN.AbilityIntAbbr",
  wis: "CWN.AbilityWisAbbr",
  cha: "CWN.AbilityChaAbbr"
};

CWN.abilityModifiers = {
  "-2": [3],
  "-1": [4, 5, 6, 7],
  0: [8, 9, 10, 11, 12, 13],
  1: [14, 15, 16, 17],
  2: [18]
};

CWN.system = {
  burstFireBonus: 2
};

CWN.inventoryItemTypes = [
  "gear",
  "cyberdeck",
  "drug"
];

CWN.armor = {
  subTypes: {
    armor: "Armor",
    accessory: "Accessory"
  },
  concealmentTypes: {
    subtle: "Subtle",
    obvious: "Obvious"
  }
};

CWN.startingSkills = [
  "Administer",
  "Connect",
  "Drive",
  "Exert",
  "Fix",
  "Heal",
  "Know",
  "Lead",
  "Notice",
  "Perform",
  "Program",
  "Punch",
  "Shoot",
  "Sneak",
  "Stab",
  "Survive",
  "Talk",
  "Trade",
  "Work"
];
