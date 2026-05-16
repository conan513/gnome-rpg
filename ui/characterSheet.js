import St from 'gi://St';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Clutter from 'gi://Clutter';
import { STATS, STAT_META, xpForLevel } from '../lib/rpgEngine.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLabel(text, styleClass) {
    return new St.Label({ text, style_class: styleClass, y_align: Clutter.ActorAlign.CENTER });
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ---------------------------------------------------------------------------
// XP Bar widget
// ---------------------------------------------------------------------------

const XpBar = GObject.registerClass(
class XpBar extends St.Widget {
    _init() {
        super._init({
            style_class: 'system-rpg-xpbar',
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        
        this._fraction = 0;
        this._fill = new St.Widget({
            style_class: 'system-rpg-xpbar-fill',
            x: 0,
            y: 0,
        });
        this.add_child(this._fill);

        this.connect('notify::allocation', () => {
            this._updateFill();
        });
    }

    setFraction(f) {
        this._fraction = clamp(f, 0, 1);
        this._updateFill();
    }

    _updateFill() {
        const alloc = this.get_allocation_box();
        const totalW = alloc.x2 - alloc.x1;
        const totalH = alloc.y2 - alloc.y1;
        if (totalW <= 0) return;

        const fillWidth = Math.round(totalW * this._fraction);
        this._fill.set_position(0, 0);
        this._fill.set_size(fillWidth, totalH);
    }
});

// ---------------------------------------------------------------------------
// Single stat row:  🗡️ DEX  Lv.4  ████░░  78/100 XP
// ---------------------------------------------------------------------------

const StatRow = GObject.registerClass(
class StatRow extends St.BoxLayout {
    _init(stat) {
        super._init({
            style_class: 'system-rpg-stat-row',
            vertical: false,
            x_expand: true,
        });
        this._stat = stat;
        const meta = STAT_META[stat];

        // Label group: emoji + name + level
        const labelBox = new St.BoxLayout({
            style_class: 'system-rpg-stat-label-box',
        });

        this._emojiLabel = makeLabel(meta.emoji, 'system-rpg-stat-emoji');
        this._nameLabel  = makeLabel(meta.name, 'system-rpg-stat-name');
        this._levelLabel = makeLabel('Lv.1', 'system-rpg-stat-level');
        
        labelBox.add_child(this._emojiLabel);
        labelBox.add_child(this._nameLabel);
        labelBox.add_child(this._levelLabel);

        // Bar group: progress bar + XP text overlay
        this._bar        = new XpBar();
        this._xpLabel    = makeLabel('0/100 XP', 'system-rpg-stat-xp');
        this._xpLabel.x_align = Clutter.ActorAlign.CENTER;
        this._xpLabel.y_align = Clutter.ActorAlign.CENTER;

        this._barOverlay = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
            y_expand: true,
        });
        this._barOverlay.add_child(this._bar);
        this._barOverlay.add_child(this._xpLabel);

        this.add_child(labelBox);
        this.add_child(this._barOverlay);
    }

    update(progress) {
        this._levelLabel.set_text(`Lv.${progress.level}`);
        this._bar.setFraction(progress.fraction);
        this._xpLabel.set_text(`${progress.current}/${progress.needed} XP`);
    }
});

// ---------------------------------------------------------------------------
// Achievement badge (small pill)
// ---------------------------------------------------------------------------

function makeAchievementBadge(achievement) {
    const card = new St.BoxLayout({
        style_class: `system-rpg-ach-card ${achievement.unlocked ? 'unlocked' : 'locked'}`,
        vertical: false,
        x_expand: true,
    });
    const icon = makeLabel(achievement.unlocked ? '✅' : '🔒', 'system-rpg-ach-icon');
    const textCol = new St.BoxLayout({ vertical: true, x_expand: true });
    const name = makeLabel(achievement.name, 'system-rpg-ach-name');
    const desc = makeLabel(achievement.desc ?? '', 'system-rpg-ach-desc');
    textCol.add_child(name);
    if (achievement.desc) textCol.add_child(desc);
    card.add_child(icon);
    card.add_child(textCol);
    return card;
}

// ---------------------------------------------------------------------------
// CharacterSheet — the full popup content
// ---------------------------------------------------------------------------

