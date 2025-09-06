export const registerSettings = () => {
  game.settings.register("cities-without-number", "useCyberAlienation", {
    name: "Use Cyber Alienation Rules?",
    hint: "Cyber Alienation is a supplementary ruleset outlined on page 226 of CWN Deluxe Edition",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });
};
