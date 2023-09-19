export const buildChatContentForAttackRoll = (weapon, damageRoll, rollRenders) => {
    let content = attackRender(rollRenders[0]);

    // Add trauma render if it exists
    if (rollRenders[2]) {
      content += damageRenderWithTrauma(rollRenders[2], rollRenders[1], weapon.system.traumaRating, damageRoll.total);
    } else {
      content += damageRenderWithoutTrauma(rollRenders[1]);
    }

    return content;
}

export const damageRenderWithTrauma = (traumaRollRender, damageRollRender, traumaRating, damageRollTotal) => `
    <h4>Trauma Roll (x${traumaRating} Damage on Traumatic Hit)</h4>
    ${traumaRollRender}<br>
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
    <h4>Attack Roll</h4>
    ${attackRollRender}<br>
`;
