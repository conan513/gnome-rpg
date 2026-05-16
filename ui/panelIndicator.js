import St from 'gi://St';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as QuickSettings from 'resource:///org/gnome/shell/ui/quickSettings.js';
import { CharacterSheet } from './characterSheet.js';

/**
 * PanelIndicator — GNOME top-bar button showing class emoji + level.
 * Clicking it opens the CharacterSheet popup.
 */
export const PanelIndicator = GObject.registerClass(
class PanelIndicator extends QuickSettings.SystemIndicator {

    _init(settings, rpgEngine, achievementManager, extensionPath) {
        super._init();

        this._settings = settings;
        this._rpgEngine = rpgEngine;
        this._achievementManager = achievementManager;
        this._extensionPath = extensionPath;

        // 1. Panel Indicator (the icon/label next to clock/wifi)
        this._indicator = this._addIndicator();
        this._label = new St.Label({
            style_class: 'system-rpg-panel-label-qs',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._indicator.add_child(this._label);

        // 2. Quick Settings Toggle
        this._toggle = new QuickSettings.QuickMenuToggle({
            title: 'SystemQuest',
            iconName: 'input-gaming-symbolic',
        });

        // Add the character sheet to the toggle's menu
        this._sheet = new CharacterSheet(rpgEngine, achievementManager, settings);
        const sheetItem = new PopupMenu.PopupBaseMenuItem({ reactive: false, can_focus: false, style_class: 'system-rpg-sheet-item' });
        sheetItem.add_child(this._sheet);
        this._toggle.menu.addMenuItem(sheetItem);

        this.quickSettingsItems.push(this._toggle);

        this.refresh();
    }

    refresh(liveMetrics = null) {
        const cls     = this._rpgEngine.getCharacterClass();
        const overall = this._rpgEngine.getOverallLevel();
        const name    = this._rpgEngine.getCharacterName();

        this._label.set_text(`${cls.emoji} Lv.${overall}`);
        this._toggle.title = `${name} (Lv.${overall})`;
        this._toggle.subtitle = cls.name;

        this._sheet?.refresh(liveMetrics);
    }

    setTheme(variant) {
        this._sheet?.setTheme(variant);
    }

    destroy() {
        if (this._toggle) {
            this._toggle.destroy();
            this._toggle = null;
        }
        if (this._label) {
            this._label.destroy();
            this._label = null;
        }
        this._sheet = null;
        super.destroy();
    }
});
