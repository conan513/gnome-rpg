import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
const file = Gio.File.new_for_path(GLib.get_home_dir());
const info = file.query_info('time::created', Gio.FileQueryInfoFlags.NONE, null);
if (info.has_attribute('time::created')) {
    const created = info.get_attribute_uint64('time::created');
    console.log("Created at:", created);
} else {
    console.log("Attribute not found");
}
