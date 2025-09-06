export const CWN = {};

/**
 * The set of Ability Scores used within the sytem.
 * @type {object}
 */
CWN.abilities = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

CWN.abilityModifiers = {
  "-2": [3],
  "-1": [4, 5, 6, 7],
  0: [8, 9, 10, 11, 12, 13],
  1: [14, 15, 16, 17],
  2: [18],
};

CWN.system = {
  burstFireBonus: 2,
  droneNativeBonus: 2,
  skillRollFormula:
    "2d6 + @level + @attributeMod + @situationalBonus + @armorPenalty",
  specialisedLevel1SkillRollFormula:
    "3d6k2 + @level + @attributeMod + @situationalBonus + @armorPenalty",
  specialisedLevel2SkillRollFormula:
    "4d6k2 + @level + @attributeMod + @situationalBonus + @armorPenalty",
  savingThrowFormula: "1d20 + @situationalBonus",
  moraleFormula: "2d6 + @situationalBonus",
  basicSkillCheckFormula: "2d6 + @skillBonus + @situationalBonus",
  alienationCheckFormula: "1d20 + @situationalBonus",
};

CWN.inventoryItemTypes = ["gear", "cyberdeck", "drug"];

CWN.movementTypes = {
  ground: "Ground",
  fly: "Fly",
  swim: "Swim",
};

CWN.sizeCategories = {
  small: "Small",
  medium: "Medium",
  large: "Large",
};

CWN.fociLevels = {
  1: "Level 1",
  2: "Level 2",
};

CWN.armor = {
  subTypes: {
    armor: "Armor",
    accessory: "Accessory",
  },
  concealmentTypes: {
    subtle: "Subtle",
    obvious: "Obvious",
  },
};

CWN.cyberwear = {
  subTypes: {
    body: "Body",
    head: "Head",
    limb: "Limb",
    medical: "Medical",
    nerve: "Nerve",
    sensory: "Sensory",
    skin: "Skin",
  },
  concealmentTypes: {
    sight: "Sight",
    medical: "Medical",
    touch: "Touch",
    obvious: "Obvious",
  },
};

CWN.actorsWithSkills = ["character", "drone"];

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
  "Work",
];
