# Party Wardrobe Manager (PWM) v1.4.0
**A Multi-Character RPG Outfit & Costume Manager for SillyTavern / TauriTavern**

---

### ✨ What's New in v1.4.0

1. **Default English with Persistent User Preference**
   - The UI defaults to **English (`en`)** on first launch.
   - When you switch the language to **ไทย (`th`)** or back to **English**, your preference is automatically saved in `localStorage` and remembered across browser/app restarts.

2. **Full Thai Translations for All 112 Default Outfits**
   - Both **Outfit Name** (`th_name`) and **Detailed Description** (`th_desc`) are translated into rich, elegant Thai for all 112 default costumes.
   - In Thai mode: shows Thai titles and Thai descriptions.
   - In English mode: shows English titles and English descriptions.

3. **Split Imported Lorebooks (Dedicated Shelves - Never Merged)**
   - Custom and imported lorebooks are no longer lumped into one giant list!
   - Each imported lorebook is kept in its own separate shelf (e.g. `Sensual Costumes`, `Cyberpunk Pack`, `RP Captured`).
   - Use the **Lorebook Shelf** dropdown to view, filter, or manage each book independently.
   - Includes a **Delete Shelf** button (`🗑️`) to remove a single book shelf without touching any other books.

4. **Pick Directly from SillyTavern World Info (`📥 Pick from ST World`)**
   - No need to manually locate and upload JSON files from your hard drive!
   - Click **`Pick from ST World`** to browse all World Info lorebooks already loaded in SillyTavern.
   - Click **`Import to Shelf`** on any lorebook to instantly import its outfits into their own shelf.

5. **Deep OLED Midnight Theme & Mobile Responsive**
   - High-contrast OLED dark palette (`#07090e`, `#0b0f19`, `#f472b6`) for night roleplay.
   - Adaptive 1-column layout on mobile devices (`max-width: 768px`) with touch targets.

6. **AI Chat Attire Scanner & Multi-Character RPG Party Sheet**
   - Dynamic AI scanner reads recent chat and extracts what a character is currently wearing.
   - Injects a persistent party attire sheet at Prompt Depth 2 (`Anti-Amnesia Sheet`).

---

### 📂 File Structure
- `index.js` — Main extension logic & embedded 112-costume bilingual catalog.
- `style.css` — OLED night styles, submodals, shelf bars, and mobile responsiveness.
- `manifest.json` — SillyTavern extension registration with `"hooks": { "activate": "init" }`.
- `README.md` — Extension documentation.

---

### 🚀 Usage
1. Press `Ctrl + R` in TauriTavern / SillyTavern to reload.
2. Click the shirt icon `👕` above the chat input box to open the Wardrobe Manager.
3. Switch between `👑 Default Sets (112)` and `📂 Custom / Imported`.
4. Click `Pick from ST World` to import any of your existing SillyTavern lorebooks!
