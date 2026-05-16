# 🌌 SystemQuest — GNOME RPG Extension

> *Turn your Linux system activity into an RPG character progression system.*

SystemQuest is a GNOME Shell extension that monitors your system in real time and rewards you with XP and levels based on how you actually use your computer. The harder your system works, the stronger your character becomes.

---

## 📦 Installation

```bash
git clone https://github.com/yourname/gnome-rpg.git
cd gnome-rpg
make install   # or copy to ~/.local/share/gnome-shell/extensions/
```

Then enable the extension via GNOME Extensions app or:

```bash
gnome-extensions enable system-rpg@yourname
```

---

## ⚙️ How It Works

Every few seconds, the extension samples your system metrics and awards XP to the corresponding stat:

| Stat | Source | Formula |
|------|--------|---------|
| ⚔️ **STR** — Strength | CPU usage % | `cpu × 0.1 × multiplier` |
| 🧠 **INT** — Intelligence | RAM usage % | `ram × 0.08 × multiplier` |
| 🗡️ **DEX** — Dexterity | Disk I/O (MB/s) + mouse movement | `√(diskMBs) × 2.0 + mousePx × 0.002` |
| 🌐 **CHA** — Charisma | Network traffic (KB/s) | `√(netKBs) × 0.5` |
| 🛡️ **CON** — Constitution | System uptime (minutes elapsed) | `uptimeDelta × 15.0` |
| 🔮 **WIS** — Wisdom | Keypresses + clicks + scrolls | `keys × 0.5 + clicks × 0.3 + scrolls × 0.1` |

---

## 📈 Leveling Formula

XP required to reach a level:

```
XP(level) = floor(100 × (level − 1)^1.5)
```

| Level | XP Required |
|-------|------------|
| 1 | 0 |
| 2 | 100 |
| 3 | 283 |
| 5 | 800 |
| 10 | 2,850 |
| 20 | 9,026 |
| 50 | 34,648 |
| 99 | 97,980 |

---

## 🏰 Classes

Your class is determined automatically based on your stat levels. There are **6 tiers** of classes depending on how many stats qualify.

### Multi-Class Unlock Condition

> **Primary stat must be ≥ Level 5**, and any additional stat must be **≥ half of the primary stat's level** to count toward the class.

---

### ⚔️ Tier 1 — Base Classes *(1 qualifying stat)*

| Class | Emoji | Primary Stat |
|-------|-------|-------------|
| Warrior | ⚔️ | STR |
| Mage | 🧙 | INT |
| Rogue | 🗡️ | DEX |
| Bard | 🎭 | CHA |
| Paladin | 🛡️ | CON |
| Oracle | 🔮 | WIS |

---

### ⚔️🧠 Tier 2 — Dual Classes *(2 qualifying stats, primary ≥ Lv.5)*

| Class | Emoji | Stats |
|-------|-------|-------|
| Warlord | 🌐⚔️ | CHA + STR |
| Herald | 🌐🛡️ | CHA + CON |
| Swashbuckler | 🌐🗡️ | CHA + DEX |
| Illusionist | 🌐🧠 | CHA + INT |
| Shaman | 🌐🔮 | CHA + WIS |
| Juggernaut | 🛡️⚔️ | CON + STR |
| Ranger | 🛡️🗡️ | CON + DEX |
| Necromancer | 🛡️🧠 | CON + INT |
| Cleric | 🛡️🔮 | CON + WIS |
| Barbarian | 🗡️⚔️ | DEX + STR |
| Spellthief | 🗡️🧠 | DEX + INT |
| Assassin | 🗡️🔮 | DEX + WIS |
| Battlemage | 🧠⚔️ | INT + STR |
| Archmage | 🧠🔮 | INT + WIS |
| Monk | ⚔️🔮 | STR + WIS |

---

### ⚔️🧠🗡️ Tier 3 — Triple Classes *(3 qualifying stats)*

