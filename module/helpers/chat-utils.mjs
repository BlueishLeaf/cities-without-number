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