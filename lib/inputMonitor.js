import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';

/**
 * InputMonitor — captures global keyboard, mouse, and scroll events via Clutter.
 *
 * Privacy guarantee: only event COUNTS are tracked.
 * Key content, button labels, and coordinates are never stored or logged.
 *
 * Uses global.stage 'captured-event' so it receives all input before actors do.
 * Always returns Clutter.EVENT_PROPAGATE — events are NEVER consumed.
 */
export class InputMonitor {
    constructor() {
        this._capturedEventId = null;

        // --- Per-interval counters (reset each tick) ---
        this._keypresses = 0;
        this._leftClicks = 0;
        this._rightClicks = 0;
        this._middleClicks = 0;
        this._otherClicks = 0;
        this._scrolls = 0;
        this._mouseTravelPx = 0;

        // --- Lifetime totals (persisted externally via rpgEngine) ---
        this._totalKeypresses = 0;
        this._totalClicks = 0;
        this._totalLeftClicks = 0;
        this._totalRightClicks = 0;
        this._totalMiddleClicks = 0;
        this._totalOtherClicks = 0;
        this._totalScrolls = 0;
        this._totalMousePx = 0;

        // Last known mouse position for delta calculation
        this._lastX = null;
        this._lastY = null;
        this._mousePollId = null;

        // --- Activity signals (Wayland-friendly) ---
        this._focusChanges = 0;
        this._workspaceSwitches = 0;
        this._clipboardChanges = 0;
        this._totalClipboardChanges = 0;

        this._focusHandlerId = 0;
        this._workspaceHandlerId = 0;
        this._selectionHandlerId = 0;
    }

    /**
     * Load lifetime totals from persisted save data.
     */
    loadTotals(totals) {
        if (!totals) return;
        this._totalKeypresses = totals.totalKeypresses || 0;
        this._totalClicks = totals.totalClicks || 0;
        this._totalLeftClicks = totals.totalLeftClicks || 0;
        this._totalRightClicks = totals.totalRightClicks || 0;
        this._totalMiddleClicks = totals.totalMiddleClicks || 0;
        this._totalOtherClicks = totals.totalOtherClicks || 0;
        this._totalScrolls = totals.totalScrolls || 0;
        this._totalClipboardChanges = totals.totalClipboardChanges || 0;
        // Convert stored km back to pixels (96 DPI: 1 inch = 96px, 1m = 3779.5px)
        this._totalMousePx = (totals.totalMouseKm || 0) * 1000 * 3779.5;
    }

    start() {
        this._capturedEventId = global.stage.connect(
            'captured-event',
            (_actor, event) => this._onEvent(event)
        );

        // Poll mouse position every 1 second to calculate distance.
        // Doing this instead of hooking Clutter.EventType.MOTION saves massive amounts of CPU
        // because MOTION events can fire 1000+ times per second on gaming mice.
        this._mousePollId = GLib.timeout_add(GLib.PRIORITY_LOW, 1000, () => {
            this._pollMouse();
            return GLib.SOURCE_CONTINUE;
        });

        // Track focus changes
        this._focusHandlerId = global.display.connect('notify::focus-window', () => {
            this._focusChanges++;
        });

        // Track workspace changes
        this._workspaceHandlerId = global.workspace_manager.connect('active-workspace-changed', () => {
            this._workspaceSwitches++;
        });

        // Track clipboard/selection changes (Copy / Select text)
        try {
            const selection = global.display.get_selection();
            if (selection) {
                this._selectionHandlerId = selection.connect('owner-changed', () => {
                    this._clipboardChanges++;
                    this._totalClipboardChanges++;
                });
            }
        } catch (e) {
            console.warn('[SystemRPG] Failed to hook clipboard selection:', e.message);
        }
    }

    stop() {
        if (this._capturedEventId !== null) {
            global.stage.disconnect(this._capturedEventId);
            this._capturedEventId = null;
        }
        if (this._mousePollId) {
            GLib.source_remove(this._mousePollId);
            this._mousePollId = null;
        }

        if (this._focusHandlerId) {
            global.display.disconnect(this._focusHandlerId);
            this._focusHandlerId = 0;
        }

        if (this._workspaceHandlerId) {
            global.workspace_manager.disconnect(this._workspaceHandlerId);
            this._workspaceHandlerId = 0;
        }

        if (this._selectionHandlerId) {
            try {
                const selection = global.display.get_selection();
                if (selection) {
                    selection.disconnect(this._selectionHandlerId);
                }
            } catch(e) {}
            this._selectionHandlerId = 0;
        }
    }

