export const initializeChatData = (actor, item) => {
    const speaker = ChatMessage.getSpeaker({ actor });
    const rollMode = game.settings.get("core", "rollMode");
    const flavor = `[${item.type}] ${item.name}`;
    const sound = 'sounds/dice.wav';
    const blind = rollMode === 'blindroll' ? true : false;
    const whisper = getWhisperRecipients(rollMode);
    return {speaker, rollMode, flavor, sound, blind, whisper};
}

export const getWhisperRecipients = (rollMode) => {
    switch (rollMode) {
        case 'selfroll':
            return [game.userId];
        case 'gmroll':
        case 'blindroll':
            return ChatMessage.getWhisperRecipients('GM');
        case 'publicroll':
        default:
            return [];
    }
}