const STATS = ['STR', 'INT', 'DEX', 'CHA', 'CON', 'WIS'];
const CLASSES = [
    { name: 'Warrior', icon: 'warrior', emoji: '⚔️',  primary: 'STR' },
    { name: 'Mage',    icon: 'mage',    emoji: '🧙',  primary: 'INT' },
    { name: 'Rogue',   icon: 'rogue',   emoji: '🗡️',  primary: 'DEX' },
    { name: 'Bard',    icon: 'bard',    emoji: '🎭',  primary: 'CHA' },
    { name: 'Paladin', icon: 'paladin', emoji: '🛡️',  primary: 'CON' },
    { name: 'Oracle',  icon: 'oracle',  emoji: '🔮',  primary: 'WIS' },
];
const DUAL_CLASSES = {
    'CHA-CON': { name: 'Herald',       emoji: '🌐🛡️' },
    'CHA-DEX': { name: 'Swashbuckler', emoji: '🌐🗡️' },
    'CHA-INT': { name: 'Illusionist',  emoji: '🌐🧠' },
    'CHA-STR': { name: 'Warlord',      emoji: '🌐⚔️' },
    'CHA-WIS': { name: 'Shaman',       emoji: '🌐🔮' },
    'CON-DEX': { name: 'Ranger',       emoji: '🛡️🗡️' },
    'CON-INT': { name: 'Necromancer',  emoji: '🛡️🧠' },
    'CON-STR': { name: 'Juggernaut',   emoji: '🛡️⚔️' },
    'CON-WIS': { name: 'Cleric',       emoji: '🛡️🔮' },
    'DEX-INT': { name: 'Spellthief',   emoji: '🗡️🧠' },
    'DEX-STR': { name: 'Barbarian',    emoji: '🗡️⚔️' },
    'DEX-WIS': { name: 'Assassin',     emoji: '🗡️🔮' },
    'INT-STR': { name: 'Battlemage',   emoji: '🧠⚔️' },
    'INT-WIS': { name: 'Archmage',     emoji: '🧠🔮' },
    'STR-WIS': { name: 'Monk',         emoji: '⚔️🔮' },
};

function getLevel(stat) {
    const levels = { STR: 2, INT: 7, DEX: 12, CHA: 7, CON: 3, WIS: 1 };
    return levels[stat];
}

function getCharacterClass() {
    let statsWithLevels = STATS.map(s => ({ stat: s, level: getLevel(s) }));
    statsWithLevels.sort((a, b) => b.level - a.level); // Descending order

    const primary = statsWithLevels[0];
    const secondary = statsWithLevels[1];

    if (primary.level >= 5 && secondary.level >= (primary.level / 2)) {
        const key = [primary.stat, secondary.stat].sort().join('-');
        const dual = DUAL_CLASSES[key];
        if (dual) {
            const primaryClass = CLASSES.find(c => c.primary === primary.stat) ?? CLASSES[0];
            return {
                name: dual.name,
                emoji: dual.emoji,
                primary: primary.stat,
                icon: primaryClass.icon,
            };
        }
    }

    return CLASSES.find(c => c.primary === primary.stat) ?? CLASSES[0];
}

console.log(getCharacterClass());
