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
