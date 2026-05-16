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
    // 2 Stats (Dual Classes)
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

    // 3 Stats (Triple Classes)
    'CHA-CON-DEX': { name: 'Skirmisher',     emoji: '🏇' },
    'CHA-CON-INT': { name: 'Diplomat',       emoji: '📜' },
    'CHA-CON-STR': { name: 'Gladiator',      emoji: '🏟️' },
    'CHA-CON-WIS': { name: 'Templar',        emoji: '⛪' },
    'CHA-DEX-INT': { name: 'Mountebank',     emoji: '🎭' },
    'CHA-DEX-STR': { name: 'Blade Dancer',   emoji: '💃' },
    'CHA-DEX-WIS': { name: 'Shadow Shaman',  emoji: '🌑' },
    'CHA-INT-STR': { name: 'Spellsword',     emoji: '🪄' },
    'CHA-INT-WIS': { name: 'Sage',           emoji: '🦉' },
    'CHA-STR-WIS': { name: 'Crusader',       emoji: '📿' },
    'CON-DEX-INT': { name: 'Artificer',      emoji: '⚙️' },
    'CON-DEX-STR': { name: 'Vanguard',       emoji: '🛡️' },
    'CON-DEX-WIS': { name: 'Sentinel',       emoji: '🦅' },
    'CON-INT-STR': { name: 'Dreadnought',    emoji: '⚓' },
    'CON-INT-WIS': { name: 'Oracle Defender',emoji: '🧿' },
    'CON-STR-WIS': { name: 'Warden',         emoji: '🌳' },
    'DEX-INT-STR': { name: 'Battlemaster',   emoji: '🎖️' },
    'DEX-INT-WIS': { name: 'Arcane Trickster',emoji: '🃏' },
    'DEX-STR-WIS': { name: 'Shadowblade',    emoji: '🥷' },
    'INT-STR-WIS': { name: 'Loremaster',     emoji: '📚' },

    // 4 Stats (Quad Classes)
    'CHA-CON-DEX-INT': { name: 'Polymath',         emoji: '🧭' },
    'CHA-CON-DEX-STR': { name: 'Champion',         emoji: '🏆' },
    'CHA-CON-DEX-WIS': { name: 'Ascetic',          emoji: '🧘' },
    'CHA-CON-INT-STR': { name: 'Conqueror',        emoji: '👑' },
    'CHA-CON-INT-WIS': { name: 'Thaumaturge',      emoji: '💫' },
    'CHA-CON-STR-WIS': { name: 'Justiciar',        emoji: '⚖️' },
    'CHA-DEX-INT-STR': { name: 'Spellblade Captain',emoji: '⚔️✨' },
    'CHA-DEX-INT-WIS': { name: 'Mystic Trickster', emoji: '🦊' },
    'CHA-DEX-STR-WIS': { name: 'Shadow Lord',      emoji: '👑🌑' },
    'CHA-INT-STR-WIS': { name: 'Grand Sorcerer',   emoji: '🧙‍♂️✨' },
    'CON-DEX-INT-STR': { name: 'Ironclad',         emoji: '🦾' },
    'CON-DEX-INT-WIS': { name: 'Rune Knight',      emoji: 'ᛟ⚔️' },
    'CON-DEX-STR-WIS': { name: 'Blademaster',      emoji: '🗡️✨' },
    'CON-INT-STR-WIS': { name: 'Arch-Templar',     emoji: '⛪✨' },
    'DEX-INT-STR-WIS': { name: 'Grandmaster',      emoji: '🥋' },

    // 5 Stats (Penta Classes)
    'CHA-CON-DEX-INT-STR': { name: 'Demigod',        emoji: '⚡' },
    'CHA-CON-DEX-INT-WIS': { name: 'Avatar',         emoji: '🌌' },
    'CHA-CON-DEX-STR-WIS': { name: 'Hero of Legend', emoji: '🌟' },
    'CHA-CON-INT-STR-WIS': { name: 'Mythic Scholar', emoji: '📜✨' },
    'CHA-DEX-INT-STR-WIS': { name: 'Phantom King',   emoji: '👑👻' },
    'CON-DEX-INT-STR-WIS': { name: 'Immortal',       emoji: '♾️' },

    // 6 Stats (Hexa Class)
    'CHA-CON-DEX-INT-STR-WIS': { name: 'True Ascendant', emoji: '🌌👑' },
};

/** XP required to reach a given level */
export function xpForLevel(level) {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level - 1, 1.5));
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
                totalMouseKm: 0,
            },
            netTotals: {
                rxMB: 0,
                txMB: 0,
            }
        };
    }

    // --- Persistence ---

    load() {
        try {
            const file = Gio.File.new_for_path(this._savePath);
            if (file.query_exists(null)) {
                const [ok, contents] = file.load_contents(null);
                if (ok) {
                    const saved = JSON.parse(new TextDecoder().decode(contents));
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
            const uptimeDelta = Math.max(0, metrics.uptimeMin - lastUptime);
            this._addXp('CON', uptimeDelta * 15.0 * mult);
        }
        this._state.lastUptimeMin = metrics.uptimeMin;

        // WIS ← Keypresses + clicks + scrolls
        const wisXp = metrics.keypresses * 0.5 + metrics.clicks * 0.3 + metrics.scrolls * 0.1;
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

        // Multi-Class condition: Main >= 10
        if (primary.level >= 10) {
            // Find all stats that are at least half of the primary stat
            const qualifyingStats = statsWithLevels.filter(s => s.level >= primary.level / 2);

            if (qualifyingStats.length > 1) {
                const key = qualifyingStats.map(s => s.stat).sort().join('-');
                const multi = MULTI_CLASSES[key];
                
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
