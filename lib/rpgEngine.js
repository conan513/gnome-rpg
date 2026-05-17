import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import AccountsService from 'gi://AccountsService';

export const STATS = ['STR', 'INT', 'DEX', 'CHA', 'CON', 'WIS'];

export const STAT_META = {
    STR: { name: 'Strength',     emoji: '⚔️',  desc: 'CPU Power'       },
    INT: { name: 'Intelligence', emoji: '🧠',  desc: 'Memory Usage'    },
    DEX: { name: 'Dexterity',    emoji: '🗡️',  desc: 'Disk & Movement' },
    CHA: { name: 'Charisma',     emoji: '🌐',  desc: 'Network Traffic' },
    CON: { name: 'Constitution', emoji: '🛡️',  desc: 'System Uptime'   },
    WIS: { name: 'Wisdom',       emoji: '🔮',  desc: 'Input Activity'  },
};

export const CLASSES = [
    { name: 'Warrior', icon: 'warrior', emoji: '⚔️',  primary: 'STR' },
    { name: 'Mage',    icon: 'mage',    emoji: '🧙',  primary: 'INT' },
    { name: 'Rogue',   icon: 'rogue',   emoji: '🗡️',  primary: 'DEX' },
    { name: 'Bard',    icon: 'bard',    emoji: '🎭',  primary: 'CHA' },
    { name: 'Paladin', icon: 'paladin', emoji: '🛡️',  primary: 'CON' },
    { name: 'Oracle',  icon: 'oracle',  emoji: '🔮',  primary: 'WIS' },
];

