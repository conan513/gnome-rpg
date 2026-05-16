import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { STATS } from './rpgEngine.js';

/**
 * Each achievement: { id, name, desc, check(metrics, rpgEngine, trackingObj) → bool }
 * `trackingObj` is a per-achievement persistent object for multi-tick conditions.
 */
const ACHIEVEMENTS = [
    {
        id: 'overclocker',
        name: '🔥 Overclocker',
        desc: 'CPU above 90% for 3 consecutive minutes',
        check(m, _e, t) {
            t.ticks = m.cpu > 90 ? (t.ticks || 0) + 1 : 0;
            return t.ticks >= 36; // 36 × 5 s = 3 min
        },
    },
    {
        id: 'memory_hoarder',
        name: '🧠 Memory Hoarder',
        desc: 'RAM usage exceeded 85%',
        check: (m) => m.ram > 85,
    },
    {
        id: 'speed_demon',
        name: '⚡ Speed Demon',
        desc: 'Disk I/O above 50 MB/s',
        check: (m) => m.diskMBs > 50,
    },
    {
        id: 'social_butterfly',
        name: '🌐 Social Butterfly',
        desc: 'Network traffic above 5 MB/s',
        check: (m) => m.netKBs > 5120,
    },
    {
        id: 'night_owl',
        name: '🌙 Night Owl',
        desc: 'Active between midnight and 4 AM',
        check: () => {
            const h = new Date().getHours();
            return h >= 0 && h < 4;
        },
    },
    {
        id: 'marathon',
        name: '🏃 Marathon Runner',
        desc: 'System uptime reached 24 hours',
        check: (m) => m.uptimeMin >= 1440,
    },
    {
        id: 'centurion',
        name: '💯 Centurion',
        desc: 'System uptime reached 100 hours',
        check: (m) => m.uptimeMin >= 6000,
    },
    {
        id: 'speed_typist',
        name: '⌨️ Speed Typist',
        desc: '60+ keypresses in a single 5-second tick',
        check: (m) => m.keypresses >= 60,
    },
    {
        id: 'click_frenzy',
        name: '🖱️ Click Frenzy',
        desc: '20+ mouse clicks in a single 5-second tick',
        check: (m) => m.clicks >= 20,
    },
    {
        id: 'wanderer',
        name: '🗺️ Wanderer',
        desc: 'Mouse cursor traveled 1 km total',
        check: (m) => (m.totalMouseKm || 0) >= 1,
    },
    {
        id: 'scroll_lord',
        name: '📜 Scroll Lord',
        desc: '1,000 total scroll events',
        check: (m) => (m.totalScrolls || 0) >= 1000,
    },
    {
        id: 'typist_legend',
        name: '📝 Typist Legend',
        desc: '100,000 total keypresses',
        check: (m) => (m.totalKeypresses || 0) >= 100000,
    },
    {
        id: 'oracle_title',
        name: '🔮 Oracle',
        desc: 'WIS reached level 15',
        check: (_m, e) => e.getLevel('WIS') >= 15,
    },
    {
        id: 'veteran',
        name: '⚔️ Veteran',
        desc: 'Overall level reached 10',
        check: (_m, e) => e.getOverallLevel() >= 10,
    },
    {
        id: 'all_rounder',
        name: '🌟 All-Rounder',
        desc: 'All six stats reached level 5',
        check: (_m, e) => STATS.every(s => e.getLevel(s) >= 5),
    },
];

// ---------------------------------------------------------------------------

export class AchievementManager {
    constructor(rpgEngine, settings) {
        this._engine = rpgEngine;
        this._settings = settings;
        // Per-achievement tracking state (e.g. consecutive tick counters)
        this._tracking = {};
        ACHIEVEMENTS.forEach(a => { this._tracking[a.id] = {}; });
    }

    /** Called every tick with full merged metrics object. */
    check(metrics) {
        const notificationsOn = this._settings.get_boolean('notifications-enabled');

        for (const achievement of ACHIEVEMENTS) {
            if (this._engine.hasAchievement(achievement.id)) continue;

            let triggered = false;
            try {
                triggered = achievement.check(metrics, this._engine, this._tracking[achievement.id]);
            } catch (e) {
                console.warn(`[SystemRPG] Achievement check error (${achievement.id}):`, e.message);
            }

            if (triggered) {
                const isNew = this._engine.markAchievement(achievement.id);
                if (isNew && notificationsOn) {
                    Main.notify(
                        `SystemQuest — Achievement Unlocked!`,
                        `${achievement.name}\n${achievement.desc}`
                    );
                }
            }
        }
    }

    /** Returns all achievement definitions with unlock status. */
    getAllWithStatus() {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: this._engine.hasAchievement(a.id),
        }));
    }
}
