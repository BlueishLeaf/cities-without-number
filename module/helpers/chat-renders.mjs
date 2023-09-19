export const buildChatContentForAttackRoll = (weapon, damageRoll, rollRenders) => {
    let content = attackRender(rollRenders[0]);

    // Add trauma and shock renders if applicable
    content += rollRenders[2] ? damageRenderWithTrauma(rollRenders[2], rollRenders[1], weapon.system.traumaRating, damageRoll.total) : damageRenderWithoutTrauma(rollRenders[1]);
    
    if (weapon.system.shockDamage && weapon.system.shockThreshold) {
        content += shockDamageRender(weapon);
    }

    return content;
}

export const shockDamageRender = (weapon) => `
    <h4>Shock Damage</h4>
    <div class="dice-roll">
        <div class="dice-formula">AC <= ${weapon.system.shockThreshold}</div>
        <div class="dice-result">
            <h4 class="dice-total">${weapon.system.shockDamage}</h4>
        </div>
    </div>
`;

export const damageRenderWithTrauma = (traumaRollRender, damageRollRender, traumaRating, damageRollTotal) => `
    <h4>Trauma Roll (x${traumaRating} Damage on Traumatic Hit)</h4>
    ${traumaRollRender}
    <div class="grid grid-2col">
        <div class="flex-group-left">
            <h4>Damage (Normal)</h4>
            ${damageRollRender}
        </div>
        <div class="flex-group-left">
            <h4>Damage (Traumatic)</h4>
            <div class="dice-roll">
                <div class="dice-formula">${traumaRating} * ${damageRollTotal}</div>
                <div class="dice-result">
                    <h4 class="dice-total">${traumaRating * damageRollTotal}</h4>
                </div>
            </div>
        </div>
    </div>
`;

export const damageRenderWithoutTrauma = (damageRollRender) => `
    <h4>Damage Roll</h4>
    ${damageRollRender}
`;

export const attackRender = (attackRollRender) =>`
    <div style="margin: 10px 0;">
        <h4>Attack Roll</h4>
        ${attackRollRender}
    </div>
`;