export const MULTI_CLASSES = {
    // 2 Stats (Dual Classes) - 30 unique names
    STR: {
        'DEX': { name: 'Gladiator',     emoji: '⚔️🗡️' },
        'INT': { name: 'Spellbreaker',  emoji: '⚔️🧠' },
        'CHA': { name: 'Warlord',       emoji: '⚔️🌐' },
        'CON': { name: 'Juggernaut',    emoji: '⚔️🛡️' },
        'WIS': { name: 'Monk',          emoji: '⚔️🔮' },
    },
    INT: {
        'STR': { name: 'Battlemage',    emoji: '🧠⚔️' },
        'DEX': { name: 'Spellthief',    emoji: '🧠🗡️' },
        'CHA': { name: 'Illusionist',   emoji: '🧠🌐' },
        'CON': { name: 'Necromancer',   emoji: '🧠🛡️' },
        'WIS': { name: 'Archmage',      emoji: '🧠🔮' },
    },
    DEX: {
        'STR': { name: 'Barbarian',     emoji: '🗡️⚔️' },
        'INT': { name: 'Assassin',      emoji: '🗡️🧠' },
        'CHA': { name: 'Swashbuckler',  emoji: '🗡️🌐' },
        'CON': { name: 'Ranger',        emoji: '🗡️🛡️' },
        'WIS': { name: 'Nightblade',    emoji: '🗡️🔮' },
    },
    CHA: {
        'STR': { name: 'Skald',         emoji: '🌐⚔️' },
        'INT': { name: 'Enchanter',     emoji: '🌐🧠' },
        'DEX': { name: 'Acrobat',       emoji: '🌐🗡️' },
        'CON': { name: 'Herald',        emoji: '🌐🛡️' },
        'WIS': { name: 'Shaman',        emoji: '🌐🔮' },
    },
    CON: {
        'STR': { name: 'Guardian',      emoji: '🛡️⚔️' },
        'INT': { name: 'Alchemist',     emoji: '🛡️🧠' },
        'DEX': { name: 'Warden',        emoji: '🛡️🗡️' },
        'CHA': { name: 'Diplomat',      emoji: '🛡️🌐' },
        'WIS': { name: 'Cleric',        emoji: '🛡️🔮' },
    },
    WIS: {
        'STR': { name: 'Inquisitor',    emoji: '🔮⚔️' },
        'INT': { name: 'Mystic',        emoji: '🔮🧠' },
        'DEX': { name: 'Avenger',       emoji: '🔮🗡️' },
        'CHA': { name: 'Prophet',       emoji: '🔮🌐' },
        'CON': { name: 'Druid',         emoji: '🔮🛡️' },
    },

    // 3+ Stats (Triple, Quad, etc.) - Procedural Mapping
    // Format: [Primary][SortedRest]
    TRIPLE: {
        STR: {
            'DEX-INT': { name: 'Vanguard',         emoji: '⚔️🗡️🧠' },
            'CHA-DEX': { name: 'Champion',         emoji: '⚔️🗡️🌐' },
            'CON-DEX': { name: 'Berserker',        emoji: '⚔️🗡️🛡️' },
            'DEX-WIS': { name: 'Slayer',           emoji: '⚔️🗡️🔮' },
            'CHA-INT': { name: 'Tactician',        emoji: '⚔️🧠🌐' },
            'CON-INT': { name: 'Ironbound',        emoji: '⚔️🧠🛡️' },
            'INT-WIS': { name: 'Rune Knight',      emoji: '⚔️🧠🔮' },
            'CHA-CON': { name: 'Conqueror',        emoji: '⚔️🌐🛡️' },
            'CHA-WIS': { name: 'Crusader',         emoji: '⚔️🌐🔮' },
            'CON-WIS': { name: 'Warden-Knight',    emoji: '⚔️🛡️🔮' },
        },
        INT: {
            'DEX-STR': { name: 'Spellblade',       emoji: '🧠⚔️🗡️' },
            'CHA-STR': { name: 'Thaumaturge',      emoji: '🧠⚔️🌐' },
            'CON-STR': { name: 'Blood Mage',       emoji: '🧠⚔️🛡️' },
            'STR-WIS': { name: 'Loremaster',       emoji: '🧠⚔️🔮' },
            'CHA-DEX': { name: 'Night Stalker',    emoji: '🧠🗡️🌐' },
            'CON-DEX': { name: 'Artificer',        emoji: '🧠🗡️🛡️' },
            'DEX-WIS': { name: 'Chronomancer',     emoji: '🧠🗡️🔮' },
            'CHA-CON': { name: 'Summoner',         emoji: '🧠🌐🛡️' },
            'CHA-WIS': { name: 'Enchanter-Sage',   emoji: '🧠🌐🔮' },
            'CON-WIS': { name: 'Philosopher',      emoji: '🧠🛡️🔮' },
        },
        DEX: {
            'INT-STR': { name: 'Arcane Trickster', emoji: '🗡️⚔️🧠' },
            'CHA-STR': { name: 'Blade Dancer',     emoji: '🗡️⚔️🌐' },
            'CON-STR': { name: 'Skirmisher',       emoji: '🗡️⚔️🛡️' },
            'STR-WIS': { name: 'Shadowblade',      emoji: '🗡️⚔️🔮' },
            'CHA-INT': { name: 'Mountebank',       emoji: '🗡️🧠🌐' },
            'CON-INT': { name: 'Saboteur',         emoji: '🗡️🧠🛡️' },
            'INT-WIS': { name: 'Arcane Archer',    emoji: '🗡️🧠🔮' },
            'CHA-CON': { name: 'Bounty Hunter',    emoji: '🗡️🌐🛡️' },
            'CHA-WIS': { name: 'Shadow Shaman',    emoji: '🗡️🌐🔮' },
            'CON-WIS': { name: 'Sentinel',         emoji: '🗡️🛡️🔮' },
        },
        CHA: {
            'DEX-STR': { name: 'Duelist',          emoji: '🌐⚔️🗡️' },
            'INT-STR': { name: 'Spellsword',       emoji: '🌐⚔️🧠' },
            'CON-STR': { name: 'Gladiator',        emoji: '🌐⚔️🛡️' },
            'STR-WIS': { name: 'Templar',          emoji: '🌐⚔️🔮' },
            'DEX-INT': { name: 'Virtuoso',         emoji: '🌐🗡️🧠' },
            'CON-DEX': { name: 'Vanguard',         emoji: '🌐🗡️🛡️' },
            'DEX-WIS': { name: 'Mystic',           emoji: '🌐🗡️🔮' },
            'CON-INT': { name: 'Diplomat',         emoji: '🌐🧠🛡️' },
            'INT-WIS': { name: 'Sage',             emoji: '🌐🧠🔮' },
            'CON-WIS': { name: 'Paladin',          emoji: '🌐🛡️🔮' },
        },
        CON: {
            'DEX-STR': { name: 'Vanguard',         emoji: '🛡️⚔️🗡️' },
            'INT-STR': { name: 'Dreadnought',      emoji: '🛡️⚔️🧠' },
            'CHA-STR': { name: 'Iron Lord',        emoji: '🛡️⚔️🌐' },
            'STR-WIS': { name: 'Warden',           emoji: '🛡️⚔️🔮' },
            'DEX-INT': { name: 'Ironclad',         emoji: '🛡️🗡️🧠' },
            'CHA-DEX': { name: 'Sentinel',         emoji: '🛡️🗡️🌐' },
            'DEX-WIS': { name: 'Ranger-Knight',    emoji: '🛡️🗡️🔮' },
            'CHA-INT': { name: 'Stone-Mage',       emoji: '🛡️🧠🌐' },
            'INT-WIS': { name: 'Oracle Defender',  emoji: '🛡️🧠🔮' },
            'CHA-WIS': { name: 'Justiciar',        emoji: '🛡️🌐🔮' },
        },
        WIS: {
            'DEX-STR': { name: 'Avenger',          emoji: '🔮⚔️🗡️' },
            'INT-STR': { name: 'Exorcist',         emoji: '🔮⚔️🧠' },
            'CHA-STR': { name: 'Priest',           emoji: '🔮⚔️🌐' },
            'CON-STR': { name: 'Holy Shield',      emoji: '🔮⚔️🛡️' },
            'DEX-INT': { name: 'Phantom',          emoji: '🔮🗡️🧠' },
            'DEX-CHA': { name: 'Spirit-Walker',    emoji: '🔮🗡️🌐' },
            'DEX-CON': { name: 'Druid-Guard',      emoji: '🔮🗡️🛡️' },
            'INT-CHA': { name: 'Prophet-Sage',     emoji: '🔮🧠🌐' },
            'INT-CON': { name: 'Elder',            emoji: '🔮🧠🛡️' },
            'CHA-CON': { name: 'Archon',           emoji: '🔮🌐🛡️' },
        }
    },

    QUAD: {
        STR: {
            'CHA-DEX-INT': { name: 'Warmaster', emoji: '⚔️🌐🗡️🧠' },
            'CON-DEX-INT': { name: 'Dreadnought', emoji: '⚔️🛡️🗡️🧠' },
            'DEX-INT-WIS': { name: 'Shadow-Master', emoji: '⚔️🗡️🧠🔮' },
            'CHA-CON-INT': { name: 'General', emoji: '⚔️🌐🛡️🧠' },
            'CHA-INT-WIS': { name: 'Spell-General', emoji: '⚔️🌐🧠🔮' },
            'CON-INT-WIS': { name: 'Paladin-Sage', emoji: '⚔️🛡️🧠🔮' },
            'CHA-CON-DEX': { name: 'Warlord', emoji: '⚔️🌐🛡️🗡️' },
            'CHA-DEX-WIS': { name: 'Dervish', emoji: '⚔️🌐🗡️🔮' },
            'CON-DEX-WIS': { name: 'Ranger-Lord', emoji: '⚔️🛡️🗡️🔮' },
            'CHA-CON-WIS': { name: 'Templar', emoji: '⚔️🌐🛡️🔮' },
        },
        INT: {
            'CHA-DEX-STR': { name: 'Blade-Weaver', emoji: '🧠🌐🗡️⚔️' },
            'CON-DEX-STR': { name: 'Blood-Knight', emoji: '🧠🛡️🗡️⚔️' },
            'DEX-STR-WIS': { name: 'Eldritch-Knight', emoji: '🧠🗡️⚔️🔮' },
            'CHA-CON-STR': { name: 'Warmage', emoji: '🧠🌐🛡️⚔️' },
            'CHA-STR-WIS': { name: 'Lore-Warden', emoji: '🧠🌐⚔️🔮' },
            'CON-STR-WIS': { name: 'Runecaster', emoji: '🧠🛡️⚔️🔮' },
            'CHA-CON-DEX': { name: 'Night-Illusionist', emoji: '🧠🌐🛡️🗡️' },
            'CHA-DEX-WIS': { name: 'Mesmerist', emoji: '🧠🌐🗡️🔮' },
            'CON-DEX-WIS': { name: 'Time-Warden', emoji: '🧠🛡️🗡️🔮' },
            'CHA-CON-WIS': { name: 'Grand-Summoner', emoji: '🧠🌐🛡️🔮' },
        },
        DEX: {
            'CHA-INT-STR': { name: 'Arcane-Duelist', emoji: '🗡️🌐🧠⚔️' },
            'CON-INT-STR': { name: 'Ghost-Blade', emoji: '🗡️🛡️🧠⚔️' },
            'INT-STR-WIS': { name: 'Assassin-Mage', emoji: '🗡️🧠⚔️🔮' },
            'CHA-CON-STR': { name: 'Corsair', emoji: '🗡️🌐🛡️⚔️' },
            'CHA-STR-WIS': { name: 'Zealot', emoji: '🗡️🌐⚔️🔮' },
            'CON-STR-WIS': { name: 'Pathfinder', emoji: '🗡️🛡️⚔️🔮' },
            'CHA-CON-INT': { name: 'Spymaster', emoji: '🗡️🌐🛡️🧠' },
            'CHA-INT-WIS': { name: 'Night-Whisperer', emoji: '🗡️🌐🧠🔮' },
            'CON-INT-WIS': { name: 'Void-Watcher', emoji: '🗡️🛡️🧠🔮' },
            'CHA-CON-WIS': { name: 'Shadow-Walker', emoji: '🗡️🌐🛡️🔮' },
        },
        CHA: {
            'DEX-INT-STR': { name: 'Swordsage', emoji: '🌐🗡️🧠⚔️' },
            'CON-INT-STR': { name: 'Imperator', emoji: '🌐🛡️🧠⚔️' },
            'INT-STR-WIS': { name: 'Luminator', emoji: '🌐🧠⚔️🔮' },
            'CON-DEX-STR': { name: 'Champion', emoji: '🌐🛡️🗡️⚔️' },
            'DEX-STR-WIS': { name: 'Blade-Saint', emoji: '🌐🗡️⚔️🔮' },
            'CON-STR-WIS': { name: 'Vindicator', emoji: '🌐🛡️⚔️🔮' },
            'CON-DEX-INT': { name: 'Aristocrat', emoji: '🌐🛡️🗡️🧠' },
            'DEX-INT-WIS': { name: 'Mystic-Dancer', emoji: '🌐🗡️🧠🔮' },
            'CON-INT-WIS': { name: 'High-Priest', emoji: '🌐🛡️🧠🔮' },
            'CON-DEX-WIS': { name: 'Envoy', emoji: '🌐🛡️🗡️🔮' },
        },
        CON: {
            'DEX-INT-STR': { name: 'Iron-Weaver', emoji: '🛡️🗡️🧠⚔️' },
            'CHA-INT-STR': { name: 'Magus-Guard', emoji: '🛡️🌐🧠⚔️' },
            'INT-STR-WIS': { name: 'Earth-Shaman', emoji: '🛡️🧠⚔️🔮' },
            'CHA-DEX-STR': { name: 'Vanguard-Captain', emoji: '🛡️🌐🗡️⚔️' },
            'DEX-STR-WIS': { name: 'Ranger-General', emoji: '🛡️🗡️⚔️🔮' },
            'CHA-STR-WIS': { name: 'Justiciar-Lord', emoji: '🛡️🌐⚔️🔮' },
            'CHA-DEX-INT': { name: 'Seneschal', emoji: '🛡️🌐🗡️🧠' },
            'DEX-INT-WIS': { name: 'Warden-Mage', emoji: '🛡️🗡️🧠🔮' },
            'CHA-INT-WIS': { name: 'Hierophant', emoji: '🛡️🌐🧠🔮' },
            'CHA-DEX-WIS': { name: 'Protectorate', emoji: '🛡️🌐🗡️🔮' },
        },
        WIS: {
            'DEX-INT-STR': { name: 'Astral-Knight', emoji: '🔮🗡️🧠⚔️' },
            'CHA-INT-STR': { name: 'Inquisitor-Lord', emoji: '🔮🌐🧠⚔️' },
            'CON-INT-STR': { name: 'Storm-Caller', emoji: '🔮🛡️🧠⚔️' },
            'CHA-DEX-STR': { name: 'Soul-Blade', emoji: '🔮🌐🗡️⚔️' },
            'CON-DEX-STR': { name: 'Nature-Warden', emoji: '🔮🛡️🗡️⚔️' },
            'CHA-CON-STR': { name: 'Crusader', emoji: '🔮🌐🛡️⚔️' },
            'CHA-DEX-INT': { name: 'Dream-Walker', emoji: '🔮🌐🗡️🧠' },
            'CON-DEX-INT': { name: 'Star-Gazer', emoji: '🔮🛡️🗡️🧠' },
            'CHA-CON-INT': { name: 'Oracle-King', emoji: '🔮🌐🛡️🧠' },
            'CHA-CON-DEX': { name: 'Spirit-Guide', emoji: '🔮🌐🛡️🗡️' },
        },
    },

    PENTA: {
        STR: {
            'CHA-CON-DEX-INT': { name: 'Warmaster-Supreme', emoji: '⚔️🌐🛡️🗡️🧠' },
            'CHA-DEX-INT-WIS': { name: 'Shadow-General', emoji: '⚔️🌐🗡️🧠🔮' },
            'CON-DEX-INT-WIS': { name: 'Dread-Lord', emoji: '⚔️🛡️🗡️🧠🔮' },
            'CHA-CON-INT-WIS': { name: 'High-Templar', emoji: '⚔️🌐🛡️🧠🔮' },
            'CHA-CON-DEX-WIS': { name: 'Warlord-Sage', emoji: '⚔️🌐🛡️🗡️🔮' },
        },
        INT: {
            'CHA-CON-DEX-STR': { name: 'Arch-Warmage', emoji: '🧠🌐🛡️🗡️⚔️' },
            'CHA-DEX-STR-WIS': { name: 'Eldritch-Weaver', emoji: '🧠🌐🗡️⚔️🔮' },
            'CON-DEX-STR-WIS': { name: 'Blood-Runecaster', emoji: '🧠🛡️🗡️⚔️🔮' },
            'CHA-CON-STR-WIS': { name: 'Lore-Warden-Lord', emoji: '🧠🌐🛡️⚔️🔮' },
            'CHA-CON-DEX-WIS': { name: 'Grand-Illusionist', emoji: '🧠🌐🛡️🗡️🔮' },
        },
        DEX: {
            'CHA-CON-INT-STR': { name: 'Phantom-Corsair', emoji: '🗡️🌐🛡️🧠⚔️' },
            'CHA-INT-STR-WIS': { name: 'Arcane-Assassin', emoji: '🗡️🌐🧠⚔️🔮' },
            'CON-INT-STR-WIS': { name: 'Void-Pathfinder', emoji: '🗡️🛡️🧠⚔️🔮' },
            'CHA-CON-STR-WIS': { name: 'Shadow-Zealot', emoji: '🗡️🌐🛡️⚔️🔮' },
            'CHA-CON-INT-WIS': { name: 'Night-Spymaster', emoji: '🗡️🌐🛡️🧠🔮' },
        },
        CHA: {
            'CON-DEX-INT-STR': { name: 'Grand-Imperator', emoji: '🌐🛡️🗡️🧠⚔️' },
            'DEX-INT-STR-WIS': { name: 'Luminator-Saint', emoji: '🌐🗡️🧠⚔️🔮' },
            'CON-INT-STR-WIS': { name: 'High-Vindicator', emoji: '🌐🛡️🧠⚔️🔮' },
            'CON-DEX-STR-WIS': { name: 'Champion-Envoy', emoji: '🌐🛡️🗡️⚔️🔮' },
            'CON-DEX-INT-WIS': { name: 'Aristocrat-Priest', emoji: '🌐🛡️🗡️🧠🔮' },
        },
        CON: {
            'CHA-DEX-INT-STR': { name: 'Iron-Magus', emoji: '🛡️🌐🗡️🧠⚔️' },
            'DEX-INT-STR-WIS': { name: 'Earth-Weaver', emoji: '🛡️🗡️🧠⚔️🔮' },
            'CHA-INT-STR-WIS': { name: 'Hierophant-Guard', emoji: '🛡️🌐🧠⚔️🔮' },
            'CHA-DEX-STR-WIS': { name: 'Justiciar-General', emoji: '🛡️🌐🗡️⚔️🔮' },
            'CHA-DEX-INT-WIS': { name: 'Warden-Seneschal', emoji: '🛡️🌐🗡️🧠🔮' },
        },
        WIS: {
            'CHA-DEX-INT-STR': { name: 'Astral-Inquisitor', emoji: '🔮🌐🗡️🧠⚔️' },
            'CON-DEX-INT-STR': { name: 'Storm-Warden', emoji: '🔮🛡️🗡️🧠⚔️' },
            'CHA-CON-INT-STR': { name: 'Storm-Crusader', emoji: '🔮🌐🛡️🧠⚔️' },
            'CHA-CON-DEX-STR': { name: 'Soul-Crusader', emoji: '🔮🌐🛡️🗡️⚔️' },
            'CHA-CON-DEX-INT': { name: 'Star-Oracle', emoji: '🔮🌐🛡️🗡️🧠' },
        },
    },

    // 4+ Stats use modifiers for brevity
    TITLES: {
        STR: 'Mighty',
        INT: 'Arcane',
        DEX: 'Swift',
        CHA: 'Radiant',
        CON: 'Eternal',
        WIS: 'Sacred'
    },
    BASES: {
        4: 'Polymath',
        5: 'Hero',
        6: 'Ascendant'
    }
};