| Class | Emoji | Stats |
|-------|-------|-------|
| Gladiator | 🏟️ | CHA + CON + STR |
| Skirmisher | 🏇 | CHA + CON + DEX |
| Diplomat | 📜 | CHA + CON + INT |
| Templar | ⛪ | CHA + CON + WIS |
| Blade Dancer | 💃 | CHA + DEX + STR |
| Mountebank | 🎭 | CHA + DEX + INT |
| Shadow Shaman | 🌑 | CHA + DEX + WIS |
| Spellsword | 🪄 | CHA + INT + STR |
| Sage | 🦉 | CHA + INT + WIS |
| Crusader | 📿 | CHA + STR + WIS |
| Vanguard | 🛡️ | CON + DEX + STR |
| Artificer | ⚙️ | CON + DEX + INT |
| Sentinel | 🦅 | CON + DEX + WIS |
| Dreadnought | ⚓ | CON + INT + STR |
| Oracle Defender | 🧿 | CON + INT + WIS |
| Warden | 🌳 | CON + STR + WIS |
| Battlemaster | 🎖️ | DEX + INT + STR |
| Arcane Trickster | 🃏 | DEX + INT + WIS |
| Shadowblade | 🥷 | DEX + STR + WIS |
| Loremaster | 📚 | INT + STR + WIS |

---

### 🌟 Tier 4 — Quad Classes *(4 qualifying stats)*

| Class | Emoji | Stats |
|-------|-------|-------|
| Champion | 🏆 | CHA + CON + DEX + STR |
| Polymath | 🧭 | CHA + CON + DEX + INT |
| Ascetic | 🧘 | CHA + CON + DEX + WIS |
| Conqueror | 👑 | CHA + CON + INT + STR |
| Thaumaturge | 💫 | CHA + CON + INT + WIS |
| Justiciar | ⚖️ | CHA + CON + STR + WIS |
| Spellblade Captain | ⚔️✨ | CHA + DEX + INT + STR |
| Mystic Trickster | 🦊 | CHA + DEX + INT + WIS |
| Shadow Lord | 👑🌑 | CHA + DEX + STR + WIS |
| Grand Sorcerer | 🧙‍♂️✨ | CHA + INT + STR + WIS |
| Ironclad | 🦾 | CON + DEX + INT + STR |
| Rune Knight | ᛟ⚔️ | CON + DEX + INT + WIS |
| Blademaster | 🗡️✨ | CON + DEX + STR + WIS |
| Arch-Templar | ⛪✨ | CON + INT + STR + WIS |
| Grandmaster | 🥋 | DEX + INT + STR + WIS |

---

### ⚡ Tier 5 — Penta Classes *(5 qualifying stats)*

| Class | Emoji | Stats |
|-------|-------|-------|
| Demigod | ⚡ | CHA + CON + DEX + INT + STR |
| Avatar | 🌌 | CHA + CON + DEX + INT + WIS |
| Hero of Legend | 🌟 | CHA + CON + DEX + STR + WIS |
| Mythic Scholar | 📜✨ | CHA + CON + INT + STR + WIS |
| Phantom King | 👑👻 | CHA + DEX + INT + STR + WIS |
| Immortal | ♾️ | CON + DEX + INT + STR + WIS |

---

### 🌌👑 Tier 6 — Hexa Class *(all 6 stats qualify)*

| Class | Emoji | Stats |
|-------|-------|-------|
| **True Ascendant** | 🌌👑 | CHA + CON + DEX + INT + STR + WIS |

> The rarest class. Requires all six stats to be at least half the level of your highest stat, with your primary stat at level 5 or above.

---

## 🏆 Tips for Specific Classes

| Goal | Strategy |
|------|----------|
| **Paladin** | Keep your system running continuously — uptime gives CON XP. |
| **Mage** | Run memory-intensive workloads (VMs, browsers, dev tools). |
| **Warrior** | Compile code, run benchmarks, or keep CPU under heavy load. |
| **Bard** | Stream video, upload/download large files for network XP. |
| **Rogue** | Move your mouse a lot and do heavy disk I/O (video editing, builds). |
| **Oracle** | Type and click extensively — ideal for writers and developers. |
| **True Ascendant** | Do all of the above simultaneously and never reboot. |

---

## 🔧 Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `xp-multiplier` | Global XP rate multiplier | `1.0` |

---

## 📁 Project Structure

```
gnome-rpg/
├── extension.js          # Entry point, wires up components
├── stylesheet.css        # All UI styling
├── lib/
│   ├── rpgEngine.js      # Core XP, leveling, class logic
│   ├── systemMonitor.js  # CPU/RAM/Disk/Net metric collection
│   └── inputMonitor.js   # Keyboard/mouse/scroll tracking
└── ui/
    ├── characterSheet.js # Character sheet popup UI
    └── panelIndicator.js # Top-bar panel button
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
