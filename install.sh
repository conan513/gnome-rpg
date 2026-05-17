#!/usr/bin/env bash
# install.sh — SystemQuest GNOME Extension Manager
set -e

EXTENSION_UUID="system-rpg@conan513"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
ZIP_FILE="/tmp/$EXTENSION_UUID.zip"

if [[ "${1:-}" == "uninstall" ]]; then
    echo "▶ Uninstalling..."
    gnome-extensions uninstall "$EXTENSION_UUID" 2>/dev/null || true
    rm -rf "$INSTALL_DIR"
    echo "✓ Uninstalled."
    exit 0
fi

echo "=== SystemQuest Installer ==="

# 1. Schema fordítás
echo "▶ Compiling schemas..."
glib-compile-schemas "$SOURCE_DIR/schemas/"

# 2. Csomagolás (mappastruktúra megtartásával)
echo "▶ Packing extension..."
rm -f "$ZIP_FILE"
# A gnome-extensions pack alapból a jelenlegi könyvtárat csomagolja
# Csak azokat a fájlokat adjuk hozzá, amik kellenek
zip -r "$ZIP_FILE" . -x "*.git*" "install.sh" "*.zip" "node_modules/*" ".gemini/*"

# 3. Telepítés (úgy, mint a weboldalról)
echo "▶ Installing via gnome-extensions CLI..."
gnome-extensions install --force "$ZIP_FILE"

# 4. Engedélyezés
echo "▶ Enabling..."
# Adunk egy kis időt a Shellnek, hogy észrevegye az új fájlokat
sleep 1
gnome-extensions enable "$EXTENSION_UUID" || echo "! Ha nem sikerült, próbáld meg az 'Extensions' (Bővítmények) appban manuálisan bekapcsolni."

echo ""
echo "=== KÉSZ! ==="
echo "Ha még mindig nem látod, indítsd újra a Shell-t (Alt+F2 -> r -> Enter, vagy logout/login Wayland-en)."