/** XP required to reach a given level */
export function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(2500 * Math.pow(level - 1, 1.8));
}

/** Current level given accumulated XP */
export function levelFromXp(xp) {
    let level = 1;
    while (level < 99 && xp >= xpForLevel(level + 1))
        level++;
    return level;
}

// ---------------------------------------------------------------------------

export class RpgEngine {
    constructor(settings, extensionPath) {
        this._settings = settings;
        this._extensionPath = extensionPath;
        this._savePath = GLib.build_filenamev([
            GLib.get_user_data_dir(), 'gnome-shell', 'system-rpg-save.json',
        ]);
        this._state = this._defaultState();
        this._levelUpCallbacks = [];
        this._autosaveTimerId = null;
    }

    _getOSProfileCreationTime() {
        try {
            const file = Gio.File.new_for_path(GLib.get_home_dir());
            const info = file.query_info('time::created', Gio.FileQueryInfoFlags.NONE, null);
            if (info.has_attribute('time::created')) {
                const createdSec = info.get_attribute_uint64('time::created');
                if (createdSec > 0) {
                    return Number(createdSec) * 1000;
                }
            }
        } catch (e) {
            console.error('[SystemRPG] Failed to get OS profile creation time:', e.message);
        }
        return Date.now();
    }

    _defaultState() {
        return {
            characterName: GLib.get_user_name(),
            createdAt: this._getOSProfileCreationTime(),
            xp: { STR: 0, INT: 0, DEX: 0, CHA: 0, CON: 0, WIS: 0 },
            achievements: {},
            lastUptimeMin: null,
            inputTotals: {
                totalKeypresses: 0,
                totalClicks: 0,
                totalLeftClicks: 0,
                totalRightClicks: 0,
                totalMiddleClicks: 0,
                totalOtherClicks: 0,
                totalScrolls: 0,
                totalClipboardChanges: 0,
                totalMouseKm: 0,
            },
            netTotals: {
                rxMB: 0,
                txMB: 0,
            }
        };
    }

