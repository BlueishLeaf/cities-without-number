export default function registerHandlebarsHelpers() {
  Handlebars.registerHelper("concat", function () {
    let outStr = "";
    for (let arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
  });

  Handlebars.registerHelper("isChecked", function (condition) {
    return condition ? "checked" : "";
  });

  Handlebars.registerHelper(
    "canReadyArmor",
    function (selectedArmor, allArmor) {
      let canReady = true;
      if (
        selectedArmor.system.subType === "accessory" &&
        !selectedArmor.system.canEquipWithSuit &&
        allArmor.find(
          (armorItem) =>
            armorItem.system.subType === "armor" &&
            armorItem.system.readied &&
            armorItem.system.isSuit,
        )
      ) {
        canReady = false;
      }
      return canReady
        ? ""
        : 'disabled title="Cannot equip this accessory while wearing an armored suit"';
    },
  );

  Handlebars.registerHelper("isSelected", function (condition) {
    return condition ? "selected" : "";
  });

  Handlebars.registerHelper("ifEquals", function (arg1, arg2, options) {
    return arg1 === arg2 ? options.fn(this) : options.inverse(this);
  });

  Handlebars.registerHelper("isSettingEnabled", function (settingKey, options) {
    return game.settings.get("cities-without-number", settingKey)
      ? options.fn(this)
      : options.inverse(this);
  });

  Handlebars.registerHelper(
    "formatChromeDefect",
    function (defectId, defectCollection, headerClass) {
      const defect = defectCollection.find((s) => s.id === defectId);
      return defect
        ? `<h4 class="${headerClass}"><b>${defect.name}:</b>${defect.system.description}</h4>`
        : "";
    },
  );
}