export const CharacterSheet = GObject.registerClass(
class CharacterSheet extends St.BoxLayout {
    _init(rpgEngine, achievementManager, settings) {
        super._init({
            style_class: 'system-rpg-sheet',
            vertical: true,
            x_expand: true,
        });

        this._engine = rpgEngine;
        this._achievementManager = achievementManager;
        this._settings = settings;
        this._activeTab = 'character';

        this._buildHeader();
        this._buildTabBar();

        // Main content bin for switching tabs — fixed height so the popup
        // never resizes or repositions when changing tabs.
        this._contentBin = new St.Widget({
            x_expand: true,
            y_expand: true,
            height: 320,
            layout_manager: new Clutter.BinLayout(),
        });
        this.add_child(this._contentBin);

        this._buildCharacterTab();
        this._buildStatsTab();
        this._buildAchievementsTab();

        this._switchTab('character');
        this.refresh();
    }

    _switchTab(tabId) {
        this._activeTab = tabId;
        this._charTab.visible        = (tabId === 'character');
        this._statsScroll.visible    = (tabId === 'stats');
        this._achScroll.visible      = (tabId === 'achievements');

        // Update button styles
        this._tabBtns.character.checked    = (tabId === 'character');
        this._tabBtns.stats.checked        = (tabId === 'stats');
        this._tabBtns.achievements.checked = (tabId === 'achievements');
    }

    _buildTabBar() {
        const bar = new St.BoxLayout({ style_class: 'system-rpg-tab-bar', x_expand: true });
        this._tabBtns = {
            character:    new St.Button({ label: 'Character',    style_class: 'system-rpg-tab-btn', x_expand: true, checked: true }),
            stats:        new St.Button({ label: 'Statistics',   style_class: 'system-rpg-tab-btn', x_expand: true }),
            achievements: new St.Button({ label: 'Achievements', style_class: 'system-rpg-tab-btn', x_expand: true }),
        };

        this._tabBtns.character.connect('clicked', () => this._switchTab('character'));
        this._tabBtns.stats.connect('clicked', () => this._switchTab('stats'));
        this._tabBtns.achievements.connect('clicked', () => this._switchTab('achievements'));

        Object.values(this._tabBtns).forEach(btn => {
            // Set x-expand on the button's layout properties if needed
            btn.x_expand = true;
            bar.add_child(btn);
        });
        this.add_child(bar);
    }

    _buildCharacterTab() {
        this._charTab = new St.BoxLayout({ vertical: true, x_expand: true });
        this._contentBin.add_child(this._charTab);

        this._buildOverallBar(this._charTab);
        this._buildStats(this._charTab);
    }

    _buildStatsTab() {
        // Wrap in a ScrollView so the content is scrollable
        this._statsScroll = new St.ScrollView({
            x_expand: true,
            y_expand: true,
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            overlay_scrollbars: true,
        });
        this._statsTab = new St.BoxLayout({ vertical: true, x_expand: true });
        this._statsScroll.set_child(this._statsTab);
        this._contentBin.add_child(this._statsScroll);

        this._buildLiveMetrics(this._statsTab);
        this._buildInputStats(this._statsTab);
        this._buildResetButton(this._statsTab);
    }

    _buildAchievementsTab() {
        // Wrap in a ScrollView so the content is scrollable
        this._achScroll = new St.ScrollView({
            x_expand: true,
            y_expand: true,
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
            overlay_scrollbars: true,
        });
        this._achTab = new St.BoxLayout({ vertical: true, x_expand: true });
        this._achScroll.set_child(this._achTab);
        this._contentBin.add_child(this._achScroll);

        this._buildAchievements(this._achTab);
    }

    setTheme(variant) {
        if (variant === 'dark') {
            this.add_style_class_name('dark-mode');
            this.remove_style_class_name('light-mode');
        } else {
            this.add_style_class_name('light-mode');
            this.remove_style_class_name('dark-mode');
        }
    }

    // --- Build sections ---

    _buildHeader() {
        const header = new St.BoxLayout({
            style_class: 'system-rpg-header',
            vertical: false,
            x_expand: true,
        });

        // Avatar container: user photo + class badge overlay
        const avatarContainer = new St.Widget({
            style_class: 'system-rpg-avatar-container',
            width: 56,
            height: 56,
        });

        this._avatarIcon = new St.Icon({
            style_class: 'system-rpg-avatar',
            icon_size: 48,
            icon_name: 'avatar-default-symbolic', // fallback
            x: 0, y: 0,
        });

        this._classBadge = new St.Label({
            style_class: 'system-rpg-class-badge',
            x: 32, y: 32,
        });

        avatarContainer.add_child(this._avatarIcon);
        avatarContainer.add_child(this._classBadge);

        const right = new St.BoxLayout({ vertical: true, x_expand: true });
        this._charNameLabel  = makeLabel('', 'system-rpg-char-name');
        this._classNameLabel = makeLabel('', 'system-rpg-class-name');
        right.add_child(this._charNameLabel);
        right.add_child(this._classNameLabel);

        header.add_child(avatarContainer);
        header.add_child(right);
        this.add_child(header);
    }

    _buildOverallBar(parent) {
        const row = new St.BoxLayout({ vertical: false, x_expand: true, style_class: 'system-rpg-overall-row' });
        this._overallLabel = makeLabel('Overall Lv.1', 'system-rpg-overall-label');
        this._overallBar   = new XpBar();
        this._overallXpLabel = makeLabel('', 'system-rpg-stat-xp');
        this._overallXpLabel.x_align = Clutter.ActorAlign.CENTER;
        this._overallXpLabel.y_align = Clutter.ActorAlign.CENTER;

        const overlay = new St.Widget({
            layout_manager: new Clutter.BinLayout(),
            x_expand: true,
            y_expand: true,
        });
        overlay.add_child(this._overallBar);
        overlay.add_child(this._overallXpLabel);

        row.add_child(this._overallLabel);
        row.add_child(overlay);
        parent.add_child(row);

        // Separator
        parent.add_child(new St.Widget({ style_class: 'system-rpg-separator', x_expand: true }));
    }

    _buildStats(parent) {
        this._statRows = {};
        for (const stat of STATS) {
            const row = new StatRow(stat);
            this._statRows[stat] = row;
            parent.add_child(row);
        }
    }

    _makeMetricCard(emoji, titleText, valueText) {
        const card = new St.BoxLayout({
            style_class: 'system-rpg-stat-card',
            vertical: false,
            x_expand: true,
        });
        const iconLabel = makeLabel(emoji, 'system-rpg-card-icon');
        const textCol = new St.BoxLayout({ vertical: true, x_expand: true });
        const titleLabel = makeLabel(titleText, 'system-rpg-card-title');
        const valueLabel = makeLabel(valueText, 'system-rpg-card-value');
        textCol.add_child(titleLabel);
        textCol.add_child(valueLabel);
        card.add_child(iconLabel);
        card.add_child(textCol);
        return { card, valueLabel };
    }

    _buildLiveMetrics(parent) {
        parent.add_child(makeLabel('System Metrics', 'system-rpg-section-title'));

        const defs = [
            { key: 'cpu',    emoji: '🖥️',  title: 'CPU Usage',    value: '—' },
            { key: 'ram',    emoji: '🧠',  title: 'RAM Usage',    value: '—' },
            { key: 'disk',   emoji: '💾',  title: 'Disk R/W',     value: '—' },
            { key: 'net',    emoji: '🌐',  title: 'Net DL/UL',    value: '—' },
            { key: 'uptime', emoji: '⏱️',  title: 'System Uptime', value: '—' },
        ];

        this._metricCards = {};
        for (const def of defs) {
            const { card, valueLabel } = this._makeMetricCard(def.emoji, def.title, def.value);
            this._metricCards[def.key] = valueLabel;
            parent.add_child(card);
        }

        parent.add_child(new St.Widget({ style_class: 'system-rpg-separator', x_expand: true }));
    }

    _buildInputStats(parent) {
        parent.add_child(makeLabel('Lifetime Activity', 'system-rpg-section-title'));

        const defs = [
            { key: 'age',     emoji: '🎂',  title: 'Character Age',   value: '—' },
            { key: 'keys',    emoji: '⌨️',  title: 'Keypresses',      value: '—' },
            { key: 'clicks',  emoji: '🖱️',  title: 'Mouse Clicks',    value: '—' },
            { key: 'lrm',     emoji: '👆',  title: 'L / R / M Clicks',value: '—' },
            { key: 'scrolls', emoji: '📜',  title: 'Scroll Events',   value: '—' },
            { key: 'mouse',   emoji: '🗺️',  title: 'Mouse Distance',  value: '—' },
            { key: 'data',    emoji: '📡',  title: 'Data Transferred',value: '—' },
        ];

        this._inputCards = {};
        for (const def of defs) {
            const { card, valueLabel } = this._makeMetricCard(def.emoji, def.title, def.value);
            this._inputCards[def.key] = valueLabel;
            parent.add_child(card);
        }
    }

    _buildAchievements(parent) {
        parent.add_child(makeLabel('Achievements', 'system-rpg-section-title'));

        this._achFlow = new St.BoxLayout({
            style_class: 'system-rpg-ach-flow',
            vertical: true,
            x_expand: true,
        });
        // Will be populated in refresh()
        parent.add_child(this._achFlow);
    }

    _buildResetButton(parent) {
        this._resetBtn = new St.Button({
            label: 'Reset Character (XP & Progress)',
            style_class: 'system-rpg-reset-btn',
            x_expand: true,
        });

        this._resetConfirmState = false;

        this._resetBtn.connect('clicked', () => {
            if (!this._resetConfirmState) {
                this._resetBtn.label = 'ARE YOU SURE? (Click again to confirm)';
                this._resetConfirmState = true;
                
                // Reset after 5 seconds if not clicked
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 5000, () => {
                    if (this._resetConfirmState) {
                        this._resetConfirmState = false;
                        if (this._resetBtn) this._resetBtn.label = 'Reset Character (XP & Progress)';
                    }
                    return GLib.SOURCE_REMOVE;
                });
            } else {
                this._engine.resetCharacter();
                this._resetConfirmState = false;
                this._resetBtn.label = 'Character Reset!';
                this.refresh();
                
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
                    if (this._resetBtn) this._resetBtn.label = 'Reset Character (XP & Progress)';
                    return GLib.SOURCE_REMOVE;
                });
            }
        });

        parent.add_child(this._resetBtn);
    }

    // --- Refresh (called each tick) ---

    refresh(liveMetrics = null) {
        if (!this.mapped) return;

        const cls     = this._engine.getCharacterClass();
        const name    = this._engine.getCharacterName();
        const overall = this._engine.getOverallLevel();

        // --- Header ---
        // Avatar: try to load GNOME user photo
        const avatarPath = this._engine.getAvatarPath();
        if (avatarPath) {
            this._avatarIcon.set_gicon(
                Gio.FileIcon.new(Gio.File.new_for_path(avatarPath))
            );
        } else {
            this._avatarIcon.icon_name = 'avatar-default-symbolic';
            this._avatarIcon.gicon = null;
        }
        this._classBadge.set_text(cls.emoji);
        this._charNameLabel.set_text(name);
        this._classNameLabel.set_text(`${cls.name} — Level ${overall}`);

        // Overall XP bar (use dominant stat's progress as proxy)
        const domProgress = this._engine.getXpProgress(cls.primary);
        this._overallLabel.set_text(`Overall Lv.${overall}`);
        this._overallBar.setFraction(domProgress.fraction);
        this._overallXpLabel.set_text(`${domProgress.current}/${domProgress.needed} XP`);

        // Stat rows
        for (const stat of STATS) {
            this._statRows[stat].update(this._engine.getXpProgress(stat));
        }

        // Live metrics
        if (liveMetrics && this._settings.get_boolean('show-live-metrics')) {
            this._metricCards.cpu.set_text(`${liveMetrics.cpu}%`);
            this._metricCards.ram.set_text(`${liveMetrics.ram}%`);
            this._metricCards.disk.set_text(`R: ${liveMetrics.diskReadMBs} | W: ${liveMetrics.diskWriteMBs} MB/s`);
            this._metricCards.net.set_text(`↓ ${(liveMetrics.netRxKBs / 1024).toFixed(1)} | ↑ ${(liveMetrics.netTxKBs / 1024).toFixed(1)} MB/s`);
            if (this._metricCards.uptime) {
                this._metricCards.uptime.set_text(liveMetrics.uptimeStr || '—');
            }
        }

        // Input lifetime stats
        const inp = this._engine.getInputTotals();
        const netTot = this._engine.getSaveState().netTotals || { rxMB: 0, txMB: 0 };
        if (this._inputCards.age) {
            this._inputCards.age.set_text(this._engine.getCharacterAgeString());
        }
        this._inputCards.keys.set_text(`${inp.totalKeypresses.toLocaleString()}`);
        this._inputCards.clicks.set_text(`${inp.totalClicks.toLocaleString()}`);
        if (this._inputCards.lrm) {
            this._inputCards.lrm.set_text(`${inp.totalLeftClicks.toLocaleString()} / ${inp.totalRightClicks.toLocaleString()} / ${inp.totalMiddleClicks.toLocaleString()}`);
        }
        this._inputCards.scrolls.set_text(`${inp.totalScrolls.toLocaleString()}`);
        this._inputCards.mouse.set_text(`${inp.totalMouseKm} km`);
        if (this._inputCards.data) {
            this._inputCards.data.set_text(`↓ ${(netTot.rxMB / 1024).toFixed(1)} | ↑ ${(netTot.txMB / 1024).toFixed(1)} GB`);
        }

        // Achievements
        this._achFlow.destroy_all_children();
        const achievements = this._achievementManager.getAllWithStatus();
        // Show unlocked first, then locked
        const sorted = [
            ...achievements.filter(a => a.unlocked),
            ...achievements.filter(a => !a.unlocked),
        ];
        for (const ach of sorted) {
            this._achFlow.add_child(makeAchievementBadge(ach));
        }
    }
});