    _pollMouse() {
        try {
            const [x, y] = global.get_pointer();
            if (this._lastX !== null && this._lastY !== null) {
                const dx = x - this._lastX;
                const dy = y - this._lastY;
                if (dx !== 0 || dy !== 0) {
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    this._mouseTravelPx += dist;
                    this._totalMousePx += dist;
                }
            }
            this._lastX = x;
            this._lastY = y;
        } catch (e) {
            // global.get_pointer() can sometimes fail or be missing in certain environments,
            // though it's standard in GNOME Shell. We ignore the error if it happens.
        }
    }

    _onEvent(event) {
        const type = event.type();

        // Fast-path ignore MOTION events to reduce CPU usage.
        // We use polling for mouse distance instead.
        if (type === Clutter.EventType.MOTION) {
            return Clutter.EVENT_PROPAGATE;
        }

        switch (type) {
        case Clutter.EventType.KEY_PRESS:
            this._keypresses++;
            this._totalKeypresses++;
            break;

        case Clutter.EventType.BUTTON_PRESS: {
            const btn = event.get_button();
            if (btn === 1) {
                this._leftClicks++;
                this._totalLeftClicks++;
            } else if (btn === 3) {
                this._rightClicks++;
                this._totalRightClicks++;
            } else if (btn === 2) {
                this._middleClicks++;
                this._totalMiddleClicks++;
            } else {
                this._otherClicks++;
                this._totalOtherClicks++;
            }
            this._totalClicks++;
            break;
        }

        case Clutter.EventType.SCROLL:
            this._scrolls++;
            this._totalScrolls++;
            break;

        default:
            break;
        }

        // CRITICAL: never consume events
        return Clutter.EVENT_PROPAGATE;
    }

    /**
     * Called each system tick. Returns interval stats and resets interval counters.
     * Lifetime totals are NOT reset.
     */
    getAndReset() {
        let openWindows = 0;
        try {
            if (global.get_window_actors) {
                openWindows = global.get_window_actors().length;
            }
        } catch (e) {}

        const stats = {
            // Interval stats
            keypresses: this._keypresses,
            clicks: this._leftClicks + this._rightClicks + this._middleClicks + this._otherClicks,
            leftClicks: this._leftClicks,
            rightClicks: this._rightClicks,
            middleClicks: this._middleClicks,
            scrolls: this._scrolls,
            mouseTravelPx: Math.round(this._mouseTravelPx),
            focusChanges: this._focusChanges,
            workspaceSwitches: this._workspaceSwitches,
            clipboardChanges: this._clipboardChanges,
            openWindows: openWindows,

            // Lifetime totals
            totalKeypresses: this._totalKeypresses,
            totalClicks: this._totalClicks,
            totalLeftClicks: this._totalLeftClicks,
            totalRightClicks: this._totalRightClicks,
            totalMiddleClicks: this._totalMiddleClicks,
            totalOtherClicks: this._totalOtherClicks,
            totalScrolls: this._totalScrolls,
            totalClipboardChanges: this._totalClipboardChanges,
            // Convert px → km (96 DPI assumption)
            totalMouseKm: Math.round(this._totalMousePx / 3779.5 / 100) / 10,
        };

        // Reset interval counters
        this._keypresses = 0;
        this._leftClicks = 0;
        this._rightClicks = 0;
        this._middleClicks = 0;
        this._otherClicks = 0;
        this._scrolls = 0;
        this._mouseTravelPx = 0;
        this._focusChanges = 0;
        this._workspaceSwitches = 0;
        this._clipboardChanges = 0;

        return stats;
    }

    /** Returns current lifetime totals without resetting anything. */
    getTotals() {
        return {
            totalKeypresses: this._totalKeypresses,
            totalClicks: this._totalClicks,
            totalLeftClicks: this._totalLeftClicks,
            totalRightClicks: this._totalRightClicks,
            totalMiddleClicks: this._totalMiddleClicks,
            totalOtherClicks: this._totalOtherClicks,
            totalScrolls: this._totalScrolls,
            totalClipboardChanges: this._totalClipboardChanges,
            totalMouseKm: Math.round(this._totalMousePx / 3779.5 / 100) / 10,
        };
    }
}
