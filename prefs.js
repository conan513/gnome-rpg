import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import { ExtensionPreferences } from 'resource:///org/gnome/shell/extensions/prefs.js';

export default class SystemRpgPreferences extends ExtensionPreferences {

    fillPreferencesWindow(window) {
        window.set_title('SystemQuest Settings');
        window.set_default_size(500, 420);

        const settings = this.getSettings();

        // ── Page: Gameplay ───────────────────────────────────────────────
        const gamePage = new Adw.PreferencesPage({
            title: 'Gameplay',
            icon_name: 'media-playback-start-symbolic',
        });

        const gameGroup = new Adw.PreferencesGroup({
            title: 'XP & Display',
            description: 'Character name and avatar are taken from your GNOME profile.',
        });

        // XP multiplier
        const xpRow = new Adw.SpinRow({
            title: 'XP Multiplier',
            subtitle: 'Multiplies all experience gains (0.1 – 5.0)',
            adjustment: new Gtk.Adjustment({
                lower: 0.1, upper: 5.0, step_increment: 0.1, page_increment: 0.5,
            }),
            digits: 1,
        });
        xpRow.set_value(settings.get_double('xp-multiplier'));
        xpRow.connect('notify::value', () => {
            settings.set_double('xp-multiplier', xpRow.get_value());
        });
        gameGroup.add(xpRow);

        // Notifications toggle
        const notifRow = new Adw.SwitchRow({
            title: 'Achievement & Level-up Notifications',
            subtitle: 'Show desktop notifications for level-ups and achievements',
        });
        notifRow.set_active(settings.get_boolean('notifications-enabled'));
        notifRow.connect('notify::active', () => {
            settings.set_boolean('notifications-enabled', notifRow.get_active());
        });
        gameGroup.add(notifRow);

        // Live metrics toggle
        const metricsRow = new Adw.SwitchRow({
            title: 'Show Live Metrics',
            subtitle: 'Display real-time CPU / RAM / Disk / Net values in the popup',
        });
        metricsRow.set_active(settings.get_boolean('show-live-metrics'));
        metricsRow.connect('notify::active', () => {
            settings.set_boolean('show-live-metrics', metricsRow.get_active());
        });
        gameGroup.add(metricsRow);

        gamePage.add(gameGroup);

        // ── Page: Data ───────────────────────────────────────────────────
        const dataPage = new Adw.PreferencesPage({
            title: 'Data',
            icon_name: 'drive-harddisk-symbolic',
        });

        const dataGroup = new Adw.PreferencesGroup({
            title: 'Save Data',
            description: 'Progress is saved automatically every 60 seconds.',
        });

        const savePath = GLib.build_filenamev([
            GLib.get_user_data_dir(), 'gnome-shell', 'system-rpg-save.json',
        ]);

        dataGroup.add(new Adw.ActionRow({
            title: 'Save File',
            subtitle: savePath,
            activatable: false,
        }));

        // Reset progress button
        const resetRow = new Adw.ActionRow({
            title: 'Reset All Progress',
            subtitle: 'Permanently deletes all XP, levels, and achievements',
        });
        const resetBtn = new Gtk.Button({
            label: 'Reset',
            css_classes: ['destructive-action'],
            valign: Gtk.Align.CENTER,
        });
        resetBtn.connect('clicked', () => {
            const dialog = new Adw.AlertDialog({
                heading: 'Reset All Progress?',
                body: 'This will permanently delete all XP, levels, and achievement data.\nThis cannot be undone.',
            });
            dialog.add_response('cancel', 'Cancel');
            dialog.add_response('reset', 'Reset Everything');
            dialog.set_response_appearance('reset', Adw.ResponseAppearance.DESTRUCTIVE);
            dialog.connect('response', (_d, response) => {
                if (response === 'reset') {
                    try { Gio.File.new_for_path(savePath).delete(null); } catch (_e) {}
                }
            });
            dialog.present(window);
        });
        resetRow.add_suffix(resetBtn);
        dataGroup.add(resetRow);

        dataPage.add(dataGroup);

        // ── Add pages ────────────────────────────────────────────────────
        window.add(gamePage);
        window.add(dataPage);
    }
}
