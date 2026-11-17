# Party Wardrobe Manager (PWM) v1.5.0
**A Multi-Character RPG Outfit & Costume Manager for SillyTavern / TauriTavern**

---

### 🌟 What's New in v1.5.0 (224 Default Presets Expanded Catalog)
- **Doubled the Default Wardrobe**: Added **112 brand-new default presets**, expanding the built-in library from 112 to **224 comprehensive presets** across all 9 categories:
  - **Specialty Sets**: Expanded from 25 to **50 items** (Vampire Countess, Cyber Kunoichi, Gothic Lolita, Pharaoh Empress, Race Queen, Dragon Knight Bikini, Kitsune Dancer, etc.).
  - **Tops**: Expanded from 15 to **30 items** (Keyhole Turtleneck, Backless Halter, Leather Biker Bra, Victorian Corset, Metallic Bandeau, etc.).
  - **Bottoms**: Expanded from 12 to **24 items** (Tennis Skirt, Lace Bloomers, Vinyl Miniskirt, Slit Maxi Skirt, Leather Micro Skirt, etc.).
  - **Dresses**: Expanded from 11 to **22 items** (Backless Silk Gown, Gothic Velvet Gown, Mini Qipao, Bandage Bodycon, etc.).
  - **Fullbody Suits**: Expanded from 7 to **14 items** (Metallic Catsuit, Fishnet Bodystocking, Diving Wetsuit, SciFi Plugsuit, etc.).
  - **Legwear**: Expanded from 6 to **12 items** (Lace Stay-Ups, Diamond Fishnets, Thigh-High Leather Stilettos, etc.).
  - **Daywear & Misc**: Expanded from 16 to **32 items** (Boyfriend Shirt, Silk Pajamas, Plaid School Blazer, Kimono Haori, Moto Jacket, etc.).
  - **States & Conditions**: Expanded from 7 to **14 items** (Torn Attire, Oil Sheened, Bound Ribbons, Dripping Sweat, Blindfolded, Handcuffed, etc.).
  - **Add-ons & Modifiers**: Expanded from 13 to **26 items** (Heart Choker, Fox Tail & Ears, Cat Paws, Body Chains, Lace Garters, etc.).
- **100% Bilingual**: Every single one of the 224 presets features full English and Thai names, detailed lore specifications, and search keywords.
- **Synced SillyTavern Lorebook**: The standalone sensual_costumes.json world info file in your SillyTavern library is updated to all 224 presets.

### 🫧 What's New in v1.4.2 (Floating Bubble GUI & Detail Inspector)
- **Floating Bubble Mobile Window**:
  - The modal no longer consumes 100vw/100vh. It now renders as an elegant **floating bubble modal** (95vw / 86vh, 20px curved corners, glowing pink accent border) with clear backdrop margins all around.
  - **3 Easy Ways to Exit**:
    1. Tap anywhere on the dark blurred backdrop outside the floating bubble.
    2. Tap the enlarged 32px circular ✕ button at the top-right header (safely inset from screen bezels/notches).
    3. Tap the quick [ ✕ ปิด / Exit ] button in the bottom action bar.
- **Outfit Detail Inspector Modal (Large Readable Text)**:
  - Solved mobile reading issues: Added a dedicated **Detail Bubble Inspector** (ℹ️ button on every card, or [ 🔍 เปิดอ่านตัวหนังสือใหญ่ฉบับเต็ม ] on selected cards).
  - Displays the complete unabridged description in large, crisp, high-contrast typography (15px, line-height 1.65, #f1f5f9), separated into clean paragraphs with keyword chips.
  - Includes direct action buttons: [ ✨ Select This Attire ], [ ✈ Apply to Chat ], and [ ✕ Close ].
- **Inline Card Auto-Expansion**:
  - Tapping any card in the list directly expands its description (-webkit-line-clamp: unset), allowing users to read the full text right inside the list without truncation.

### 📱 What's New in v1.4.1 (Mobile UX & Layout Overhaul)
- **Eliminated Card Text Collisions**: Added 2-line WebKit text clamping to outfit descriptions with auto card height, completely fixing text overflowing onto adjacent cards.
- **Dynamic Card Expansion**: Tapping/selecting any outfit smoothly expands its description up to 5 lines for effortless reading on small screens, alongside a neon checkmark badge (✓).
- **300px+ Vertical Space Savings**:
  - Moved **AI Scan Chat** into the header bar alongside the language selector, removing a full-width 45px button row.
  - Streamlined the target character bar into compact icons (👤, ➕).
  - Swapped the vertical stacked footer (which previously ate ~220px) into a sleek **single horizontal action row**: icon-only ↺ Clear (38px), side-by-side 💾 Save to Sheet (50%), and ✈ Apply to Chat (50%).
- **Full-Screen Mobile Modal**: Seamless 100vw / 100dvh edge-to-edge modal display without awkward borders on handheld devices.

### ✨ What's New in v1.4.0

1. **Default English with Persistent User Preference**
   - The UI defaults to **English (`en`)** on first launch.
   - When you switch the language to **ไทย (`th`)** or back to **English**, your preference is automatically saved in `localStorage` and remembered across browser/app restarts.

2. **Full Thai Translations for All 224 Default Outfits**
   - Both **Outfit Name** (`th_name`) and **Detailed Description** (`th_desc`) are translated into rich, elegant Thai for all 224 default costumes.
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
3. Switch between `👑 Default Sets (224)` and `📂 Custom / Imported`.
4. Click `Pick from ST World` to import any of your existing SillyTavern lorebooks!
