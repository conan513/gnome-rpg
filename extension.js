import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Gio from 'gi://Gio';

import { SystemMonitor } from './lib/systemMonitor.js';
import { InputMonitor }  from './lib/inputMonitor.js';
import { RpgEngine, STAT_META } from './lib/rpgEngine.js';
import { AchievementManager } from './lib/achievementManager.js';
import { PanelIndicator } from './ui/panelIndicator.js';

export default class SystemRpgExtension extends Extension {

    enable() {
        this._settings = this.getSettings();
        this._interfaceSettings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' });

        // --- Core engine ---
        this._rpgEngine = new RpgEngine(this._settings, this.path);
        this._rpgEngine.load();

        // --- Monitors ---
        this._systemMonitor = new SystemMonitor();
        this._inputMonitor  = new InputMonitor();

        // Restore lifetime input totals into the InputMonitor from saved state
        this._inputMonitor.loadTotals(this._rpgEngine.getInputTotals());

        // --- Achievement manager ---
        this._achievementManager = new AchievementManager(this._rpgEngine, this._settings);

        // --- Level-up notification ---
        this._rpgEngine.onLevelUp((stat, level) => {
            if (this._settings.get_boolean('notifications-enabled')) {
                const meta = STAT_META[stat];
                Main.notify(
                    'SystemQuest — Level Up! 🎉',
                    `${meta?.emoji ?? ''} ${meta?.name ?? stat} reached level ${level}!`
                );
            }
        });

        // --- Panel indicator ---
        this._indicator = new PanelIndicator(
            this._settings,
            this._rpgEngine,
            this._achievementManager,
            this.path
        );
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);

        // --- Theme monitoring ---
        this._themeHandlerId = this._interfaceSettings.connect('changed::color-scheme', () => {
            this._updateTheme();
        });
        this._updateTheme();

        // --- Wire up the tick ---
        this._systemMonitor.onTick = (sysMetrics) => {
            const inputStats = this._inputMonitor.getAndReset();
            const metrics = { ...sysMetrics, ...inputStats };

            this._rpgEngine.processTick(metrics);
            this._achievementManager.check(metrics);
            // Pass live metrics so the popup can show real-time values
            this._indicator.refresh(metrics);
        };

        // --- Start ---
        this._systemMonitor.start();
        this._inputMonitor.start();
    }

    _updateTheme() {
        const colorScheme = this._interfaceSettings.get_string('color-scheme');
        const isDark = colorScheme === 'prefer-dark';
        this._indicator.setTheme(isDark ? 'dark' : 'light');
    }

    disable() {
        if (this._themeHandlerId) {
            this._interfaceSettings.disconnect(this._themeHandlerId);
            this._themeHandlerId = 0;
        }
        this._systemMonitor?.stop();
        this._inputMonitor?.stop();
        this._indicator?.destroy();
        this._rpgEngine?.destroy(); // saves to disk

        this._systemMonitor      = null;
        this._inputMonitor       = null;
        this._rpgEngine          = null;
        this._achievementManager = null;
        this._indicator          = null;
        this._settings           = null;
    }
}
