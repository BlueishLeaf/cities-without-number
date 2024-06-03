export const actorConfigHandlers = {
  damageSoak: (actor, html) => {
    const newBaseDamageSoak = html.find('[name="damageSoakInput"]').val();
    const damageSoak = {
      base: newBaseDamageSoak
    };
    Actor.updateDocuments([{ _id: actor._id, system: { damageSoak } }]).then(updatedActor => console.log("Updated actor", updatedActor));
  },

  systemStrain: (actor, html) => {
    const maxModifier = html.find('[name="maxModInput"]').val();
    const permanentModifier = html.find('[name="permanentModInput"]').val();
    const systemStrain = {
      maxModifier: maxModifier,
      permanentModifier: permanentModifier
    };
    Actor.updateDocuments([{ _id: actor._id, system: { systemStrain } }]).then(updatedActor => console.log("Updated actor", updatedActor));
  },

  armorClass: (actor, html) => {
    const baseMelee = html.find('[name="baseMeleeInput"]').val();
    const baseRanged = html.find('[name="baseRangedInput"]').val();
    const armorClass = { baseMelee, baseRanged };
    Actor.updateDocuments([{ _id: actor._id, system: { armorClass } }]).then(updatedActor => console.log("Updated actor", updatedActor));
  },

  traumaTarget: (actor, html) => {
    const newBaseTraumaTarget = html.find('[name="traumaTargetInput"]').val();
    const traumaTarget = {
      base: newBaseTraumaTarget
    };
    Actor.updateDocuments([{ _id: actor._id, system: { traumaTarget } }]).then(updatedActor => console.log("Updated actor", updatedActor));
  },

  lifestyle: (actor, html) => {
    const monthlyCost = html.find('[name="monthlyCostInput"]').val();
    const systemStrainMod = html.find('[name="systemStrainModInput"]').val();

    const lifestyle = { monthlyCost, systemStrainMod };
    Actor.updateDocuments([{ _id: actor._id, system: { lifestyle } }]).then(updatedActor => console.log("Updated actor", updatedActor));
  },

  monthlyExpenses: (actor, html) => {
    const miscMonthlyCosts = html.find('[name="miscMonthlyCostsInput"]').val();

    Actor.updateDocuments([{ _id: actor._id, system: { miscMonthlyCosts } }]).then(updatedActor => console.log("Updated actor", updatedActor));
  }
}