    // --- Persistence ---

    async load() {
        try {
            const file = Gio.File.new_for_path(this._savePath);
            if (file.query_exists(null)) {
                const [bytes] = await file.load_contents_async(null);
                if (bytes) {
                    const saved = JSON.parse(new TextDecoder().decode(bytes));
                    // Merge saved data onto defaults so new fields are always present
                    this._state = {
                        ...this._defaultState(),
                        ...saved,
                        xp: { ...this._defaultState().xp, ...(saved.xp || {}) },
                        inputTotals: { ...this._defaultState().inputTotals, ...(saved.inputTotals || {}) },
                        netTotals: { ...this._defaultState().netTotals, ...(saved.netTotals || {}) },
                    };
                    
                    // Fallback for older saves that didn't have createdAt
                    if (!this._state.createdAt) {
                        this._state.createdAt = this._getOSProfileCreationTime();
                    }
                }
            }
        } catch (e) {
            console.error('[SystemRPG] Failed to load save:', e.message);
        }

        // Autosave every 60 seconds
        this._autosaveTimerId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
            this.save();
            return GLib.SOURCE_CONTINUE;
        });
    }

    save() {
        try {
            GLib.mkdir_with_parents(GLib.path_get_dirname(this._savePath), 0o755);
            const file = Gio.File.new_for_path(this._savePath);
            const encoded = new TextEncoder().encode(JSON.stringify(this._state, null, 2));
            file.replace_contents(
                encoded, null, false,
                Gio.FileCreateFlags.REPLACE_DESTINATION, null
            );
        } catch (e) {
            console.error('[SystemRPG] Failed to save:', e.message);
        }
    }

    destroy() {
        if (this._autosaveTimerId) {
            GLib.source_remove(this._autosaveTimerId);
            this._autosaveTimerId = null;
        }
        this.save();
    }

    // --- Actions ---

    resetCharacter() {
        // Reset XP, achievements and totals but keep name and createdAt
        this._state.xp = { STR: 0, INT: 0, DEX: 0, CHA: 0, CON: 0, WIS: 0 };
        this._state.achievements = {};
        this._state.inputTotals = this._defaultState().inputTotals;
        this._state.netTotals = this._defaultState().netTotals;
        this._state.lastUptimeMin = null;
        this.save();
    }

    // --- Tick processing ---

    processTick(metrics) {
        const mult = this._settings.get_double('xp-multiplier');

        // STR ← CPU %
        this._addXp('STR', metrics.cpu * 0.1 * mult);

        // INT ← RAM %
        this._addXp('INT', metrics.ram * 0.08 * mult);

        // DEX ← Disk I/O (MB/s) + mouse movement (px)
        // Use Math.sqrt to prevent massive spikes on fast NVMe drives. Max practical ~44 XP per tick (2000 MB/s).
        const diskXp = Math.sqrt(metrics.diskMBs || 0) * 2.0;
        const mouseXp = (metrics.mouseTravelPx || 0) * 0.002;
        this._addXp('DEX', (diskXp + mouseXp) * mult);

        // CHA ← Network (KB/s)
        // Use Math.sqrt so gigabit internet (100,000 KB/s) gives ~150 XP instead of 2000 XP.
        const netXp = Math.sqrt(metrics.netKBs || 0) * 0.5;
        this._addXp('CHA', netXp * mult);

        // CON ← Uptime delta (minutes elapsed since last tick)
        // lastUptimeMin is null on first run or after reset — skip XP that tick
        // to avoid awarding accumulated uptime all at once.
        const lastUptime = this._state.lastUptimeMin;
        if (lastUptime !== null) {
            let uptimeDelta = Math.max(0, metrics.uptimeMin - lastUptime);
            // Cap delta at 1 minute to prevent huge XP jumps from system sleep/suspend
            // Since ticks happen every 5 seconds (~0.083 min), any delta > 1 min means the system was asleep
            if (uptimeDelta > 1.0) {
                uptimeDelta = 5.0 / 60.0;
            }
            this._addXp('CON', uptimeDelta * 15.0 * mult);
        }
        this._state.lastUptimeMin = metrics.uptimeMin;

        // WIS ← Activity (focus changes, workspaces) + Input (keypresses, clicks, scrolls)
        // Adding focus/workspace metrics because global keypresses are restricted on Wayland.
        const activityBonus = (metrics.keypresses > 0 || metrics.clicks > 0 || metrics.scrolls > 0 || metrics.mouseTravelPx > 50) ? 5.0 : 0;
        
        // Removed meditation bonus to keep it distinct from Constitution.
        // Instead, we highly reward reading (scrolling), UI navigation (clicks), context switching, and copying information.
        // We also give a small passive bonus based on the number of open windows.
        const wisXp = (metrics.keypresses * 0.5) + (metrics.clicks * 2.0) + (metrics.scrolls * 2.0) +
                      (metrics.focusChanges * 15.0) + (metrics.workspaceSwitches * 30.0) +
                      (metrics.clipboardChanges * 25.0) + (metrics.openWindows * 0.5) +
                      (metrics.mouseTravelPx * 0.005) + activityBonus;
        this._addXp('WIS', wisXp * mult);

        // Persist latest input lifetime totals from InputMonitor
        if (metrics.totalKeypresses !== undefined) {
            this._state.inputTotals = {
                totalKeypresses: metrics.totalKeypresses,
                totalClicks: metrics.totalClicks,
                totalLeftClicks: metrics.totalLeftClicks,
                totalRightClicks: metrics.totalRightClicks,
                totalMiddleClicks: metrics.totalMiddleClicks,
                totalOtherClicks: metrics.totalOtherClicks,
                totalScrolls: metrics.totalScrolls,
                totalClipboardChanges: metrics.totalClipboardChanges,
                totalMouseKm: metrics.totalMouseKm,
            };
        }
        
        // Track lifetime network transfer
        if (metrics.netRxKBs !== undefined) {
            // netRxKBs is KB/sec, over a 5 sec interval = KBs * 5. Divide by 1024 for MBs.
            this._state.netTotals.rxMB += (metrics.netRxKBs * 5) / 1024;
            this._state.netTotals.txMB += (metrics.netTxKBs * 5) / 1024;
        }
    }

    _addXp(stat, amount) {
        if (amount <= 0) return;
        const prevLevel = this.getLevel(stat);
        this._state.xp[stat] = (this._state.xp[stat] || 0) + amount;
        const newLevel = this.getLevel(stat);
        if (newLevel > prevLevel)
            this._levelUpCallbacks.forEach(cb => cb(stat, newLevel));
    }

    // --- Callbacks ---

    onLevelUp(callback) {
        this._levelUpCallbacks.push(callback);
    }

    // --- Queries ---

    getLevel(stat) {
        return levelFromXp(this._state.xp[stat] || 0);
    }

    getXpProgress(stat) {
        const level = this.getLevel(stat);
        const xpAtLevel = xpForLevel(level);
        const xpToNext = xpForLevel(level + 1);
        const current = (this._state.xp[stat] || 0) - xpAtLevel;
        const needed = xpToNext - xpAtLevel;
        return {
            level,
            current: Math.round(current),
            needed,
            fraction: Math.min(1, current / needed),
        };
    }

    getOverallLevel() {
        const sum = STATS.reduce((acc, s) => acc + this.getLevel(s), 0);
        return Math.floor(sum / STATS.length);
    }

    getCharacterClass() {
        let statsWithLevels = STATS.map(s => ({ stat: s, level: this.getLevel(s) }));
        statsWithLevels.sort((a, b) => b.level - a.level); // Descending order

        const primary = statsWithLevels[0];
        const overallLevel = this.getOverallLevel();
        
        let maxAllowedStats = 1;
        if (overallLevel >= 50) {
            maxAllowedStats = 6;
        } else if (overallLevel >= 40) {
            maxAllowedStats = 5;
        } else if (overallLevel >= 30) {
            maxAllowedStats = 4;
        } else if (overallLevel >= 20) {
            maxAllowedStats = 3;
        } else if (overallLevel >= 10) {
            maxAllowedStats = 2;
        }

        // Multi-Class condition: Main >= 10 AND allowed more than 1 stat
        if (primary.level >= 10 && maxAllowedStats > 1) {
            // Find all stats that are at least half of the primary stat
            let qualifyingStats = statsWithLevels.filter(s => s.level >= primary.level / 2);

            // Cap the number of stats based on overall level
            if (qualifyingStats.length > maxAllowedStats) {
                qualifyingStats = qualifyingStats.slice(0, maxAllowedStats);
            }

            if (qualifyingStats.length > 1) {
                const rest = qualifyingStats.slice(1).map(s => s.stat).sort();
                const restKey = rest.join('-');
                
                let multi = null;
                if (qualifyingStats.length === 2) {
                    multi = MULTI_CLASSES[primary.stat]?.[restKey];
                } else if (qualifyingStats.length === 3) {
                    multi = MULTI_CLASSES.TRIPLE?.[primary.stat]?.[restKey];
                } else if (qualifyingStats.length === 4) {
                    multi = MULTI_CLASSES.QUAD?.[primary.stat]?.[restKey];
                } else if (qualifyingStats.length === 5) {
                    multi = MULTI_CLASSES.PENTA?.[primary.stat]?.[restKey];
                } else {
                    // 6 stats: True Ascendant
                    multi = { name: 'True Ascendant', emoji: '🌌👑' };
                }

                if (multi) {
                    const primaryClass = CLASSES.find(c => c.primary === primary.stat) ?? CLASSES[0];
                    return {
                        name: multi.name,
                        emoji: multi.emoji,
                        primary: primary.stat,
                        icon: primaryClass.icon,
                    };
                }
            }
        }

        return CLASSES.find(c => c.primary === primary.stat) ?? CLASSES[0];
    }

    getCharacterName() {
        try {
            const um = AccountsService.UserManager.get_default();
            const user = um.get_user(GLib.get_user_name());
            const real = user.get_real_name?.() ?? '';
            if (real.trim()) return real;
        } catch (_e) { /* fall through */ }
        return this._state.characterName;
    }

    getAvatarPath() {
        try {
            const um = AccountsService.UserManager.get_default();
            const user = um.get_user(GLib.get_user_name());
            const path = user.get_icon_file?.() ?? '';
            // Only return if the file actually exists
            if (path && GLib.file_test(path, GLib.FileTest.EXISTS))
                return path;
        } catch (_e) { /* fall through */ }
        return null;
    }

    getInputTotals() {
        return this._state.inputTotals;
    }

    getCharacterAgeString() {
        const now = Date.now();
        const created = this._state.createdAt || now;
        const diffMs = now - created;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (days === 0) return 'Newborn (0 days)';
        if (days === 1) return '1 day';
        if (days < 365) return `${days} days`;
        
        const years = Math.floor(days / 365);
        const remainingDays = days % 365;
        
        let yrStr = years === 1 ? '1 year' : `${years} years`;
        let dayStr = remainingDays === 1 ? '1 day' : `${remainingDays} days`;
        
        if (remainingDays === 0) return yrStr;
        return `${yrStr}, ${dayStr}`;
    }

    getSaveState() {
        return this._state;
    }

    // --- Achievements ---

    markAchievement(id) {
        if (this._state.achievements[id]) return false;
        this._state.achievements[id] = Date.now();
        return true;
    }

    hasAchievement(id) {
        return !!this._state.achievements[id];
    }

    getUnlockedAchievements() {
        return Object.keys(this._state.achievements);
    }

    resetProgress() {
        this._state = this._defaultState();
        this.save();
    }
}
