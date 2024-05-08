export const rollButtons = rollCallback => {
  return {
    roll: {
      icon: '<i class="fas fa-check"></i>',
      label: "Roll",
      callback: rollCallback
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancel",
      callback: () => console.log("Cancelled roll dialog")
    }
  };
};

export const confirmButtons = confirmCallback => {
  return {
    roll: {
      icon: '<i class="fas fa-check"></i>',
      label: "Confirm",
      callback: confirmCallback
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancel",
      callback: () => console.log("Cancelled confirm dialog")
    }
  };
};

export const attackModeButtons = (manualCallback, autoCallback) => {
  return {
    roll: {
      icon: '<i class="fas fa-bullseye"></i>',
      label: "Manual",
      callback: manualCallback
    },
    cancel: {
      icon: '<i class="fas fa-robot"></i>',
      label: "Auto",
      callback: autoCallback
    }
  };
};

export const attackBonusButtons = (meleeCallback, rangedCallback) => {
  return {
    roll: {
      icon: '<i class="fas fa-knife"></i>',
      label: "Melee",
      callback: meleeCallback
    },
    cancel: {
      icon: '<i class="fas fa-gun"></i>',
      label: "Ranged",
      callback: rangedCallback
    }
  };
};

export const gunnerModeButtons = (otherGunnerCallback, currentGunnerCallback) => {
  return {
    roll: {
      icon: '<i class="fas fa-people-arrows"></i>',
      label: "Other",
      callback: otherGunnerCallback
    },
    cancel: {
      icon: '<i class="fas fa-person-rifle"></i>',
      label: "Myself",
      callback: currentGunnerCallback
    }
  };
};

export const createButtons = createCallback => {
  return {
    roll: {
      icon: '<i class="fas fa-check"></i>',
      label: "Create",
      callback: createCallback
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: "Cancel",
      callback: () => console.log("Cancelled create item dialog")
    }
  };
};
