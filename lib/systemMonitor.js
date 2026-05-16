import GLib from 'gi://GLib';
import GTop from 'gi://GTop';

/**
 * SystemMonitor — polls CPU, RAM, Disk I/O, Network, and Uptime every 5 seconds
 * using GTop and /proc pseudo-files.
 */
export class SystemMonitor {
    constructor() {
        this._timeoutId = null;
        this._prevCpu = null;
        this._prevDiskSectors = null;
        this._prevNetBytes = null;
        this.onTick = null;
        this.INTERVAL = 5; // seconds
    }

    start() {
        // First tick fires immediately after one interval
        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            this.INTERVAL,
            () => {
                this._tick();
                return GLib.SOURCE_CONTINUE;
            }
        );
    }

    stop() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    _tick() {
        const disk = this._getDiskIO();
        const net = this._getNet();
        
        const metrics = {
            cpu: this._getCpu(),
            ram: this._getRam(),
            diskMBs: disk.total,
            diskReadMBs: disk.read,
            diskWriteMBs: disk.write,
            netKBs: net.total,
            netRxKBs: net.rx,
            netTxKBs: net.tx,
            uptimeMin: this._getUptime(),
            uptimeStr: this._getUptimeStr(),
        };
        if (this.onTick) this.onTick(metrics);
    }

    _getCpu() {
        try {
            const cpu = new GTop.glibtop_cpu();
            GTop.glibtop_get_cpu(cpu);
            if (this._prevCpu === null) {
                this._prevCpu = { user: cpu.user, total: cpu.total };
                return 0;
            }
            const userDelta = cpu.user - this._prevCpu.user;
            const totalDelta = cpu.total - this._prevCpu.total;
            this._prevCpu = { user: cpu.user, total: cpu.total };
            if (totalDelta <= 0) return 0;
            return Math.min(100, Math.round(userDelta * 100 / totalDelta));
        } catch (e) {
            console.warn('[SystemRPG] CPU read error:', e.message);
            return 0;
        }
    }

    _getRam() {
        try {
            const mem = new GTop.glibtop_mem();
            GTop.glibtop_get_mem(mem);
            if (mem.total <= 0) return 0;
            // Exclude kernel buffers and page cache from "used"
            const used = mem.used - mem.buffer - mem.cached;
            return Math.min(100, Math.round(used * 100 / mem.total));
        } catch (e) {
            console.warn('[SystemRPG] RAM read error:', e.message);
            return 0;
        }
    }

    _getDiskIO() {
        try {
            const [, bytes] = GLib.file_get_contents('/proc/diskstats');
            const text = new TextDecoder().decode(bytes);
            let sectorsRead = 0;
            let sectorsWrite = 0;
            for (const line of text.split('\n')) {
                const parts = line.trim().split(/\s+/);
                if (parts.length < 14) continue;
                if (!/^(sd[a-z]|nvme\d+n\d+|vd[a-z]|hd[a-z])$/.test(parts[2])) continue;
                sectorsRead += parseInt(parts[5], 10);
                sectorsWrite += parseInt(parts[9], 10);
            }
            
            if (this._prevDiskSectors === null) {
                this._prevDiskSectors = { read: sectorsRead, write: sectorsWrite };
                return { read: 0, write: 0, total: 0 };
            }
            
            const deltaRead = Math.max(0, sectorsRead - this._prevDiskSectors.read);
            const deltaWrite = Math.max(0, sectorsWrite - this._prevDiskSectors.write);
            this._prevDiskSectors = { read: sectorsRead, write: sectorsWrite };
            
            const toMBs = (val) => Math.round(val * 512 / 1024 / 1024 / this.INTERVAL * 10) / 10;
            const r = toMBs(deltaRead);
            const w = toMBs(deltaWrite);
            
            return { read: r, write: w, total: Math.round((r + w) * 10) / 10 };
        } catch (e) {
            return { read: 0, write: 0, total: 0 };
        }
    }

    _getNet() {
        try {
            const [, bytes] = GLib.file_get_contents('/proc/net/dev');
            const text = new TextDecoder().decode(bytes);
            let rx = 0;
            let tx = 0;
            for (const line of text.split('\n').slice(2)) {
                const parts = line.trim().split(/\s+/);
                if (parts.length < 10) continue;
                const iface = parts[0].replace(':', '');
                if (iface === 'lo') continue;
                rx += parseInt(parts[1], 10);
                tx += parseInt(parts[9], 10);
            }
            
            if (this._prevNetBytes === null) {
                this._prevNetBytes = { rx, tx };
                return { rx: 0, tx: 0, total: 0 };
            }
            
            const deltaRx = Math.max(0, rx - this._prevNetBytes.rx);
            const deltaTx = Math.max(0, tx - this._prevNetBytes.tx);
            this._prevNetBytes = { rx, tx };
            
            const toKBs = (val) => Math.round(val / 1024 / this.INTERVAL * 10) / 10;
            const r = toKBs(deltaRx);
            const t = toKBs(deltaTx);
            
            return { rx: r, tx: t, total: Math.round((r + t) * 10) / 10 };
        } catch (e) {
            return { rx: 0, tx: 0, total: 0 };
        }
    }

    _getUptime() {
        try {
            const [, bytes] = GLib.file_get_contents('/proc/uptime');
            const text = new TextDecoder().decode(bytes);
            const seconds = parseFloat(text.trim().split(/\s+/)[0]);
            return Math.floor(seconds / 60);
        } catch (e) {
            return 0;
        }
    }
    
    _getUptimeStr() {
        const mins = this._getUptime();
        const d = Math.floor(mins / 1440);
        const h = Math.floor((mins % 1440) / 60);
        const m = mins % 60;
        let str = '';
        if (d > 0) str += `${d}d `;
        if (h > 0 || d > 0) str += `${h}h `;
        str += `${m}m`;
        return str;
    }
}
