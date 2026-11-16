/**
 * Party Wardrobe Manager (PWM) v1.4.1 for SillyTavern / TauriTavern
 * Multi-Character RPG Outfit & Attire Manager
 * Features:
 * - Default Language English ('en') with Persistent User Preferences
 * - Full Thai Translations for Names and Descriptions of All 112 Default Outfits
 * - Split Imported Lorebooks into Dedicated Shelves (Never Lumping into One File)
 * - Native SillyTavern World Info Integration (Pick & Sync Directly from ST Lorebooks)
 * - Deep OLED Midnight Palette (Eye-Friendly for Night Roleplay)
 * - Full Mobile & Touchscreen Responsiveness (1-column adaptive grid)
 * - AI-Powered Chat Attire Scanner (via dynamic QuietPrompt)
 * - Multi-Character Persistent Attire Injection (Anti-Amnesia Sheet at Depth 2)
 * Author: Antigravity
 */

const EXTENSION_KEY = 'party_wardrobe_manager';
const STORAGE_KEY = 'PWM_party_wardrobes_v1';
const IMPORTED_BOOKS_KEY = 'PWM_imported_books_v2';
const OLD_CUSTOM_KEY = 'PWM_custom_outfits_v1';
const LANG_STORAGE_KEY = 'PWM_lang_v2';

let cachedQuietPrompt = null;
async function getQuietPromptFn() {
    if (typeof cachedQuietPrompt === 'function') return cachedQuietPrompt;

    // 1. Try SillyTavern global context
    const ctx = getSillyContext();
    if (typeof ctx?.generateQuietPrompt === 'function') {
        cachedQuietPrompt = ctx.generateQuietPrompt;
        return cachedQuietPrompt;
    }

    // 2. Try window global
    if (typeof window.generateQuietPrompt === 'function') {
        cachedQuietPrompt = window.generateQuietPrompt;
        return cachedQuietPrompt;
    }

    // 3. Dynamic import from SillyTavern root script.js (../../../../script.js)
    try {
        const mod = await import('../../../../script.js');
        if (typeof mod?.generateQuietPrompt === 'function') {
            cachedQuietPrompt = mod.generateQuietPrompt;
            return cachedQuietPrompt;
        }
    } catch (e) {
        // Fallback silently if not available
    }

    return null;
}

const EMBEDDED_CATALOG = [
  {
    "id": "Costume_School_Swimsuit",
    "name": "School Swimsuit",
    "th_name": "ชุดว่ายน้ำโรงเรียน",
    "category": "Specialty Sets",
    "desc": "A tight navy blue school swimsuit with a white fabric name tag stitched over the chest. Features a scooped neckline, high-cut leg openings, and stretchy nylon-spandex that hugs every curve with sleek athletic tension. (Adult cosplay styling).",
    "th_desc": "ชุดว่ายน้ำโรงเรียนสีน้ำเงินเข้มรัดรูป ปักป้ายชื่อผ้าสีขาวบริเวณหน้าอก คอเสื้อทรงเว้าลึก ขอบขาเว้าสูง เนื้อผ้าไนลอนสแปนเด็กซ์ยืดกระชับเน้นสัดส่วนทุกส่วนโค้งเว้าอย่างแนบแน่น สไตล์คอสเพลย์ผู้ใหญ่",
    "source": "default",
    "keys": [
      "school swimsuit",
      "navy school swimsuit",
      "sukumizu"
    ]
  },
  {
    "id": "Costume_Heart_Cutout_Suit",
    "name": "Heart Cutout Suit",
    "th_name": "ชุดลาเท็กซ์หัวใจ",
    "category": "Specialty Sets",
    "desc": "A skintight pink latex bodysuit featuring precision heart-shaped peek-a-boo windows cut over the bust and lower pelvis, framing bare skin against high-gloss bubblegum rubber.",
    "th_desc": "ชุดบอดี้สูทลาเท็กซ์สีชมพูรัดรูปแนบเนื้อ โดดเด่นด้วยช่องเจาะรูปหัวใจเปิดเผยผิวเนื้อบริเวณหน้าอกและเชิงกรานด้านล่าง ขับเน้นผิวสัมผัสเรียบเนียนตัดกับยางลาเท็กซ์มันวาวสีชมพูสดใส",
    "source": "default",
    "keys": [
      "heart cutout suit",
      "pink latex heart suit",
      "ชุดลาเท็กซ์หัวใจ"
    ]
  },
  {
    "id": "Costume_Glossy_Leotard",
    "name": "Glossy Leotard",
    "th_name": "เลโอตาร์ดมันเงา",
    "category": "Specialty Sets",
    "desc": "A high-shine metallic leotard with ultra-high hip cuts and a heart-shaped opening cut out at the lower pelvic gusset, emphasizing the curve of the hips and legs.",
    "th_desc": "ชุดเลโอตาร์ดเมทัลลิกเนื้อมันวาว ขอบสะโพกเว้าสูงเป็นพิเศษ พร้อมช่องเปิดรูปหัวใจบริเวณเป้าด้านล่าง เน้นส่วนเว้าส่วนโค้งของสะโพกและเรียวขาอย่างชัดเจน",
    "source": "default",
    "keys": [
      "glossy leotard",
      "high-shine leotard",
      "เลโอตาร์ดมันเงา"
    ]
  },
  {
    "id": "Costume_Heart_Cutout_Bunny_Suit",
    "name": "Heart Cutout Bunny Suit",
    "th_name": "ชุดบันนี่เปิดหัวใจ",
    "category": "Specialty Sets",
    "desc": "A glossy satin bunny suit with boned side panels, featuring open heart cutouts directly over the breasts and pelvic line. Paired with bunny ears, white cuffs, and a fluffy tail.",
    "th_desc": "ชุดบันนี่สูทผ้าซาตินมันเงาเสริมโครงด้านข้าง มีช่องเจาะรูปหัวใจเปิดโล่งตรงบริเวณหน้าอกและแนวเชิงกราน มาพร้อมที่คาดผมหูกระต่าย ปลอกข้อมือสีขาว และหางปุกปุย",
    "source": "default",
    "keys": [
      "heart cutout bunny suit",
      "satin heart bunny suit",
      "ชุดบันนี่เปิดหัวใจ"
    ]
  },
  {
    "id": "Costume_Heart_Latex_Maid",
    "name": "Heart Latex Maid",
    "th_name": "ชุดเมดลาเท็กซ์",
    "category": "Specialty Sets",
    "desc": "A provocative black latex maid minidress with an open chest cutout exposing the cleavage, adorned with frilled white latex trim, a mini apron, and matching ruffled headpiece.",
    "th_desc": "มินิเดรสเมดผ้าลาเท็กซ์สีดำสุดเย้ายวน เว้าหน้าอกเปิดกว้างอวดเนินอก ประดับด้วยระบายขอบลาเท็กซ์สีขาว ผ้ากันเปื้อนผืนจิ๋ว และที่คาดผมระบายเข้าชุด",
    "source": "default",
    "keys": [
      "heart latex maid",
      "latex maid dress",
      "ชุดเมดลาเท็กซ์"
    ]
  },
  {
    "id": "Costume_Heart_Latex_Habit",
    "name": "Heart Latex Habit",
    "th_name": "ชุดแม่ชีลาเท็กซ์",
    "category": "Specialty Sets",
    "desc": "A deep purple latex nun habit with the front cut wide open to the navel and the fitted skirt slit high past the thigh, contrasting ecclesiastical veiling with daring skin exposure.",
    "th_desc": "ชุดแม่ชีผ้าลาเท็กซ์สีม่วงเข้ม ผ่าหน้าอกกว้างลึกยาวลงมาถึงสะดือ ชายกระโปรงเข้ารูปผ่าข้างสูงเหนือต้นขา ผสมผสานผ้าคลุมศีรษะแบบดั้งเดิมเข้ากับดีไซน์เปิดเผยผิวสุดเย้ายวน",
    "source": "default",
    "keys": [
      "heart latex habit",
      "purple latex nun",
      "ชุดแม่ชีลาเท็กซ์"
    ]
  },
  {
    "id": "Costume_Heart_Nurse_Dress",
    "name": "Heart Nurse Dress",
    "th_name": "ชุดพยาบาลลาเท็กซ์",
    "category": "Specialty Sets",
    "desc": "A form-fitting pink latex nurse dress unzipped down past the sternum to the navel, featuring red cross accents and a high-cut hemline.",
    "th_desc": "ชุดพยาบาลผ้าลาเท็กซ์สีชมพูเข้ารูป รูดซิปเปิดยาวลงมาผ่านแนวกระดูกอกจนถึงสะดือ ตกแต่งด้วยตรากากบาทสีแดงและชายกระโปรงสั้นเว้าสูง",
    "source": "default",
    "keys": [
      "heart nurse dress",
      "pink latex nurse",
      "ชุดพยาบาลลาเท็กซ์"
    ]
  },
  {
    "id": "Costume_Exposed_Harem_Miko",
    "name": "Exposed Harem Miko",
    "th_name": "ชุดมิโกะผ้าบาง",
    "category": "Specialty Sets",
    "desc": "A shrine maiden ensemble where traditional red hakama are replaced by sheer white harem silks that billow around the legs, paired with an open-shoulder white miko top.",
    "th_desc": "ชุดมิโกะประยุกต์ เปลี่ยนกางเกงฮากามะสีแดงเป็นผ้าไหมบางพลิ้วไหวรอบเรียวขา จับคู่กับเสื้อคลุมมิโกะสีขาวเปิดไหล่ เผยเสน่ห์อันน่าหลงใหล",
    "source": "default",
    "keys": [
      "exposed harem miko",
      "sheer miko",
      "ชุดมิโกะผ้าบาง"
    ]
  },
  {
    "id": "Costume_Gold_Belly_Dancer_Set",
    "name": "Gold Belly Dancer Set",
    "th_name": "ชุดระบำหน้าท้อง",
    "category": "Specialty Sets",
    "desc": "A gilded dancer set featuring a structured gold coin bra and a matching coin-fringed hip belt over sheer, flowing gauzy trousers that chime softly with every hip sway.",
    "th_desc": "ชุดระบำหน้าท้องสีทองอร่าม ประกอบด้วยบราคล้องคอประดับเหรียญทองระยิบระยับ ปลอกแขนเข้าชุด และกระโปรงผ้าไหมซีทรูผ่าข้างพร้อมสายโซ่สะโพกที่จะส่งเสียงดังกริ๋งตามจังหวะก้าวเดิน",
    "source": "default",
    "keys": [
      "gold belly dancer set",
      "coin bra belly dancer",
      "ชุดระบำหน้าท้อง"
    ]
  },
  {
    "id": "Costume_Bridal_Lace",
    "name": "Bridal Lace",
    "th_name": "ชุดเจ้าสาวลูกไม้",
    "category": "Specialty Sets",
    "desc": "Sheer white floral lace bridal lingerie featuring delicate heart-shaped openings framing the bust, worn beneath a translucent, trailing white lace wedding veil.",
    "th_desc": "ชุดบอดี้สูทผ้าลูกไม้สีขาวโปร่งแสงสไตล์ชุดเจ้าสาว ลวดลายดอกไม้อันประณีตทาบบนหน้าอก สะโพกเปิดโล่ง มาพร้อมผ้าคลุมลูกไม้ยาวทอดตัวด้านหลังอย่างอ่อนช้อย",
    "source": "default",
    "keys": [
      "bridal lace",
      "bridal lingerie set",
      "ชุดเจ้าสาวลูกไม้"
    ]
  },
  {
    "id": "Costume_Violet_Heart_Catsuit",
    "name": "Violet Heart Catsuit",
    "th_name": "ชุดแคทสูทสีม่วง",
    "category": "Specialty Sets",
    "desc": "A second-skin violet latex catsuit extending from throat to ankle, punctuated by open heart-shaped cutouts over the chest and pelvis.",
    "th_desc": "ชุดแคทสูทผ้าลาเท็กซ์สีม่วงรัดรูปแนบสนิท เจาะช่องเปิดรูปหัวใจบริเวณหน้าอกและสะโพกด้านหลัง เสริมเส้นขอบคอนทัวร์สีดำมันเงาเน้นทรวดทรง",
    "source": "default",
    "keys": [
      "violet heart catsuit",
      "purple heart catsuit",
      "ชุดแคทสูทสีม่วง"
    ]
  },
  {
    "id": "Costume_Sheer_Heart_Negligee",
    "name": "Sheer Heart Negligee",
    "th_name": "ชุดนอนไม่ได้นอนผ้าบาง",
    "category": "Specialty Sets",
    "desc": "A whisper-thin translucent negligee worn over heart-shaped pasties and a matching heart-back thong, trailing gossamer fabric that shifts with movement.",
    "th_desc": "ชุดนอนเนกลิเจผ้าบางสีแดงชาด ปักลายหัวใจตลอดแนวอก ผูกด้วยริบบิ้นเปิดโล่งด้านหน้า อวดสิ่งที่สวมใส่ไว้ข้างในอย่างชัดเจน",
    "source": "default",
    "keys": [
      "sheer heart negligee",
      "translucent negligee",
      "ชุดนอนไม่ได้นอนผ้าบาง"
    ]
  },
  {
    "id": "Costume_Purple_Heart_Trim_Swimsuit",
    "name": "Purple Heart Trim Swimsuit",
    "th_name": "ชุดว่ายน้ำลาเท็กซ์ม่วง",
    "category": "Specialty Sets",
    "desc": "A glossy purple latex racing swimsuit featuring heart-scalloped trim along the ultra-high leg cuts and back scoop, contouring the torso with sleek compression.",
    "th_desc": "ชุดว่ายน้ำโมโนกินีสีม่วงเว้าขาสูง หัวเข็มขัดรูปหัวใจสีทองเชื่อมต่อสายคล้องคอ ผ่าหน้าลึกเลยสะดือด้วยคัตติ้งทรงนาฬิกาทรายสุดเย้ายวน",
    "source": "default",
    "keys": [
      "purple heart-trim swimsuit",
      "latex racing swimsuit",
      "ชุดว่ายน้ำลาเท็กซ์ม่วง"
    ]
  },
  {
    "id": "Costume_Red_Gold_Heart_Cup_Leotard",
    "name": "Red Gold Heart Cup Leotard",
    "th_name": "เลโอตาร์ดหัวใจทอง",
    "category": "Specialty Sets",
    "desc": "A crimson latex leotard featuring two oversized metallic gold heart-shaped cups supporting the bust and a polished gold heart motif centered at the groin.",
    "th_desc": "ชุดเลโอตาร์ดสีแดงสดมันเงา คัพรูปหัวใจสีทองเมทัลลิกโอบอุ้มทรวงอก ด้านหลังเว้าลึกเป็นพิเศษพร้อมขอบสะโพกเว้าสูงเพรียวบาง",
    "source": "default",
    "keys": [
      "red and gold heart-cup leotard",
      "gold heart leotard",
      "เลโอตาร์ดหัวใจทอง"
    ]
  },
  {
    "id": "Costume_Purple_Officer_Latex_Uniform",
    "name": "Purple Officer Latex Uniform",
    "th_name": "ชุดผู้กองลาเท็กซ์",
    "category": "Specialty Sets",
    "desc": "A structured purple military-style officer's peaked cap and cropped jacket worn over an ultra-skintight purple latex bodysuit cut completely away at the hips.",
    "th_desc": "ชุดยูนิฟอร์มนายทหารผ้าลาเท็กซ์สีม่วงเข้ม ชายกระโปรงสั้นเต่อเหนือต้นขา ประดับอินทรธนูสีเงิน กระดุมทองเหลือง และคอเสื้อผ่าลึกเปิดเผยช่วงอกอย่างท้าทาย",
    "source": "default",
    "keys": [
      "purple officer latex uniform",
      "latex officer",
      "ชุดผู้กองลาเท็กซ์"
    ]
  },
  {
    "id": "Costume_Yellow_Backless_Leotard",
    "name": "Yellow Backless Leotard",
    "th_name": "เลโอตาร์ดสีเหลืองเปิดหลัง",
    "category": "Specialty Sets",
    "desc": "A vibrant high-gloss yellow latex leotard with sleek full-length sleeves and a dramatic scooped back that plunges unobstructed down to the tailbone.",
    "th_desc": "ชุดเลโอตาร์ดสแปนเด็กซ์สีเหลืองสด ด้านหลังเปิดโล่งเว้าลึกไปจนถึงก้นกบ ขอบขาเว้าสูง เนื้อผ้ารัดกระชับเน้นความคมชัดของสัดส่วนและกล้ามเนื้อ",
    "source": "default",
    "keys": [
      "yellow backless leotard",
      "yellow latex leotard",
      "เลโอตาร์ดสีเหลืองเปิดหลัง"
    ]
  },
  {
    "id": "Costume_Black_Latex_Bunny_Suit",
    "name": "Black Latex Bunny Suit",
    "th_name": "ชุดบันนี่ลาเท็กซ์ดำ",
    "category": "Specialty Sets",
    "desc": "A classic jet-black latex bunny leotard with liquid sheen, paired with tall glossy ears, a white satin bow tie collar, and a fluffy white pompom tail.",
    "th_desc": "ชุดบันนี่คอร์เซ็ตผ้าลาเท็กซ์สีดำขลับมันเงา คัพเสริมโครงดันทรง เอวคอดกิ่ว มาพร้อมที่คาดผมหูกระต่ายและปลอกข้อมือลาเท็กซ์สีดำเข้าชุด",
    "source": "default",
    "keys": [
      "black latex bunny suit",
      "latex bunny",
      "ชุดบันนี่ลาเท็กซ์ดำ"
    ]
  },
  {
    "id": "Costume_Heart_Pasty_Bunny_Set",
    "name": "Heart Pasty Bunny Set",
    "th_name": "เซ็ตบันนี่พาสตี้",
    "category": "Specialty Sets",
    "desc": "A minimalist set consisting of red heart pasties, bunny ears, a bow tie collar, a matching pelvic heart patch, and glossy thigh-high latex stiletto boots.",
    "th_desc": "เซ็ตบันนี่สุดท้าทาย ประกอบด้วยที่ปิดจุกรูปหัวใจผ้าซาติน กางเกงในทองพร้อมหางกระต่ายฟูฟ่อง หูกระต่ายลูกไม้ และถุงน่องบางเบา",
    "source": "default",
    "keys": [
      "heart pasty bunny set",
      "pasty bunny",
      "เซ็ตบันนี่พาสตี้"
    ]
  },
  {
    "id": "Costume_Sheer_Halter_Pink_Shorts",
    "name": "Sheer Halter Pink Shorts",
    "th_name": "เสื้อคล้องคอบางกับกางเกงชมพู",
    "category": "Specialty Sets",
    "desc": "A translucent, soaked-looking white halter top tied at the nape, leaving skin clearly visible beneath, paired with tiny low-rise pink hot shorts.",
    "th_desc": "เสื้อคล้องคอผ้าชีฟองสีขาวบางซีทรู จับคู่กับกางเกงขาสั้นดอลฟินสแปนเด็กซ์สีชมพูฮอตพิงค์ตัวจิ๋ว รัดแนบกระชับบั้นท้าย",
    "source": "default",
    "keys": [
      "sheer halter and pink shorts",
      "sheer halter top",
      "เสื้อคล้องคอบางกับกางเกงชมพู"
    ]
  },
  {
    "id": "Costume_Horned_Gold_Heart_Latex_Set",
    "name": "Horned Gold Heart Latex Set",
    "th_name": "เซ็ตปีศาจหัวใจทอง",
    "category": "Specialty Sets",
    "desc": "Curved metallic gold demon horns paired with polished gold heart nipple cups, completed by bright yellow latex opera gloves and matching thigh-high latex stockings.",
    "th_desc": "ชุดจอมปีศาจสาวผ้าลาเท็กซ์สีแดงเลือดหมูสลับทอง โดดเด่นด้วยบราท็อปเจาะช่องหัวใจ มินิสเกิร์ต ปลอกแขนลวดลายทอง และเครื่องประดับเขาสัตว์ปีศาจ",
    "source": "default",
    "keys": [
      "horned gold heart latex set",
      "gold heart horns",
      "เซ็ตปีศาจหัวใจทอง"
    ]
  },
  {
    "id": "Costume_Pink_Leopard_Micro_Bikini",
    "name": "Pink Leopard Micro Bikini",
    "th_name": "ไมโครบิกินี่ลายเสือดาว",
    "category": "Specialty Sets",
    "desc": "A tiny triangle micro-bikini in wild pink leopard print, fastened by whisper-thin side ties and paired with plush cat ears and hot pink fishnet stockings.",
    "th_desc": "ไมโครบิกินี่ตัวจิ๋วลายเสือดาวสีชมพูสด สายผูกเส้นเล็กจิ๋วเปิดเผยผิวพรรณบริเวณลำตัวและสะโพกเกือบทั้งหมด",
    "source": "default",
    "keys": [
      "pink leopard micro bikini",
      "leopard micro bikini",
      "ไมโครบิกินี่ลายเสือดาว"
    ]
  },
  {
    "id": "Costume_Pink_Heart_Succubus_Suit",
    "name": "Pink Heart Succubus Suit",
    "th_name": "ชุดซัคคิวบัสชมพู",
    "category": "Specialty Sets",
    "desc": "A baby pink latex demoness bodysuit with molded heart-shaped cups over the bust, an open heart-shaped pelvic window, and sleek wing harness accents.",
    "th_desc": "ชุดบอดี้สูทซัคคิวบัสหนังเทียมสีชมพูพาสเทล เจาะช่องหน้าอกรูปหัวใจ ด้านหลังมีปีกค้างคาวจิ๋ว และสายหางประดับปลายรูปหัวใจสุดยั่วยวน",
    "source": "default",
    "keys": [
      "pink heart succubus suit",
      "succubus latex",
      "ชุดซัคคิวบัสชมพู"
    ]
  },
  {
    "id": "Costume_White_Heart_Nurse_Apron",
    "name": "White Heart Nurse Apron",
    "th_name": "เอี๊ยมพยาบาลหัวใจ",
    "category": "Specialty Sets",
    "desc": "A sheer white halter apron dress featuring heart-shaped bust panels and medical red cross accents, paired with a nurse cap and semi-sheer white thigh-highs.",
    "th_desc": "ผ้ากันเปื้อนพยาบาลสีขาวสะอาดตา สวมทับชั้นในผ้าตาข่ายโปร่งบาง ตกแต่งด้วยกระดุมรูปหัวใจสีแดงและหมวกพยาบาลเข้าชุด",
    "source": "default",
    "keys": [
      "white heart nurse apron",
      "nurse apron halter",
      "เอี๊ยมพยาบาลหัวใจ"
    ]
  },
  {
    "id": "Costume_Purple_Fishnet_Nun_Harness",
    "name": "Purple Fishnet Nun Harness",
    "th_name": "ฮาร์เนสแม่ชีตาข่าย",
    "category": "Specialty Sets",
    "desc": "A flowing purple clerical veil framing the head, worn over a hot pink fishnet X-harness that crosses the torso to cup and lift the exposed chest.",
    "th_desc": "ชุดแม่ชีแนวโกธิคสุดดุดัน ผสมผสานผ้าคลุมศีรษะสีม่วงเข้ากับสายฮาร์เนสหนังสีดำรัดรอบตัวและชุดชั้นในตาข่ายซีทรู",
    "source": "default",
    "keys": [
      "purple fishnet nun harness",
      "nun fishnet harness",
      "ฮาร์เนสแม่ชีตาข่าย"
    ]
  },
  {
    "id": "Costume_Sheer_Heart_Clamp_Babydoll",
    "name": "Sheer Heart Clamp Babydoll",
    "th_name": "เบบี้ดอลล์ติดคลิปหัวใจ",
    "category": "Specialty Sets",
    "desc": "A diaphanous, translucent white babydoll slip connected to a black O-ring choker, cinched and pulled at the lower hem by a polished silver heart clamp.",
    "th_desc": "ชุดนอนเบบี้ดอลล์สีดำโปร่งแสง ชายระบายลูกไม้อ่อนหวาน ประดับหัวเข็มขัดรูปหัวใจตกแต่งช่วงคอเสื้อ ไม่บดบังทรวดทรงเรือนร่างภายใน",
    "source": "default",
    "keys": [
      "sheer heart-clamp babydoll",
      "heart clamp babydoll",
      "เบบี้ดอลล์ติดคลิปหัวใจ"
    ]
  },
  {
    "id": "Top_Crop_Top",
    "name": "Crop Top",
    "th_name": "เสื้อครอป",
    "category": "Tops",
    "desc": "A snug cotton crop top riding up above the navel, hugging the bust and exposing the smooth contours of the midriff.",
    "th_desc": "เสื้อครอปผ้ายืดคอตตอนเข้ารูป ชายเสื้อสั้นเหนือสะดือ อวดหน้าท้องแบนราบและเอวคอดเพรียวบาง",
    "source": "default",
    "keys": [
      "crop top",
      "cotton crop top",
      "เสื้อครอป"
    ]
  },
  {
    "id": "Top_Tube_Top",
    "name": "Tube Top",
    "th_name": "เกาะอก",
    "category": "Tops",
    "desc": "A strapless elastic tube top stretched tight across the chest, leaving the shoulders, collarbones, and upper back bare.",
    "th_desc": "เสื้อเกาะอกผ้ายืดไร้สาย แนบกระชับรอบทรวงอก อวดช่วงไหล่ เนินอก และแผ่นหลังอย่างเปิดเผย",
    "source": "default",
    "keys": [
      "tube top",
      "strapless tube top",
      "เกาะอก"
    ]
  },
  {
    "id": "Top_Knit_Sweater",
    "name": "Knit Sweater",
    "th_name": "เสื้อไหมพรม",
    "category": "Tops",
    "desc": "A soft knit sweater hanging loose around the torso, with a relaxed ribbed collar and gentle wool drape.",
    "th_desc": "เสื้อสเวตเตอร์ไหมพรมถักเนื้อนุ่ม คอกลมหรือคอเต่า อบอุ่น สวมใส่สบาย ให้สัมผัสผ่อนคลาย",
    "source": "default",
    "keys": [
      "knit sweater",
      "soft knit sweater",
      "เสื้อไหมพรม"
    ]
  },
  {
    "id": "Top_Oversized_Sweater",
    "name": "Oversized Sweater",
    "th_name": "เสื้อสเวตเตอร์ตัวใหญ่",
    "category": "Tops",
    "desc": "An oversized slouchy knit sweater slipping casually off one shoulder, pooling loosely around the wrists and thighs.",
    "th_desc": "เสื้อสเวตเตอร์ไหมพรมตัวโคร่งทรงหลวม ชายเสื้อยาวคลุมสะโพก คอเสื้อกว้างเลื่อนหลุดไหล่อวดผิวเนียนสวย",
    "source": "default",
    "keys": [
      "oversized sweater",
      "off-shoulder sweater",
      "เสื้อสเวตเตอร์ตัวใหญ่"
    ]
  },
  {
    "id": "Top_Halter_Top",
    "name": "Halter Top",
    "th_name": "เสื้อคล้องคอ",
    "category": "Tops",
    "desc": "A fitted halter top tied securely behind the neck with thin cords, revealing the shoulder blades and upper back.",
    "th_desc": "เสื้อท็อปสายคล้องคอเปิดหลัง เว้าลึกตั้งแต่ต้นคอจนถึงเอว ให้ความรู้สึกโปร่งสบายและเซ็กซี่",
    "source": "default",
    "keys": [
      "halter top",
      "tied halter",
      "เสื้อคล้องคอ"
    ]
  },
  {
    "id": "Top_Bustier",
    "name": "Bustier",
    "th_name": "เสื้อบูสติเยร์",
    "category": "Tops",
    "desc": "A structured, boned bustier top that uplifts the bust, sculpts the ribcage, and fastens with hook-and-eye closures.",
    "th_desc": "เสื้อบุสติเยร์เสริมโครงดันทรง ยกกระชับหน้าอกและรัดช่วงเอวให้เป็นทรงนาฬิกาทรายอย่างเย้ายวน",
    "source": "default",
    "keys": [
      "bustier",
      "boned bustier",
      "เสื้อบูสติเยร์"
    ]
  },
  {
    "id": "Top_Laced_Corset",
    "name": "Laced Corset",
    "th_name": "คอร์เซ็ท",
    "category": "Tops",
    "desc": "A traditional steel-boned corset tightly laced up the back with satin ribbon, dramatically accentuating the waistline.",
    "th_desc": "เสื้อคอร์เซ็ตโครงเหล็กร้อยเชือกด้านหลัง ปรับระดับความกระชับคอดกิ่วของเอวและเสริมเนินอกให้เด่นชัด",
    "source": "default",
    "keys": [
      "laced corset",
      "corset top",
      "คอร์เซ็ท"
    ]
  },
  {
    "id": "Top_Knotted_Shirt",
    "name": "Knotted Shirt",
    "th_name": "เสื้อผูกเอว",
    "category": "Tops",
    "desc": "A casual button-up shirt tied into a tight knot at the hem, parting over the midriff and navel.",
    "th_desc": "เสื้อเชิ้ตติดกระดุมที่ชายเสื้อถูกมัดปมไว้เหนือสะดือ ปลดกระดุมบนเผยเนินอกในลุคสบายๆ แต่เปี่ยมเสน่ห์",
    "source": "default",
    "keys": [
      "knotted shirt",
      "tied shirt",
      "เสื้อผูกเอว"
    ]
  },
  {
    "id": "Top_Hoodie",
    "name": "Hoodie",
    "th_name": "เสื้อฮู้ด",
    "category": "Tops",
    "desc": "A soft, baggy hooded sweatshirt with extra-long sleeves falling past the knuckles, creating a casual, cozy silhouette.",
    "th_desc": "เสื้อฮู้ดดี้ผ้าฟลีซเนื้อนุ่ม มีกระเป๋าจิงโจ้ด้านหน้าและหมวกคลุมศีรษะ ให้ลุคสตรีทแวร์สุดเท่และน่ารัก",
    "source": "default",
    "keys": [
      "baggy hoodie",
      "oversized hoodie",
      "เสื้อฮู้ด"
    ]
  },
  {
    "id": "Top_Tank_Top",
    "name": "Tank Top",
    "th_name": "เสื้อกล้าม",
    "category": "Tops",
    "desc": "A thin ribbed cotton tank top with scooped neckline and armholes, contouring closely to the torso.",
    "th_desc": "เสื้อกล้ามผ้าคอตตอนเนื้อนุ่มไร้แขน คอกลมหรือคอวีเว้าลึก สวมใส่สบายและกระชับสัดส่วน",
    "source": "default",
    "keys": [
      "tank top",
      "ribbed tank top",
      "เสื้อกล้าม"
    ]
  },
  {
    "id": "Top_Naked_Apron",
    "name": "Naked Apron",
    "th_name": "เอี๊ยมเปลือย",
    "category": "Tops",
    "desc": "A single cotton kitchen apron tied around the neck and waist, worn directly over bare skin with nothing underneath, exposing the back, hips, and side contours.",
    "th_desc": "ผ้ากันเปื้อนทำครัวผืนเดี่ยวที่สวมใส่โดยปราศจากเสื้อผ้าชิ้นอื่นข้างใน เปิดแผ่นหลังและสะโพกเปลือยเปล่าอย่างเย้ายวน",
    "source": "default",
    "keys": [
      "apron, nothing under it",
      "naked apron",
      "kitchen apron bare"
    ]
  },
  {
    "id": "Top_Competition_Swimsuit",
    "name": "Competition Swimsuit",
    "th_name": "ชุดว่ายน้ำนักกีฬา",
    "category": "Tops",
    "desc": "A sleek, hydrodynamic athletic competition swimsuit cut high up the hip, designed for maximum body compression and flexibility.",
    "th_desc": "ชุดว่ายน้ำนักกีฬาสำหรับการแข่งขัน คอเว้าลึก ขอบขาเว้าสูง เนื้อผ้าแนบสนิทไปกับผิวเพื่อประสิทธิภาพทางกายภาพ",
    "source": "default",
    "keys": [
      "competition swimsuit",
      "racing swimsuit",
      "ชุดว่ายน้ำนักกีฬา"
    ]
  },
  {
    "id": "Top_Bikini",
    "name": "Bikini",
    "th_name": "บิกินี่",
    "category": "Tops",
    "desc": "A classic two-piece triangle bikini top tied by delicate strings around the neck and ribs, leaving the midriff completely bare.",
    "th_desc": "ท็อปบิกินี่แบบผูกเชือกหรือบราคัพสองชิ้น ดีไซน์คลาสสิกสำหรับชายหาดและสระว่ายน้ำ",
    "source": "default",
    "keys": [
      "bikini",
      "triangle bikini",
      "บิกินี่"
    ]
  },
  {
    "id": "Top_Chest_Sarashi",
    "name": "Chest Sarashi",
    "th_name": "ผ้าพันอก",
    "category": "Tops",
    "desc": "Bands of traditional bleached white cotton sarashi cloth wound tightly around the chest, binding and flattening the bust with martial discipline.",
    "th_desc": "ผ้าซาราชิสีขาวพันรัดรอบหน้าอกอย่างแน่นหนา ให้ลุคนักสู้หญิงโบราณหรือซามูไรหญิงที่ทั้งแข็งแกร่งและดึงดูดสายตา",
    "source": "default",
    "keys": [
      "chest sarashi",
      "sarashi wraps",
      "ผ้าพันอก"
    ]
  },
  {
    "id": "Top_Bra_Panties",
    "name": "Bra Panties",
    "th_name": "ชุดชั้นใน",
    "category": "Tops",
    "desc": "A delicate matching lingerie set consisting of a supportive wired lace bra and low-rise panties, framing the torso with feminine elegance.",
    "th_desc": "ชุดชั้นในบราและกางเกงในผ้าซาตินหรือลูกไม้ ดีไซน์เรียบหรูที่เน้นความงามตามธรรมชาติของสรีระ",
    "source": "default",
    "keys": [
      "bra panties",
      "matching lingerie set",
      "ชุดชั้นใน"
    ]
  },
  {
    "id": "Bottom_Denim_Cutoffs",
    "name": "Denim Cutoffs",
    "th_name": "กางเกงยีนส์ขาสั้น",
    "category": "Bottoms",
    "desc": "Frayed denim shorts cut high up the thigh with distressed edges and exposed pocket lining, hugging the hips firmly.",
    "th_desc": "กางเกงยีนส์ขาสั้นตัดขอบรุ่ย สั้นเสมอแนวสะโพก อวดเรียวขายาวและบั้นท้ายโค้งเว้าในลุคแคชชวลสุดฮอต",
    "source": "default",
    "keys": [
      "denim cutoffs",
      "frayed denim shorts",
      "กางเกงยีนส์ขาสั้น"
    ]
  },
  {
    "id": "Bottom_Pleated_Skirt",
    "name": "Pleated Skirt",
    "th_name": "กระโปรงพลีท",
    "category": "Bottoms",
    "desc": "A short, flared pleated skirt that flutters and sways with every step, lifting slightly as she turns.",
    "th_desc": "กระโปรงจีบรอบตัวสไตล์เทนนิสหรือคอสเพลย์ ชายกระโปรงพลิ้วไหวตามจังหวะก้าวเดินอย่างสดใส",
    "source": "default",
    "keys": [
      "pleated skirt",
      "tennis skirt",
      "กระโปรงพลีท"
    ]
  },
  {
    "id": "Bottom_Pencil_Skirt",
    "name": "Pencil Skirt",
    "th_name": "กระโปรงทรงสอบ",
    "category": "Bottoms",
    "desc": "A high-waisted, form-fitting pencil skirt tailored closely to the curves of the hips and thighs, restricting stride to an elegant sway.",
    "th_desc": "กระโปรงทรงดินสอรัดรูปยาวระดับเข่า ผ่าหลังเล็กน้อย เน้นเส้นสายสะโพกผายและทรวดทรงมืออาชีพ",
    "source": "default",
    "keys": [
      "pencil skirt",
      "tight pencil skirt",
      "กระโปรงทรงสอบ"
    ]
  },
  {
    "id": "Bottom_Micro_Skirt",
    "name": "Micro Skirt",
    "th_name": "กระโปรงสั้นพิเศษ",
    "category": "Bottoms",
    "desc": "An ultra-short micro skirt barely covering the hips and buttocks, exposing almost the entirety of the legs.",
    "th_desc": "กระโปรงไมโครมินิสเกิร์ตตัวสั้นจิ๋ว ชายกระโปรงยาวเพียงระดับสะโพกบน เผยเรียวขาทั้งหมดอย่างท้าทาย",
    "source": "default",
    "keys": [
      "micro skirt",
      "ultra mini skirt",
      "กระโปรงสั้นพิเศษ"
    ]
  },
  {
    "id": "Bottom_Leather_Pants",
    "name": "Leather Pants",
    "th_name": "กางเกงหนังรัดรูป",
    "category": "Bottoms",
    "desc": "Skin-tight black leather trousers with a glossy sheen, molding to the legs and hips like a tailored second skin.",
    "th_desc": "กางเกงหนังแท้หรือหนังเทียมสีดำรัดรูปแนบเนื้อ เน้นความกระชับของเรียวขาและบั้นท้ายด้วยประกายเงางาม",
    "source": "default",
    "keys": [
      "leather pants",
      "tight leather pants",
      "กางเกงหนังรัดรูป"
    ]
  },
  {
    "id": "Bottom_Yoga_Leggings",
    "name": "Yoga Leggings",
    "th_name": "กางเกงโยคะ",
    "category": "Bottoms",
    "desc": "Thin, elastic yoga leggings stretched taut over the hips, thighs, and calves, showcasing muscle tone and shape with flawless smoothness.",
    "th_desc": "กางเกงเลกกิ้งโยคะเอวสูงผ้ายืดสแปนเด็กซ์ รัดกระชับสรีระทุกมัดกล้ามเนื้ออย่างแนบเนียน",
    "source": "default",
    "keys": [
      "yoga leggings",
      "spandex leggings",
      "กางเกงโยคะ"
    ]
  },
  {
    "id": "Bottom_Cargo_Pants",
    "name": "Cargo Pants",
    "th_name": "กางเกงคาร์โก้",
    "category": "Bottoms",
    "desc": "Loose, utilitarian cargo pants with oversized bellow pockets, sitting low on the hips with a relaxed streetwear drape.",
    "th_desc": "กางเกงคาร์โก้ทรงหลวมกระเป๋าข้างรอบตัว สไตล์แทคติคอลสตรีทที่สวมใส่สบายและคล่องตัว",
    "source": "default",
    "keys": [
      "cargo pants",
      "baggy cargo pants",
      "กางเกงคาร์โก้"
    ]
  },
  {
    "id": "Bottom_Ruffled_Bloomers",
    "name": "Ruffled Bloomers",
    "th_name": "กางเกงฟักทองลูกไม้",
    "category": "Bottoms",
    "desc": "Puffy, vintage-style ruffled bloomers with gathered elastic hems around the upper thighs, layered with soft lace trims.",
    "th_desc": "กางเกงบลูมเมอร์สประดับระบายลูกไม้ ชายขาสม็อคยางยืดนุ่มนวล ให้ความรู้สึกน่ารักปนเซ็กซี่สไตล์วิคตอเรียน",
    "source": "default",
    "keys": [
      "ruffled bloomers",
      "lace bloomers",
      "กางเกงฟักทองลูกไม้"
    ]
  },
  {
    "id": "Bottom_Fundoshi",
    "name": "Fundoshi",
    "th_name": "ฟุนโดชิ",
    "category": "Bottoms",
    "desc": "A traditional Japanese loincloth of white linen wound around the waist and between the legs, tied securely at the hip.",
    "th_desc": "ผ้าเตี่ยวฟุนโดชิสไตล์ญี่ปุ่นโบราณ แถบผ้าสีขาวผูกรัดกระชับเป้าและสะโพก เผยเรียวขาและแก้มก้นอย่างเปิดเผย",
    "source": "default",
    "keys": [
      "fundoshi",
      "traditional loincloth",
      "ฟุนโดชิ"
    ]
  },
  {
    "id": "Bottom_Thong",
    "name": "Thong",
    "th_name": "กางเกงในทอง",
    "category": "Bottoms",
    "desc": "A minimalist thong with high-cut side straps resting on the hip bones, featuring a narrow rear cord that leaves the buttocks uncovered.",
    "th_desc": "กางเกงในทรงทอง ด้านหลังเป็นแถบผ้าเส้นแคบเว้าสูง ไม่ทิ้งรอยขอบกางเกงในและอวดบั้นท้ายเต็มตา",
    "source": "default",
    "keys": [
      "thong",
      "thin thong",
      "กางเกงในทอง"
    ]
  },
  {
    "id": "Bottom_G_String",
    "name": "G String",
    "th_name": "จีสตริง",
    "category": "Bottoms",
    "desc": "A barely-there G-string featuring delicate elastic cords connecting minimal fabric triangles, pulled taut over the hip bones.",
    "th_desc": "กางเกงในจีสตริงที่สายด้านหลังเป็นเพียงเส้นด้ายบางเบา ปกปิดเฉพาะจุดสำคัญด้านหน้าอย่างประหยัดเนื้อผ้าที่สุด",
    "source": "default",
    "keys": [
      "g-string",
      "g string cord",
      "จีสตริง"
    ]
  },
  {
    "id": "Bottom_Hot_Pants",
    "name": "Hot Pants",
    "th_name": "กางเกงขาสั้นรัดรูป",
    "category": "Bottoms",
    "desc": "Snug, short shorts cut aggressively high up the thigh and gluteal fold, emphasizing leg length and hip curves.",
    "th_desc": "กางเกงฮอตแพนต์ขาสั้นกุดเอวต่ำ รัดกระชับบั้นท้ายและต้นขาอย่างโดดเด่น",
    "source": "default",
    "keys": [
      "hot pants",
      "tight hot pants",
      "กางเกงขาสั้นรัดรูป"
    ]
  },
  {
    "id": "Dress_Slip_Dress",
    "name": "Slip Dress",
    "th_name": "ชุดเดรสสายเดี่ยว",
    "category": "Dresses",
    "desc": "A thin satin slip dress clinging to the hips, featuring delicate spaghetti straps and a bias-cut hemline.",
    "th_desc": "เดรสผ้าไหมซาตินสายเดี่ยวเส้นสปาเก็ตตี้ ทิ้งตัวพริ้วไหวแนบไปตามสัดส่วนของเรือนร่างอย่างนุ่มนวล",
    "source": "default",
    "keys": [
      "slip dress",
      "satin slip dress",
      "ชุดเดรสสายเดี่ยว"
    ]
  },
  {
    "id": "Dress_Sundress",
    "name": "Sundress",
    "th_name": "ชุดซันเดรส",
    "category": "Dresses",
    "desc": "A light cotton sundress with thin straps, a fitted bodice, and a breezy skirt that catches the wind.",
    "th_desc": "เดรสฤดูร้อนผ้าฝ้ายลายดอกไม้สดใส คอเสื้อกว้างและกระโปรงบานพลิ้วไหวรับสายลม",
    "source": "default",
    "keys": [
      "sundress",
      "cotton sundress",
      "ชุดซันเดรส"
    ]
  },
  {
    "id": "Dress_Cocktail_Dress",
    "name": "Cocktail Dress",
    "th_name": "ชุดค็อกเทลเดรส",
    "category": "Dresses",
    "desc": "A form-fitted evening cocktail dress tailored to sculpt the silhouette with sleek elegance.",
    "th_desc": "ชุดค็อกเทลเดรสเข้ารูปสำหรับงานราตรี คัตติ้งประณีตขับเน้นความสง่างามและความหรูหรา",
    "source": "default",
    "keys": [
      "cocktail dress",
      "fitted cocktail dress",
      "ชุดค็อกเทลเดรส"
    ]
  },
  {
    "id": "Dress_Silk_Cheongsam",
    "name": "Silk Cheongsam",
    "th_name": "กี่เพ้า",
    "category": "Dresses",
    "desc": "A fitted silk cheongsam (qipao) featuring a Mandarin collar, ornate frog closures, and a deep side slit rising to the hip.",
    "th_desc": "ชุดกี่เพ้าผ้าไหมคอจีนเข้ารูป ผ่าข้างกระโปรงสูงอวดเรียวขาขาวเนียนยามก้าวเดิน",
    "source": "default",
    "keys": [
      "silk cheongsam",
      "fitted qipao",
      "กี่เพ้า"
    ]
  },
  {
    "id": "Dress_Yukata",
    "name": "Yukata",
    "th_name": "ยูกาตะ",
    "category": "Dresses",
    "desc": "A light cotton summer yukata loosely bound by an obi sash, draping gracefully over the shoulders and ankles.",
    "th_desc": "ชุดยูกาตะผ้าฝ้ายญี่ปุ่น ลายดอกไม้หรือคลื่นน้ำ ผูกกระชับด้วยสายโอบิที่เอว สวมใส่สบายในเทศกาลฤดูร้อน",
    "source": "default",
    "keys": [
      "yukata",
      "cotton yukata",
      "ยูกาตะ"
    ]
  },
  {
    "id": "Dress_Maid_Dress",
    "name": "Maid Dress",
    "th_name": "ชุดเมด",
    "category": "Dresses",
    "desc": "A classic short maid dress with puffed sleeves, a fitted bodice, and a ruffled white lace apron tied at the back with a large bow.",
    "th_desc": "ชุดเมดคอสเพลย์คลาสสิก สีดำตัดขาวพร้อมผ้ากันเปื้อนลูกไม้และที่คาดผมระบาย ให้เสน่ห์สาวรับใช้ผู้เชื่อฟัง",
    "source": "default",
    "keys": [
      "maid dress",
      "classic maid dress",
      "ชุดเมด"
    ]
  },
  {
    "id": "Dress_Nurse_Dress",
    "name": "Nurse Dress",
    "th_name": "ชุดพยาบาล",
    "category": "Dresses",
    "desc": "A tight white nurse uniform dress buttoned down the front, featuring a crisp lapel collar and a short hemline.",
    "th_desc": "ชุดพยาบาลมินิเดรสสีขาวหรือชมพูอ่อน คอปกประดับตรากาชาด ชายกระโปรงสั้นเต่อเน้นความน่ารักสดใส",
    "source": "default",
    "keys": [
      "nurse dress",
      "white nurse dress",
      "ชุดพยาบาล"
    ]
  },
  {
    "id": "Dress_Latex_Minidress",
    "name": "Latex Minidress",
    "th_name": "มินิเดรสลาเท็กซ์",
    "category": "Dresses",
    "desc": "A glossy, form-fitting latex minidress that reflects every highlight with liquid shine, hugging the torso down to mid-thigh.",
    "th_desc": "มินิเดรสผ้าลาเท็กซ์รัดรูปสะท้อนแสงเงาวาว แนบชิดทุกส่วนสัดของร่างกายอย่างไร้รอยย่น",
    "source": "default",
    "keys": [
      "latex minidress",
      "glossy latex dress",
      "มินิเดรสลาเท็กซ์"
    ]
  },
  {
    "id": "Dress_Wrap_Dress",
    "name": "Wrap Dress",
    "th_name": "แร็ปเดรส",
    "category": "Dresses",
    "desc": "A soft jersey wrap dress tied at the waist with a fabric belt, forming a plunging V-neckline and an overlapping front skirt.",
    "th_desc": "เดรสป้ายผูกเอวผ้าเจอร์ซีย์ คอวีป้ายลึกปรับระดับได้ตามความต้องการ ขับเน้นทรวดทรงเพรียวระหง",
    "source": "default",
    "keys": [
      "wrap dress",
      "v-neck wrap dress",
      "แร็ปเดรส"
    ]
  },
  {
    "id": "Dress_Babydoll_Dress",
    "name": "Babydoll Dress",
    "th_name": "เบบี้ดอลล์เดรส",
    "category": "Dresses",
    "desc": "A short, empire-waist babydoll dress with floaty, gathered layers that flare out loosely from below the bust.",
    "th_desc": "ชุดมินิเดรสเบบี้ดอลล์ทรงเอ เอวสูงตัดใต้อก ปล่อยชายบานพลิ้วบางเบา ให้ลุคไร้เดียงสาแต่แฝงความเซ็กซี่",
    "source": "default",
    "keys": [
      "babydoll dress",
      "floaty babydoll",
      "เบบี้ดอลล์เดรส"
    ]
  },
  {
    "id": "Dress_Baby_Doll_Negligee",
    "name": "Baby Doll Negligee",
    "th_name": "ชุดนอนเบบี้ดอลล์",
    "category": "Dresses",
    "desc": "A diaphanous, sheer lace and chiffon babydoll negligee that drapes weightlessly over the contours of the body.",
    "th_desc": "ชุดนอนเนกลิเจเบบี้ดอลล์ผ้าชีฟองซีทรูโปร่งแสง สายเดี่ยวผูกโบว์ เผยให้เห็นสรีระด้านในอย่างเลือนราง",
    "source": "default",
    "keys": [
      "baby doll negligee",
      "sheer babydoll negligee",
      "ชุดนอนเบบี้ดอลล์"
    ]
  },
  {
    "id": "Fullbody_Leotard",
    "name": "Leotard",
    "th_name": "เลโอตาร์ด",
    "category": "Full Body",
    "desc": "A tight athletic or dance leotard cutting high over the hips, providing sleek, seamless torso coverage.",
    "th_desc": "ชุดเลโอตาร์ดยิมนาสติกผ้ายืดสแปนเด็กซ์คลุมลำตัว เว้าขาสูงเพื่ออิสระในการเคลื่อนไหวของเรียวขา",
    "source": "default",
    "keys": [
      "leotard",
      "tight leotard",
      "เลโอตาร์ด"
    ]
  },
  {
    "id": "Fullbody_Bodysuit",
    "name": "Bodysuit",
    "th_name": "บอดี้สูท",
    "category": "Full Body",
    "desc": "A stretch fabric bodysuit contouring the torso and snapping closed at the base, pairing seamlessly under garments or worn solo.",
    "th_desc": "ชุดบอดี้สูทเข้ารูปคลุมตั้งแต่ไหล่จรดสะโพก รัดกระชับแบนราบแนบสนิทไปกับผิวกาย",
    "source": "default",
    "keys": [
      "bodysuit",
      "stretch bodysuit",
      "บอดี้สูท"
    ]
  },
  {
    "id": "Fullbody_Catsuit",
    "name": "Catsuit",
    "th_name": "แคทสูท",
    "category": "Full Body",
    "desc": "A continuous, skintight catsuit enclosing the body from the high neckline down to the ankles, tracing every curve.",
    "th_desc": "ชุดแคทสูทขายาวแขนยาวรัดรูปแนบเนื้อ คลุมตั้งแต่ลำคอจรดข้อเท้า เน้นโครงร่างสัดส่วนทุกมุมมอง",
    "source": "default",
    "keys": [
      "catsuit",
      "full catsuit",
      "แคทสูท"
    ]
  },
  {
    "id": "Fullbody_Plugsuit",
    "name": "Plugsuit",
    "th_name": "ปลั๊กสูท",
    "category": "Full Body",
    "desc": "A high-tech paneled pilot plugsuit sealed airtight against the body, featuring reinforced synthetic plates and interface ports.",
    "th_desc": "ชุดปลั๊กสูทนักบินหุ่นยนต์แนวไซไฟ ตกแต่งด้วยลวดลายทางกลศาสตร์และแผงเกราะยางสังเคราะห์เสริมส่วนโค้งเว้า",
    "source": "default",
    "keys": [
      "plugsuit",
      "scifi plugsuit",
      "ปลั๊กสูท"
    ]
  },
  {
    "id": "Fullbody_White_Plugsuit",
    "name": "White Plugsuit",
    "th_name": "ปลั๊กสูทสีขาว",
    "category": "Full Body",
    "desc": "A sleek white pilot plugsuit with dark charcoal seams and pressure-sealed joints contouring precisely to feminine curves.",
    "th_desc": "ชุดปลั๊กสูทสีขาวประกายมุก ดีไซน์ไซไฟฟิวเจอร์ริสติกพร้อมแถบตัดเส้นสายสีแดงและดำสุดคลาสสิก",
    "source": "default",
    "keys": [
      "white plugsuit",
      "white pilot suit",
      "ปลั๊กสูทสีขาว"
    ]
  },
  {
    "id": "Fullbody_Latex_Bodysuit",
    "name": "Latex Bodysuit",
    "th_name": "บอดี้สูทลาเท็กซ์",
    "category": "Full Body",
    "desc": "A seamless latex bodysuit that appears poured directly over the body, shimmering with high-gloss liquid reflections.",
    "th_desc": "ชุดบอดี้สูทผ้าลาเท็กซ์สีดำสนิทขัดเงาวาว แนบแน่นเป็นเนื้อเดียวกับผิวหนังราวกับชั้นผิวที่สอง",
    "source": "default",
    "keys": [
      "latex bodysuit",
      "rubber bodysuit",
      "บอดี้สูทลาเท็กซ์"
    ]
  },
  {
    "id": "Fullbody_Teddy",
    "name": "Teddy",
    "th_name": "เท็ดดี้ลูกไม้",
    "category": "Full Body",
    "desc": "A sheer floral lace teddy lingerie piece cut high on the hip with delicate scalloped edges and plunging neckline.",
    "th_desc": "ชุดชั้นในเท็ดดี้ชิ้นเดียวผ้าลูกไม้ซีทรู ผูกสายคล้องคอและเว้าสะโพกสูง อวดเรือนร่างอย่างมีระดับ",
    "source": "default",
    "keys": [
      "teddy",
      "lace teddy",
      "เท็ดดี้ลูกไม้"
    ]
  },
  {
    "id": "Legwear_Thigh_High_Stockings",
    "name": "Thigh High Stockings",
    "th_name": "ถุงน่องเหนือเข่า",
    "category": "Legwear",
    "desc": "Sheer nylon thigh-high stockings finished with wide silicone-backed lace bands resting snugly at mid-thigh.",
    "th_desc": "ถุงน่องยาวเหนือเข่า ขอบแถบยางยืดกระชับต้นขา สร้างช่องว่าง 'Zettai Ryouiki' สุดดึงดูดสายตา",
    "source": "default",
    "keys": [
      "thigh-high stockings",
      "stay-up stockings",
      "ถุงน่องเหนือเข่า"
    ]
  },
  {
    "id": "Legwear_Fishnet_Stockings",
    "name": "Fishnet Stockings",
    "th_name": "ถุงน่องตาข่าย",
    "category": "Legwear",
    "desc": "Diamond-mesh fishnet stockings hugging the legs from toe to waist, framing skin through geometric open weave.",
    "th_desc": "ถุงน่องตาข่ายสีดำ ลวดลายตารางเรขาคณิตที่เน้นมิติความโค้งมนของเรียวขาอย่างเย้ายวน",
    "source": "default",
    "keys": [
      "fishnet stockings",
      "fishnets",
      "ถุงน่องตาข่าย"
    ]
  },
  {
    "id": "Legwear_Sheer_Stockings",
    "name": "Sheer Stockings",
    "th_name": "ถุงน่องบาง",
    "category": "Legwear",
    "desc": "Ultra-fine translucent sheer stockings that impart a silky, uniform glow and smooth tactile finish to the legs.",
    "th_desc": "ถุงน่องผ้าไนลอนบางใสโปร่งแสง เนื้อเนียนละเอียดขับผิวเรียวขาให้ดูนวลเนียนและไร้ที่ติ",
    "source": "default",
    "keys": [
      "sheer stockings",
      "pantyhose",
      "ถุงน่องบาง"
    ]
  },
  {
    "id": "Legwear_Garter_Belt",
    "name": "Garter Belt",
    "th_name": "สายรัดถุงน่อง",
    "category": "Legwear",
    "desc": "A satin and lace garter belt resting on the hips, featuring adjustable elastic suspender straps with metal clips.",
    "th_desc": "สายรัดถุงน่องการ์เตอร์เบลท์ผ้าลูกไม้รอบเอว พร้อมสายรั้งหนีบปลายถุงน่อง เติมเต็มเสน่ห์ชุดชั้นในอย่างสมบูรณ์แบบ",
    "source": "default",
    "keys": [
      "garter belt",
      "suspender belt",
      "สายรัดถุงน่อง"
    ]
  },
  {
    "id": "Legwear_Legwarmers",
    "name": "Legwarmers",
    "th_name": "ปลอกขาไหมพรม",
    "category": "Legwear",
    "desc": "Thick ribbed knit legwarmers slouched loosely around the calves and ankles, adding texture and warmth.",
    "th_desc": "ปลอกขาไหมพรมถักนุ่มฟู สวมไว้บริเวณข้อเท้าและน่อง ให้กลิ่นอายแฟชั่นสตรีทและนักเต้นยุค 90s",
    "source": "default",
    "keys": [
      "legwarmers",
      "knit legwarmers",
      "ปลอกขาไหมพรม"
    ]
  },
  {
    "id": "Legwear_Socks",
    "name": "Socks",
    "th_name": "ถุงเท้าผ้าฝ้าย",
    "category": "Legwear",
    "desc": "Classic soft cotton socks hugging the feet and ankles with clean, understated simplicity.",
    "th_desc": "ถุงเท้าข้อสั้นหรือข้อกลางผ้าคอตตอน สวมใส่สบายในชีวิตประจำวัน",
    "source": "default",
    "keys": [
      "cotton socks",
      "crew socks",
      "ถุงเท้าผ้าฝ้าย"
    ]
  },
  {
    "id": "Misc_Silk_Blouse",
    "name": "Silk Blouse",
    "th_name": "เสื้อเบลาส์ผ้าไหม",
    "category": "Miscellaneous",
    "desc": "A soft silk blouse with the top buttons undone and collar open, draping gently over the collarbones.",
    "th_desc": "เสื้อเบลาส์ผ้าไหมเนื้อบางเบา ทิ้งตัวนุ่มนวล ให้ความรู้สึกหรูหราสง่างามและสัมผัสสบายผิว",
    "source": "default",
    "keys": [
      "silk blouse",
      "unbuttoned blouse",
      "เสื้อเบลาส์ผ้าไหม"
    ]
  },
  {
    "id": "Misc_Camisole",
    "name": "Camisole",
    "th_name": "สายเดี่ยวผ้าซาติน",
    "category": "Miscellaneous",
    "desc": "A thin-strapped camisole slipping casually over the shoulders, cut from liquid silk with lace trim.",
    "th_desc": "เสื้อสายเดี่ยวผ้าคอตตอนหรือซาตินประดับขอบลูกไม้ สวมเป็นซับในหรือใส่เดี่ยวๆ สำหรับพักผ่อน",
    "source": "default",
    "keys": [
      "camisole",
      "silk camisole",
      "สายเดี่ยวผ้าซาติน"
    ]
  },
  {
    "id": "Misc_Bandeau",
    "name": "Bandeau",
    "th_name": "เกาะอกแถบแคบ",
    "category": "Miscellaneous",
    "desc": "A narrow strapless bandeau strip wrapped taut across the chest, leaving the shoulders and midriff bare.",
    "th_desc": "แถบผ้าพันหน้าอกไร้สาย ไร้โครงเหล็ก ให้สัมผัสสบายตัวและเผยช่วงไหล่อย่างอิสระ",
    "source": "default",
    "keys": [
      "bandeau",
      "elastic bandeau",
      "เกาะอกแถบแคบ"
    ]
  },
  {
    "id": "Misc_Team_Jersey",
    "name": "Team Jersey",
    "th_name": "เสื้อกีฬาตัวใหญ่",
    "category": "Miscellaneous",
    "desc": "A loose, oversized sports jersey hanging down like a casual minidress, falling loosely over the thighs.",
    "th_desc": "เสื้อเจอร์ซีย์นักกีฬาสกรีนหมายเลขและชื่อทีม ทรงหลวมเล็กน้อย ให้ลุคสปอร์ตเกิร์ลสุดกระฉับกระเฉง",
    "source": "default",
    "keys": [
      "team jersey",
      "oversized sports jersey",
      "เสื้อกีฬาตัวใหญ่"
    ]
  },
  {
    "id": "Misc_Gym_Buruma",
    "name": "Gym Buruma",
    "th_name": "กางเกงบลูม่า",
    "category": "Miscellaneous",
    "desc": "Snug, retro elastic athletic bloomers cut high at the hip, contouring closely to the legs and waist. (Adult athletic cosplay styling).",
    "th_desc": "กางเกงวอร์มขาสั้นบุรุมะสไตล์ญี่ปุ่น ขอบยางยืดรัดกระชับสะโพกและต้นขา สไตล์ชุดพละย้อนยุค",
    "source": "default",
    "keys": [
      "gym buruma",
      "buruma shorts",
      "กางเกงบลูม่า"
    ]
  },
  {
    "id": "Misc_Hakama",
    "name": "Hakama",
    "th_name": "กางเกงฮากามะ",
    "category": "Miscellaneous",
    "desc": "A wide, flowing pleated Japanese hakama worn over a traditional kimono, cinched firmly at the waist with tied cords.",
    "th_desc": "กางเกงกระโปรงฮากามะแบบดั้งเดิมของญี่ปุ่น พับจีบประณีต สง่างาม สวมคู่กับกิโมโนหรือชุดฝึกดาบ",
    "source": "default",
    "keys": [
      "hakama",
      "pleated hakama",
      "กางเกงฮากามะ"
    ]
  },
  {
    "id": "Misc_Jeans",
    "name": "Jeans",
    "th_name": "กางเกงยีนส์ขายาว",
    "category": "Miscellaneous",
    "desc": "Worn-in denim jeans molded closely to the hips and thighs, featuring classic five-pocket styling and gentle fading.",
    "th_desc": "กางเกงยีนส์เดนิมคลาสสิก ทนทาน กระชับสัดส่วน แมตช์ได้กับทุกลุคในชีวิตประจำวัน",
    "source": "default",
    "keys": [
      "worn jeans",
      "denim jeans",
      "กางเกงยีนส์ขายาว"
    ]
  },
  {
    "id": "Misc_Hanfu",
    "name": "Hanfu",
    "th_name": "ชุดฮั่นฝู",
    "category": "Miscellaneous",
    "desc": "A traditional layered hanfu ensemble with billowing wide sleeves, crossed lapels, and flowing silk sashes that trail with motion.",
    "th_desc": "ชุดฮั่นฝูผ้าไหมจีนโบราณ ชายแขนเสื้อกว้างและกระโปรงยาวพลิ้วไหวราวกับเทพธิดาในนิยายกำลังภายใน",
    "source": "default",
    "keys": [
      "hanfu",
      "flowing hanfu",
      "ชุดฮั่นฝู"
    ]
  },
  {
    "id": "Misc_Office_Suit",
    "name": "Office Suit",
    "th_name": "ชุดสูททำงาน",
    "category": "Miscellaneous",
    "desc": "A tailored professional blazer and form-fitting pencil skirt worn over sheer stockings, exuding authoritative polish.",
    "th_desc": "ชุดสูททำงานทางการสไตล์สาวออฟฟิศ เสื้อแจ็กเก็ตสูทเข้ารูปสวมทับเชิ้ตขาวและกระโปรงทรงสอบ",
    "source": "default",
    "keys": [
      "office suit",
      "business suit skirt",
      "ชุดสูททำงาน"
    ]
  },
  {
    "id": "Misc_School_Uniform",
    "name": "School Uniform",
    "th_name": "ชุดกะลาสี",
    "category": "Miscellaneous",
    "desc": "A classic sailor-collared uniform blouse with necktie and short pleated skirt, tailored with crisp pleats. (Adult cosplay styling).",
    "th_desc": "ชุดเครื่องแบบนักเรียนปกกะลาสี (เซเลอร์) หรือเบลเซอร์ ผูกโบว์ที่คอเสื้อ สไตล์คอสเพลย์วัยใส",
    "source": "default",
    "keys": [
      "school uniform",
      "sailor uniform",
      "ชุดกะลาสี"
    ]
  },
  {
    "id": "Misc_Gym_Kit",
    "name": "Gym Kit",
    "th_name": "ชุดออกกำลังกาย",
    "category": "Miscellaneous",
    "desc": "A cropped athletic shirt and form-fitting running shorts designed for workout mobility and breathable stretch.",
    "th_desc": "ชุดพละเสื้อยืดคอกลมสีขาวจับคู่กับกางเกงขาสั้นผ้ายืด สวมใส่สบายสำหรับการออกกำลังกาย",
    "source": "default",
    "keys": [
      "gym kit",
      "athletic gym shirt",
      "ชุดออกกำลังกาย"
    ]
  },
  {
    "id": "Misc_Tracksuit",
    "name": "Tracksuit",
    "th_name": "ชุดวอร์ม",
    "category": "Miscellaneous",
    "desc": "A sporty tracksuit jacket zipped halfway down over a bare chest, paired with matching side-striped track pants.",
    "th_desc": "ชุดวอร์มแทรคสูทผ้าร่มหรือกำมะหยี่ เสื้อแจ็กเก็ตมีซิปพร้อมกางเกงขายาวแถบข้างสไตล์สปอร์ต",
    "source": "default",
    "keys": [
      "tracksuit",
      "zipped tracksuit",
      "ชุดวอร์ม"
    ]
  },
  {
    "id": "Misc_Gym_Leotard",
    "name": "Gym Leotard",
    "th_name": "เลโอตาร์ดยิมนาสติก",
    "category": "Miscellaneous",
    "desc": "A compression athletic gymnastics leotard with racerback styling and high-cut leg openings, highlighting muscular tone.",
    "th_desc": "ชุดเลโอตาร์ดยิมนาสติกผ้าสแปนเด็กซ์สีทูโทน ยืดหยุ่นสูง รองรับทุกการเหยียดกายอย่างคล่องตัว",
    "source": "default",
    "keys": [
      "gym leotard",
      "athletic leotard",
      "เลโอตาร์ดยิมนาสติก"
    ]
  },
  {
    "id": "Misc_Heart_Pasties",
    "name": "Heart Pasties",
    "th_name": "พาสตี้หัวใจ",
    "category": "Miscellaneous",
    "desc": "Delicate self-adhesive heart-shaped pasties providing minimal coverage, worn with nothing else above the waist.",
    "th_desc": "แผ่นปิดจุกรูปหัวใจเนื้อซาติน ปิดเฉพาะยอดทรวงอกอย่างเรียบเนียน ท้าทายสายตาในลุคเบอร์เลสก์",
    "source": "default",
    "keys": [
      "heart pasties",
      "heart nipple pasties",
      "พาสตี้หัวใจ"
    ]
  },
  {
    "id": "Misc_Lingerie_Lace",
    "name": "Lingerie Lace",
    "th_name": "ชุดชั้นในลูกไม้ดำ",
    "category": "Miscellaneous",
    "desc": "A sheer black floral lace bra and matching high-cut briefs, pairing intricate scalloped borders with revealing transparency.",
    "th_desc": "ชุดชั้นในผ้าลูกไม้โปร่งบาง ลวดลายทอประณีตอ่อนหวาน อวดเสน่ห์แห่งสตรีเพศอย่างลึกซึ้ง",
    "source": "default",
    "keys": [
      "lingerie lace",
      "black lace bra brief",
      "ชุดชั้นในลูกไม้ดำ"
    ]
  },
  {
    "id": "Misc_Robe_Open",
    "name": "Robe Open",
    "th_name": "เสื้อคลุมผ้าไหมเปิดอก",
    "category": "Miscellaneous",
    "desc": "A luxurious silk dressing robe belted loosely once at the waist, parting open to reveal the body beneath as she walks.",
    "th_desc": "เสื้อคลุมผ้าซาตินผูกเอวที่ถูกปลดสายออก ปล่อยให้ชายเสื้อแหวกกว้างเผยให้เห็นสิ่งที่อยู่ภายใน",
    "source": "default",
    "keys": [
      "robe open",
      "silk robe open",
      "เสื้อคลุมผ้าไหมเปิดอก"
    ]
  },
  {
    "id": "State_Nude",
    "name": "Nude",
    "th_name": "เปลือยเปล่า",
    "category": "States & Situations",
    "desc": "Completely unclothed, skin exposed in natural, unadorned vulnerability.",
    "th_desc": "สภาพเปลือยเปล่าตามธรรมชาติ ไร้เสื้อผ้าอาภรณ์ใดๆ ปกปิด เผยเรือนร่างและผิวพรรณอย่างหมดจด",
    "source": "default",
    "keys": [
      "nude",
      "completely naked",
      "เปลือยเปล่า"
    ]
  },
  {
    "id": "State_Nude_Jewellery",
    "name": "Nude Jewellery",
    "th_name": "เปลือยใส่เครื่องประดับ",
    "category": "States & Situations",
    "desc": "Completely unclothed except for gleaming body jewelry, chains, necklaces, or rings resting directly against bare skin.",
    "th_desc": "เปลือยเปล่าทั้งร่างกาย มีเพียงเครื่องประดับระยิบระยับ เช่น สร้อยคอ โซ่คล้องเอว หรือกำไลทองประดับผิว",
    "source": "default",
    "keys": [
      "nude but for jewellery",
      "naked with jewelry",
      "เปลือยใส่เครื่องประดับ"
    ]
  },
  {
    "id": "State_Towel_Only",
    "name": "Towel Only",
    "th_name": "นุ่งผ้าเช็ดตัวผืนเดียว",
    "category": "States & Situations",
    "desc": "A single plush bath towel tucked securely above the chest, with damp hair clinging to neck and shoulders.",
    "th_desc": "นุ่งเพียงผ้าขนหนูผืนเดียวพันกระชับรอบหน้าอกหรือสะโพก ชายผ้าหมิ่นเหม่พร้อมจะหลุดได้ทุกเมื่อ",
    "source": "default",
    "keys": [
      "towel only",
      "bath towel knotted",
      "นุ่งผ้าเช็ดตัวผืนเดียว"
    ]
  },
  {
    "id": "State_Soaked_Clothes",
    "name": "Soaked Clothes",
    "th_name": "เสื้อผ้าเปียกโชก",
    "category": "States & Situations",
    "desc": "Garments completely drenched through with water, turning fabrics translucent and plastering them against every bodily contour.",
    "th_desc": "เสื้อผ้าเปียกโชกแนบสนิทไปกับผิวกายจนมองทะลุเห็นเนื้อผ้าโปร่งแสงและหยดน้ำเกาะพราว",
    "source": "default",
    "keys": [
      "soaked clothes",
      "wet clothes clinging",
      "เสื้อผ้าเปียกโชก"
    ]
  },
  {
    "id": "State_Half_Dressed",
    "name": "Half Dressed",
    "th_name": "แต่งตัวครึ่งๆ กลางๆ",
    "category": "States & Situations",
    "desc": "Caught mid-transformation or disrobing, with clothing unfastened, unzipped, or slipping down one side.",
    "th_desc": "สภาพเสื้อผ้าหลุดลุ่ยหรือสวมใส่เพียงครึ่งตัว กระดุมถูกปลดออก หรือสายเสื้อเลื่อนหลุดลงมาจากไหล่",
    "source": "default",
    "keys": [
      "half dressed",
      "garment hanging open",
      "แต่งตัวครึ่งๆ กลางๆ"
    ]
  },
  {
    "id": "State_Just_Woken",
    "name": "Just Woken",
    "th_name": "เพิ่งตื่นนอน",
    "category": "States & Situations",
    "desc": "Tousled morning bedhead, drowsy heavy-lidded gaze, warm flushed skin, and sleepwear rumpled from the sheets.",
    "th_desc": "สภาพเพิ่งตื่นนอน ผมเผ้ายุ่งเหยิงเล็กน้อย เสื้อผ้ายับย่น สวมชุดนอนหลวมโพรกด้วยท่าทางงัวเงียเปี่ยมเสน่ห์",
    "source": "default",
    "keys": [
      "just woken",
      "freshly awake",
      "เพิ่งตื่นนอน"
    ]
  },
  {
    "id": "State_Fresh_Shower",
    "name": "Fresh Shower",
    "th_name": "เพิ่งอาบน้ำเสร็จ",
    "category": "States & Situations",
    "desc": "Steaming skin dewed with tiny water droplets, clean fragrance of soap, flushed warmth, and damp hair.",
    "th_desc": "สภาพเพิ่งก้าวออกจากห้องอาบน้ำ ผิวกายชุ่มชื้นมีไอน้ำเกาะพราว กลิ่นสบู่หอมกรุ่น และผมเปียกหมาด",
    "source": "default",
    "keys": [
      "fresh from the shower",
      "post-shower damp",
      "เพิ่งอาบน้ำเสร็จ"
    ]
  },
  {
    "id": "Addon_Crotchless_Cut",
    "name": "Crotchless Cut",
    "th_name": "ผ่าเป้า",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: The pelvic gusset of the garment is cut completely away, leaving the intimate area fully accessible while retaining surrounding structure.",
    "th_desc": "ดีไซน์เปิดเป้า เว้าช่องว่างบริเวณเป้ากางเกงเพื่อความสะดวกสบายและเสน่ห์อันเร้าใจ",
    "source": "default",
    "keys": [
      "crotchless cut",
      "open gusset",
      "ผ่าเป้า"
    ]
  },
  {
    "id": "Addon_Open_Bust",
    "name": "Open Bust",
    "th_name": "เปิดอก",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: The chest or cups of the garment are cut out or eliminated, supporting and framing the bare bust from underneath.",
    "th_desc": "ดีไซน์คัตติ้งเปิดหน้าอก เว้าส่วนคัพออกเพื่อเผยยอดทรวงอกอย่างเปิดเผย",
    "source": "default",
    "keys": [
      "open bust",
      "cupless cut",
      "เปิดอก"
    ]
  },
  {
    "id": "Addon_Heart_Cutouts",
    "name": "Heart Cutouts",
    "th_name": "เว้าหัวใจ",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: Stylized heart-shaped windows precision-cut into the fabric, exposing bare skin in playful, seductive accents.",
    "th_desc": "เจาะช่องหน้าต่างรูปหัวใจบนเนื้อผ้าตามจุดสำคัญ เช่น เนินอก สะโพก หรือแผ่นหลัง",
    "source": "default",
    "keys": [
      "heart cutouts",
      "heart-shaped windows",
      "เว้าหัวใจ"
    ]
  },
  {
    "id": "Addon_Low_Back",
    "name": "Low Back",
    "th_name": "เว้าหลังลึก",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: The rear of the garment plunges dramatically down the spine, ending at the tailbone to display the entire back.",
    "th_desc": "ดีไซน์เว้าหลังลึกเป็นพิเศษ เปิดเปลือยแผ่นหลังเนียนสวยลงไปจนถึงช่วงเอวหรือก้นกบ",
    "source": "default",
    "keys": [
      "low back",
      "back scooped low",
      "เว้าหลังลึก"
    ]
  },
  {
    "id": "Addon_High_Slit",
    "name": "High Slit",
    "th_name": "ผ่าข้างสูง",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: The skirt or dress hem is slit deeply up along the outer thigh to the hip bone, parting widely with every stride.",
    "th_desc": "ผ่าข้างกระโปรงสูงเป็นพิเศษ อวดเรียวขาทั้งหมดอย่างชัดเจนในทุกย่างก้าว",
    "source": "default",
    "keys": [
      "high slit",
      "thigh-high slit",
      "ผ่าข้างสูง"
    ]
  },
  {
    "id": "Addon_Sheer",
    "name": "Sheer",
    "th_name": "ผ้าซีทรู",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: Constructed from ultra-fine, gossamer sheer netting, chiffon, or lace that allows the skin tone and silhouette to show through clearly.",
    "th_desc": "เนื้อผ้าบางเบาโปร่งแสง ซีทรู สามารถมองทะลุเห็นทรวดทรงและผิวพรรณภายในได้อย่างเลือนราง",
    "source": "default",
    "keys": [
      "sheer fabric",
      "translucent fabric",
      "ผ้าซีทรู"
    ]
  },
  {
    "id": "Addon_Loose_Fit",
    "name": "Loose Fit",
    "th_name": "ทรงหลวม",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: The garment drapes loosely and oversized, slipping off curves and creating casual, teasing glimpses.",
    "th_desc": "ทรงหลวมโคร่ง สวมใส่สบาย ชายเสื้อหรือคอเสื้อพร้อมเลื่อนหลุดอวดผิวเนียนยามขยับตัว",
    "source": "default",
    "keys": [
      "loose fit",
      "hanging loose",
      "ทรงหลวม"
    ]
  },
  {
    "id": "Addon_Glossy_Sheen",
    "name": "Glossy Sheen",
    "th_name": "ผิวมันเงา",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: Finished with a mirror-bright, high-gloss liquid coating that catches light with brilliant reflective highlights.",
    "th_desc": "เคลือบผิวเนื้อผ้าให้มันเงาวาวสะท้อนแสง เช่น ลาเท็กซ์ หนังแก้ว หรือซาตินมันขลับ",
    "source": "default",
    "keys": [
      "glossy sheen",
      "wet-look shine",
      "ผิวมันเงา"
    ]
  },
  {
    "id": "Addon_Jewellery",
    "name": "Jewellery",
    "th_name": "เครื่องประดับตามตัว",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: Layered with delicate metallic chains, gemstones, rings, or body jewelry that drape over bare skin.",
    "th_desc": "ประดับประดาด้วยอัญมณี สร้อยคอ กำไลข้อเท้า หรือโซ่ทองคำคล้องรอบเอวและสะโพก",
    "source": "default",
    "keys": [
      "jewellery accents",
      "body chains",
      "เครื่องประดับตามตัว"
    ]
  },
  {
    "id": "Addon_Goosebumps",
    "name": "Goosebumps",
    "th_name": "ขนลุก",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: The character's skin is peppered with delicate goosebumps from cool air or intense arousal, with heightened tactile sensitivity.",
    "th_desc": "ผิวหนังขึ้นตุ่มขนลุกเบาๆ จากสัมผัสลมหนาวหรือความตื่นเต้นเร้าใจ ยอดอกชูชันเด่นชัด",
    "source": "default",
    "keys": [
      "goosebumps",
      "chilled skin",
      "ขนลุก"
    ]
  },
  {
    "id": "Addon_High_Heels",
    "name": "High Heels",
    "th_name": "รองเท้าส้นสูง",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: Slender high stiletto heels that arch the foot, tauten the calves, and exaggerate the natural curve of the hips.",
    "th_desc": "รองเท้าส้นสูง เสริมท่วงท่าการเดินให้สง่างามและเน้นเรียวขาให้ดูเพรียวยาวโค้งมนยิ่งขึ้น",
    "source": "default",
    "keys": [
      "high heels",
      "stiletto heels",
      "รองเท้าส้นสูง"
    ]
  },
  {
    "id": "Addon_Collar",
    "name": "Collar",
    "th_name": "ปลอกคอ",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: A snug collar or choker fastened at the throat, made of leather, satin ribbon, or polished metal with a front ring.",
    "th_desc": "ปลอกคอหนังหรือซาตินรัดรอบลำคอ ประดับห่วงวงแหวนโลหะหรือกระดิ่งจิ๋วสุดเย้ายวน",
    "source": "default",
    "keys": [
      "collar at throat",
      "choker collar",
      "ปลอกคอ"
    ]
  },
  {
    "id": "Addon_Barefoot",
    "name": "Barefoot",
    "th_name": "เท้าเปล่า",
    "category": "Add-ons & Modifiers",
    "desc": "MODIFIER: Shoes and stockings removed, bare soles in direct contact with the floor, creating an intimate, grounded presence.",
    "th_desc": "เท้าเปลือยเปล่า นิ้วเท้าและฝ่าเท้าสัมผัสพื้นโดยตรง ให้ความรู้สึกธรรมชาติ ไร้สิ่งผูกมัด",
    "source": "default",
    "keys": [
      "barefoot",
      "bare feet",
      "เท้าเปล่า"
    ]
  }
];

const UI_STRINGS = {
    en: {
        title: 'Party Wardrobe & Costume Manager',
        targetChar: 'Target Character:',
        addChar: '+ Add Char',
        searchPlaceholder: 'Search outfits, latex, sheer...',
        pickFromST: 'Pick from ST World',
        pickFromSTDesc: 'Pick and import from existing SillyTavern World Info lorebooks',
        uploadJson: 'Upload JSON',
        uploadJsonDesc: 'Upload a custom lorebook .json file from your device',
        addOutfit: '+ Add Outfit',
        aiScan: 'AI Scan Chat',
        aiScanning: 'AI Scanning...',
        sourceAll: 'All Items',
        sourceDefault: '👑 Default Sets (112)',
        sourceImported: '📂 Custom / Imported',
        bookFilter: 'Lorebook Shelf',
        allBooks: 'All Imported Shelves',
        deleteBook: 'Delete Shelf',
        deleteBookConfirm: 'Are you sure you want to remove the lorebook shelf "{book}" and all its outfits?',
        stModalTitle: 'Select SillyTavern World Info Lorebook',
        stModalDesc: 'Choose an existing lorebook from your SillyTavern library to import as a dedicated wardrobe shelf:',
        noStBooks: 'No World Info books found in SillyTavern. Please create or import one in the World Info panel first.',
        importSuccess: 'Successfully imported {n} outfits from "{book}" into its own shelf!',
        alreadyImported: 'Already Imported',
        importBtn: 'Import to Shelf',
        reimportBtn: 'Re-sync Shelf',
        customAddedBook: 'RP Captured / Custom',
        applyChat: 'Apply to Chat Input',
        applyChatShort: 'Apply to Chat',
        saveParty: 'Save to Character Attire Sheet',
        savePartyShort: 'Save to Sheet',
        clearChar: 'Clear Attire',
        clearCharShort: 'Clear',
        noOutfit: 'No outfit selected',
        partySummary: 'Party Attire Sheet (Persistent Prompt Depth 2):',
        close: 'Close',
        catAll: 'All',
        catSpecialty: 'Specialty Sets',
        catTops: 'Tops',
        catBottoms: 'Bottoms',
        catDresses: 'Dresses',
        catFullbody: 'Fullbody Suits',
        catLegwear: 'Legwear',
        catDaywear: 'Daywear & Misc',
        catStates: 'States & Conditions',
        catAddons: 'Add-ons & Modifiers'
    },
    th: {
        title: 'ระบบตู้เสื้อผ้าและคอสตูมปาร์ตี้ (Wardrobe Manager)',
        targetChar: 'ตัวละครเป้าหมาย:',
        addChar: '+ เพิ่มตัวละคร',
        searchPlaceholder: 'ค้นหาชุด เช่น ลาเท็กซ์, บิกินี่, ลูกไม้...',
        pickFromST: 'เลือกจากสมุดเวิลด์ ST',
        pickFromSTDesc: 'เลือกนำเข้าชุดจากสมุด World Info ที่มีอยู่ใน SillyTavern',
        uploadJson: 'อัปโหลด JSON',
        uploadJsonDesc: 'นำเข้าไฟล์ Lorebook .json จากเครื่องของคุณ',
        addOutfit: '+ เพิ่มชุดใหม่',
        aiScan: 'AI สแกนชุดจากแชท',
        aiScanning: 'AI กำลังวิเคราะห์...',
        sourceAll: 'ทั้งหมด',
        sourceDefault: '👑 ชุดมาตรฐาน (112)',
        sourceImported: '📂 นำเข้า/แต่งเอง',
        bookFilter: 'ชั้นวางสมุดคอสตูม',
        allBooks: 'สมุดนำเข้าทั้งหมด',
        deleteBook: 'ลบชั้นวางนี้',
        deleteBookConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบชั้นวางสมุด "{book}" พร้อมชุดทั้งหมดในเล่มนี้?',
        stModalTitle: 'เลือกสมุด World Info จาก SillyTavern',
        stModalDesc: 'เลือกสมุด Lorebook ที่คุณมีอยู่ในระบบ SillyTavern เพื่อนำเข้าเป็นชั้นวางชุดเฉพาะเล่ม:',
        noStBooks: 'ไม่พบสมุด World Info ใน SillyTavern กรุณาสร้างหรืออิมพอร์ตในแท็บ World Info ก่อน',
        importSuccess: 'นำเข้า {n} ชุดจาก "{book}" เข้าสู่ชั้นวางแยกสำเร็จ!',
        alreadyImported: 'นำเข้าแล้ว',
        importBtn: 'นำเข้าสู่ตู้เสื้อผ้า',
        reimportBtn: 'ซิงค์ข้อมูลใหม่',
        customAddedBook: 'ชุดที่ AI สแกน / แต่งเอง',
        applyChat: 'ใส่ในช่องพิมพ์แชท',
        applyChatShort: 'ใส่ในแชท',
        saveParty: 'บันทึกเป็นชุดประจำตัวละคร',
        savePartyShort: 'บันทึกชุด',
        clearChar: 'ล้างชุดออก',
        clearCharShort: 'ล้างชุด',
        noOutfit: 'ยังไม่ได้เลือกชุด',
        partySummary: 'ตารางบันทึกชุดปาร์ตี้ (ฉีดเข้า Prompt อัตโนมัติที่ Depth 2):',
        close: 'ปิด',
        catAll: 'ทั้งหมด',
        catSpecialty: 'ชุดพิเศษ/คอสเพลย์',
        catTops: 'ท็อป/ท่อนบน',
        catBottoms: 'ท่อนล่าง/กระโปรง/กางเกง',
        catDresses: 'เดรส/กี่เพ้า/ยูกาตะ',
        catFullbody: 'บอดี้สูท/แคทสูท',
        catLegwear: 'ถุงน่อง/ถุงเท้า',
        catDaywear: 'ชุดลำลอง/ยูนิฟอร์ม',
        catStates: 'สถานะ/สภาพร่างกาย',
        catAddons: 'ส่วนเสริม/ดีไซน์ตกแต่ง'
    }
};

const state = {
    initialized: false,
    currentLang: 'en', // Default English, updated from storage in loadState()
    sourceFilter: 'default', // 'default' | 'imported' | 'all'
    activeBookFilter: 'all',  // 'all' | specific book name
    activeCategory: 'All',
    searchQuery: '',
    activeCharacter: '',
    characters: [],
    wardrobes: {},           // { [charName]: { main, top, bottom, legwear, modifiers: [] } }
    importedBooks: {},       // { [bookName]: [ items... ] } - Split shelves
    selectedMain: null,
    selectedTop: null,
    selectedBottom: null,
    selectedLegwear: null,
    selectedModifiers: new Set(),
    enableInjection: true,
};

function t(key, vars = {}) {
    const lang = state.currentLang === 'th' ? 'th' : 'en';
    let text = UI_STRINGS[lang]?.[key] || UI_STRINGS['en']?.[key] || key;
    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}

function getSillyContext() {
    if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
        return SillyTavern.getContext();
    }
    return null;
}

function loadState() {
    try {
        // Load persistent language preference (defaults to 'en')
        const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
        if (savedLang === 'th' || savedLang === 'en') {
            state.currentLang = savedLang;
        } else {
            state.currentLang = 'en';
        }

        // Load wardrobes
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.wardrobes) state.wardrobes = parsed.wardrobes;
            if (parsed.enableInjection !== undefined) state.enableInjection = parsed.enableInjection;
        }

        // Load split imported books
        const rawBooks = localStorage.getItem(IMPORTED_BOOKS_KEY);
        if (rawBooks) {
            state.importedBooks = JSON.parse(rawBooks) || {};
        } else {
            // Migration from v1 custom outfits
            const oldCustom = localStorage.getItem(OLD_CUSTOM_KEY);
            if (oldCustom) {
                try {
                    const list = JSON.parse(oldCustom);
                    if (Array.isArray(list) && list.length) {
                        state.importedBooks['Custom Archive'] = list.map(it => ({
                            ...it,
                            book: 'Custom Archive',
                            source: 'imported'
                        }));
                    }
                } catch {}
            }
        }
    } catch (e) {
        console.error('[Party Wardrobe Manager] Error loading state:', e);
    }
}

function saveState() {
    try {
        localStorage.setItem(LANG_STORAGE_KEY, state.currentLang);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            wardrobes: state.wardrobes,
            enableInjection: state.enableInjection,
            lang: state.currentLang
        }));
        localStorage.setItem(IMPORTED_BOOKS_KEY, JSON.stringify(state.importedBooks));
    } catch (e) {
        console.error('[Party Wardrobe Manager] Error saving state:', e);
    }
    updatePromptInjection();
}

function updatePromptInjection() {
    if (!state.enableInjection) return;
    const ctx = getSillyContext();
    if (!ctx || !ctx.setExtensionPrompt) return;

    const chars = Object.keys(state.wardrobes);
    if (!chars.length) {
        ctx.setExtensionPrompt(EXTENSION_KEY, '', 1, 2, false, 0);
        return;
    }

    const lines = [
        '[CURRENT PARTY ATTIRE & VISUAL APPEARANCE]',
        'Important: The characters are currently dressed in the following outfits. Adhere strictly to these clothing states in all descriptions and actions:'
    ];

    for (const char of chars) {
        const w = state.wardrobes[char];
        const pieces = [];
        if (w.main) pieces.push(w.main);
        if (w.top) pieces.push(w.top);
        if (w.bottom) pieces.push(w.bottom);
        if (w.legwear) pieces.push(w.legwear);
        if (w.modifiers && w.modifiers.length) pieces.push(...w.modifiers);

        if (pieces.length) {
            lines.push(`- ${char}: ${pieces.join(', ')}`);
        }
    }

    lines.push('[End Current Party Attire]');
    const promptText = lines.join('\n');
    ctx.setExtensionPrompt(EXTENSION_KEY, promptText, 1, 2, false, 0);
}

/**
 * Native SillyTavern World Info Integration
 * Queries available lorebook names from SillyTavern
 */
async function getAvailableTavernLorebooks() {
    const list = new Set();
    const ctx = getSillyContext();

    // Method 1: Context method
    try {
        if (typeof ctx?.getWorldInfoNames === 'function') {
            const names = ctx.getWorldInfoNames();
            if (Array.isArray(names)) names.forEach(n => n && list.add(n));
        }
    } catch {}

    // Method 2: Native UI select element in SillyTavern
    try {
        const select = document.getElementById('world_editor_select');
        if (select) {
            for (const opt of select.querySelectorAll('option')) {
                const val = opt.value || opt.textContent?.trim();
                if (val && val !== 'Select a World Info' && val !== 'None' && val !== '0') {
                    list.add(val);
                }
            }
        }
    } catch {}

    // Method 3: /api/worldinfo/list
    try {
        const headers = ctx?.getRequestHeaders ? ctx.getRequestHeaders() : { 'Content-Type': 'application/json' };
        const res = await fetch('/api/worldinfo/list', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...headers },
            body: JSON.stringify({})
        });
        if (res.ok) {
            const payload = await res.json();
            if (Array.isArray(payload)) {
                for (const item of payload) {
                    const name = typeof item === 'string' ? item : (item.name || item.file_id);
                    if (name) list.add(name);
                }
            }
        }
    } catch {}

    return Array.from(list);
}

async function fetchLorebookData(bookName) {
    const ctx = getSillyContext();
    const headers = ctx?.getRequestHeaders ? ctx.getRequestHeaders() : { 'Content-Type': 'application/json' };
    const res = await fetch('/api/worldinfo/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ name: bookName })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
}

function parseLorebookEntries(data, bookName) {
    const rawEntries = data?.entries || {};
    const entriesList = Array.isArray(rawEntries) ? rawEntries : Object.values(rawEntries);
    const results = [];

    for (const e of entriesList) {
        if (!e) continue;
        const name = (e.comment || e.name || '').trim();
        const content = (e.content || '').trim();
        const keys = Array.isArray(e.key) ? e.key : [];

        // Skip index entry (e.g. entry 0 with catalog list or command)
        if (name.toLowerCase().includes('index') || name.toLowerCase().includes('/costume') || content.includes('/costume')) {
            continue;
        }
        if (!name && !content) continue;

        let cat = 'Specialty Sets';
        if (content.includes('CATEGORY:')) {
            const match = content.match(/CATEGORY:\s*([^\n\]]+)/i);
            if (match) cat = match[1].trim();
        } else if (name.startsWith('Top_')) cat = 'Tops';
        else if (name.startsWith('Bottom_')) cat = 'Bottoms';
        else if (name.startsWith('Dress_')) cat = 'Dresses';
        else if (name.startsWith('Fullbody_')) cat = 'Fullbody Suits';
        else if (name.startsWith('Legwear_')) cat = 'Legwear';
        else if (name.startsWith('Misc_')) cat = 'Daywear & Misc';
        else if (name.startsWith('State_')) cat = 'States & Conditions';
        else if (name.startsWith('Addon_')) cat = 'Add-ons & Modifiers';

        let desc = content;
        if (content.includes('[ITEM SPECIFICATION & SILHOUETTE]\n')) {
            desc = content.split('[ITEM SPECIFICATION & SILHOUETTE]\n')[1].split('\n[')[0].trim();
        }

        // Clean display name
        const displayName = name.replace(/^(Costume_|Top_|Bottom_|Dress_|Fullbody_|Legwear_|Misc_|State_|Addon_)/i, '').replace(/_/g, ' ') || 'Unnamed Outfit';

        // Extract Thai name from keys if present
        const thKey = keys.find(k => /[\u0E00-\u0E7F]/.test(k)) || '';

        results.push({
            id: `Imported_${bookName}_${name || results.length}`,
            name: displayName,
            th_name: thKey || displayName,
            category: cat,
            desc: desc || displayName,
            th_desc: desc || displayName,
            source: 'imported',
            book: bookName,
            keys: keys.slice(0, 4)
        });
    }

    return results;
}

/**
 * Item List Aggregator (Strictly Separated Sources & Shelves)
 */
function getAllOutfitsList() {
    if (state.sourceFilter === 'default') {
        return [...EMBEDDED_CATALOG];
    }

    if (state.sourceFilter === 'imported') {
        if (state.activeBookFilter === 'all') {
            const list = [];
            for (const items of Object.values(state.importedBooks)) {
                list.push(...items);
            }
            return list;
        }
        return [...(state.importedBooks[state.activeBookFilter] || [])];
    }

    // Source Filter == 'all'
    const combined = [...EMBEDDED_CATALOG];
    if (state.activeBookFilter === 'all') {
        for (const items of Object.values(state.importedBooks)) {
            combined.push(...items);
        }
    } else if (state.importedBooks[state.activeBookFilter]) {
        combined.push(...state.importedBooks[state.activeBookFilter]);
    }
    return combined;
}

function detectCharacters() {
    const chars = new Set();
    const ctx = getSillyContext();

    if (ctx?.characterId !== undefined && ctx.characters && ctx.characters[ctx.characterId]) {
        const c = ctx.characters[ctx.characterId];
        const name = c.name || (typeof c === 'string' ? c : '');
        if (name) chars.add(name);
    }

    if (ctx?.name2) chars.add(ctx.name2);

    if (Array.isArray(ctx?.characters)) {
        for (const c of ctx.characters) {
            const name = c?.name || (typeof c === 'string' ? c : '');
            if (name) chars.add(name);
        }
    }

    if (Array.isArray(ctx?.chat)) {
        const recent = ctx.chat.slice(-30);
        for (const m of recent) {
            if (m.name && !m.is_user && m.name !== 'System' && m.name.length < 35) {
                chars.add(m.name);
            }
        }
    }

    for (const c of Object.keys(state.wardrobes)) {
        chars.add(c);
    }

    chars.delete('System');
    chars.delete('You');
    chars.delete('User');

    state.characters = Array.from(chars);
    if (!state.activeCharacter && state.characters.length > 0) {
        state.activeCharacter = state.characters[0];
    }
}

function loadCharacterAttireIntoSelection(charName) {
    state.selectedMain = null;
    state.selectedTop = null;
    state.selectedBottom = null;
    state.selectedLegwear = null;
    state.selectedModifiers.clear();

    const w = state.wardrobes[charName];
    if (w) {
        state.selectedMain = w.main || null;
        state.selectedTop = w.top || null;
        state.selectedBottom = w.bottom || null;
        state.selectedLegwear = w.legwear || null;
        if (w.modifiers && Array.isArray(w.modifiers)) {
            w.modifiers.forEach(m => state.selectedModifiers.add(m));
        }
    }
}

/**
 * Scan Recent Chat for Attire (Using Dynamic QuietPrompt)
 */
async function scanRecentChatForAttire() {
    const ctx = getSillyContext();
    if (!ctx || !Array.isArray(ctx.chat) || ctx.chat.length === 0) {
        alert(state.currentLang === 'th' ? 'ไม่มีข้อความแชทให้อ่าน' : 'No chat messages found to scan.');
        return;
    }

    const charName = state.activeCharacter || ctx.name2 || 'the character';
    const recentMessages = ctx.chat.slice(-8).map(m => `${m.name || (m.is_user ? 'User' : 'Character')}: ${m.mes || ''}`).join('\n\n');

    const scanBtn = document.getElementById('pwm-scan-chat-btn');
    if (scanBtn) {
        scanBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${t('aiScanning')}`;
        scanBtn.disabled = true;
    }

    try {
        let detectedAttire = '';

        const quietPromptFn = await getQuietPromptFn();
        if (typeof quietPromptFn === 'function') {
            const aiInstruction = `Task: Carefully analyze the following recent roleplay dialogue. Identify what ${charName} is currently wearing.
Extract all specific clothing items, fabrics, colors, states (e.g. wet, torn, unbuttoned), and accessories mentioned for ${charName}.
Respond with ONLY a concise, comma-separated list of the outfit pieces (maximum 15 words). Do not include any conversational filler, explanations, or quotes.
Example format: Black leather jacket, white lace bra, torn denim cutoffs, high heels

Recent roleplay messages:
${recentMessages}

${charName}'s exact current clothing:`;

            const rawAiResponse = await quietPromptFn(aiInstruction);
            if (rawAiResponse && typeof rawAiResponse === 'string') {
                detectedAttire = rawAiResponse.trim().replace(/^["'\[]+|["'\]]+$/g, '').trim();
            }
        }

        if (!detectedAttire) {
            const clothingRegex = /(?:wearing|wore|dressed in|dressed into|clad in|slips into|pulled on|changed into)\s+([^.,;\n]+)/gi;
            let match;
            const matches = [];
            while ((match = clothingRegex.exec(recentMessages)) !== null) {
                const phrase = match[1].trim();
                if (phrase.length > 3 && phrase.length < 90) matches.push(phrase);
            }
            if (matches.length) detectedAttire = matches[matches.length - 1];
        }

        if (!detectedAttire) {
            alert(state.currentLang === 'th' ? `AI ไม่พบการระบุเสื้อผ้าชัดเจนของ ${charName} ในแชทล่าสุด` : `The AI did not find any specific clothing described for ${charName} in recent messages.`);
            return;
        }

        const confirmMsg = state.currentLang === 'th' 
            ? `🤖 ผลการวิเคราะห์ชุดของ [${charName}] โดย AI:\n\n"${detectedAttire}"\n\nต้องการบันทึกชุดนี้เข้าสู่ชั้นวาง [${t('customAddedBook')}] และสวมใส่ให้ ${charName} หรือไม่?`
            : `🤖 AI detected attire for [${charName}]:\n\n"${detectedAttire}"\n\nWould you like to save this to the [${t('customAddedBook')}] shelf and equip it?`;

        if (confirm(confirmMsg)) {
            const shelfName = t('customAddedBook');
            if (!state.importedBooks[shelfName]) {
                state.importedBooks[shelfName] = [];
            }

            const newOutfit = {
                id: `RP_${Date.now()}`,
                name: detectedAttire,
                th_name: detectedAttire,
                category: 'Specialty Sets',
                desc: `Captured dynamically from roleplay dialogue: "${detectedAttire}"`,
                th_desc: `บันทึกชุดอัตโนมัติจากบทสนทนา Roleplay: "${detectedAttire}"`,
                source: 'imported',
                book: shelfName,
                keys: [detectedAttire.toLowerCase()]
            };

            state.importedBooks[shelfName].push(newOutfit);
            state.sourceFilter = 'imported';
            state.activeBookFilter = shelfName;
            state.selectedMain = detectedAttire;

            saveAttireToParty();
            renderModal();
        }
    } catch (err) {
        console.error('[PWM] Chat scan error:', err);
        alert('Scan error: ' + err.message);
    } finally {
        if (scanBtn) {
            scanBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${t('aiScan')}`;
            scanBtn.disabled = false;
        }
    }
}

/**
 * UI Rendering & Modal Construction
 */
function renderModal() {
    let backdrop = document.getElementById('pwm-modal-backdrop');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'pwm-modal-backdrop';
        backdrop.className = 'pwm-modal-backdrop';
        document.body.appendChild(backdrop);
    }

    detectCharacters();
    if (state.activeCharacter && !state.selectedMain && !state.selectedTop && !state.selectedBottom) {
        loadCharacterAttireIntoSelection(state.activeCharacter);
    }

    const categories = [
        { id: 'All', label: t('catAll') },
        { id: 'Specialty Sets', label: t('catSpecialty') },
        { id: 'Tops', label: t('catTops') },
        { id: 'Bottoms', label: t('catBottoms') },
        { id: 'Dresses', label: t('catDresses') },
        { id: 'Fullbody Suits', label: t('catFullbody') },
        { id: 'Legwear', label: t('catLegwear') },
        { id: 'Daywear & Misc', label: t('catDaywear') },
        { id: 'States & Conditions', label: t('catStates') },
        { id: 'Add-ons & Modifiers', label: t('catAddons') }
    ];

    const bookKeys = Object.keys(state.importedBooks);
    const totalCustomItems = Object.values(state.importedBooks).reduce((acc, list) => acc + (list?.length || 0), 0);

    backdrop.innerHTML = `
        <div class="pwm-modal">
            <!-- Header -->
            <div class="pwm-header">
                <div class="pwm-title">
                    <i class="fa-solid fa-shirt"></i>
                    <span class="pwm-title-text">${t('title')}</span>
                </div>
                <div class="pwm-header-actions">
                    <button type="button" class="pwm-btn pwm-btn-ai pwm-btn-xs" id="pwm-scan-chat-btn" title="Scan chat with AI to detect clothing">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> <span class="pwm-btn-text">${t('aiScan')}</span>
                    </button>
                    <select id="pwm-lang-select" class="pwm-lang-switch">
                        <option value="en" ${state.currentLang === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
                        <option value="th" ${state.currentLang === 'th' ? 'selected' : ''}>🇹🇭 ไทย</option>
                    </select>
                    <button type="button" class="pwm-close-btn" id="pwm-close-btn" title="${t('close')}">&times;</button>
                </div>
            </div>

            <!-- Source Filter Bar (Default 112 vs Imported Shelves) -->
            <div class="pwm-source-bar">
                <div class="pwm-source-switch">
                    <button type="button" class="pwm-source-btn ${state.sourceFilter === 'default' ? 'pwm-source-active' : ''}" data-source="default">
                        ${t('sourceDefault')}
                    </button>
                    <button type="button" class="pwm-source-btn ${state.sourceFilter === 'imported' ? 'pwm-source-active' : ''}" data-source="imported">
                        ${t('sourceImported')} (${totalCustomItems})
                    </button>
                    <button type="button" class="pwm-source-btn ${state.sourceFilter === 'all' ? 'pwm-source-active' : ''}" data-source="all">
                        ${t('sourceAll')}
                    </button>
                </div>
            </div>

            <!-- Lorebook Shelf Bar (Dedicated split shelf management) -->
            <div class="pwm-book-shelf-bar" style="${state.sourceFilter === 'default' ? 'display: none;' : ''}">
                <div class="pwm-book-select-group">
                    <label for="pwm-book-select">📚 <b>${t('bookFilter')}:</b></label>
                    <select id="pwm-book-select" class="pwm-book-select">
                        <option value="all" ${state.activeBookFilter === 'all' ? 'selected' : ''}>🌐 ${t('allBooks')} (${totalCustomItems})</option>
                        ${bookKeys.map(b => `<option value="${escapeHtml(b)}" ${state.activeBookFilter === b ? 'selected' : ''}>📖 ${escapeHtml(b)} (${state.importedBooks[b]?.length || 0})</option>`).join('')}
                    </select>
                </div>

                <div class="pwm-book-btn-group">
                    <button type="button" class="pwm-btn pwm-btn-sm pwm-btn-primary" id="pwm-pick-st-btn" title="${t('pickFromSTDesc')}">
                        <i class="fa-solid fa-book-bookmark"></i> ${t('pickFromST')}
                    </button>
                    <button type="button" class="pwm-btn pwm-btn-sm pwm-btn-secondary" id="pwm-import-file-btn" title="${t('uploadJsonDesc')}">
                        <i class="fa-solid fa-file-arrow-up"></i> ${t('uploadJson')}
                    </button>
                    <button type="button" class="pwm-btn pwm-btn-sm pwm-btn-danger" id="pwm-delete-book-btn" title="${t('deleteBook')}" ${state.activeBookFilter === 'all' ? 'disabled' : ''}>
                        <i class="fa-solid fa-trash-can"></i> ${t('deleteBook')}
                    </button>
                    <input type="file" id="pwm-file-input" accept=".json" style="display: none;" />
                </div>
            </div>

            <!-- Target Character & Search Bar -->
            <div class="pwm-target-bar">
                <div class="pwm-char-select-wrap">
                    <label for="pwm-char-select"><i class="fa-solid fa-user"></i></label>
                    <select id="pwm-char-select" class="pwm-select" title="${t('targetChar')}">
                        ${state.characters.map(c => `<option value="${escapeHtml(c)}" ${state.activeCharacter === c ? 'selected' : ''}>${escapeHtml(c)}</option>`).join('')}
                    </select>
                    <button type="button" class="pwm-btn pwm-btn-sm" id="pwm-add-char-btn" title="${t('addChar')}"><i class="fa-solid fa-plus"></i></button>
                </div>
                <div class="pwm-search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="pwm-search-input" placeholder="${t('searchPlaceholder')}" value="${escapeHtml(state.searchQuery)}">
                </div>
            </div>

            <!-- Category Tabs -->
            <div class="pwm-tabs" id="pwm-tabs-container">
                ${categories.map(c => `
                    <button type="button" class="pwm-tab ${state.activeCategory === c.id ? 'pwm-tab-active' : ''}" data-cat="${escapeHtml(c.id)}">
                        ${escapeHtml(c.label)}
                    </button>
                `).join('')}
            </div>

            <!-- Outfits Grid Area -->
            <div class="pwm-content" id="pwm-items-grid"></div>

            <!-- Live Attire Preview & Party Summary -->
            <div class="pwm-footer">
                <div class="pwm-preview-row" id="pwm-preview-row"></div>
                <div class="pwm-party-summary" id="pwm-party-summary-row"></div>
                <div class="pwm-action-buttons">
                    <button type="button" class="pwm-btn pwm-btn-secondary" id="pwm-clear-btn" title="${t('clearChar')}">
                        <i class="fa-solid fa-rotate-left"></i> <span class="pwm-btn-text">${t('clearCharShort')}</span>
                    </button>
                    <button type="button" class="pwm-btn pwm-btn-save" id="pwm-save-party-btn" title="${t('saveParty')}">
                        <i class="fa-solid fa-floppy-disk"></i> <span class="pwm-btn-text">${t('savePartyShort')}</span>
                    </button>
                    <button type="button" class="pwm-btn pwm-btn-primary" id="pwm-apply-chat-btn" title="${t('applyChat')}">
                        <i class="fa-solid fa-paper-plane"></i> <span class="pwm-btn-text">${t('applyChatShort')}</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- ST World Info Selector Modal -->
        <div id="pwm-st-picker-modal" class="pwm-submodal" style="display: none;">
            <div class="pwm-submodal-content">
                <div class="pwm-submodal-header">
                    <h3><i class="fa-solid fa-book-bookmark"></i> ${t('stModalTitle')}</h3>
                    <button type="button" class="pwm-submodal-close" id="pwm-st-modal-close">&times;</button>
                </div>
                <p class="pwm-submodal-desc">${t('stModalDesc')}</p>
                <div id="pwm-st-books-list" class="pwm-st-books-list">
                    <div style="text-align: center; padding: 20px; color: #94a3b8;">
                        <i class="fa-solid fa-spinner fa-spin"></i> Loading SillyTavern lorebooks...
                    </div>
                </div>
            </div>
        </div>
    `;

    bindModalEvents(backdrop);
    renderItemsGrid();
    renderPreview();
    renderPartySummary();
}

function bindModalEvents(backdrop) {
    // Close button
    backdrop.querySelector('#pwm-close-btn').onclick = closeWardrobeModal;
    backdrop.onclick = (e) => {
        if (e.target === backdrop) closeWardrobeModal();
    };

    // Language selector
    backdrop.querySelector('#pwm-lang-select').onchange = (e) => {
        state.currentLang = e.target.value;
        saveState();
        renderModal();
    };

    // Source Filter switch
    backdrop.querySelectorAll('.pwm-source-btn').forEach(btn => {
        btn.onclick = () => {
            state.sourceFilter = btn.dataset.source;
            renderModal();
        };
    });

    // Shelf selector
    const shelfSelect = backdrop.querySelector('#pwm-book-select');
    if (shelfSelect) {
        shelfSelect.onchange = (e) => {
            state.activeBookFilter = e.target.value;
            renderModal();
        };
    }

    // Pick from ST World Info button
    const pickStBtn = backdrop.querySelector('#pwm-pick-st-btn');
    if (pickStBtn) {
        pickStBtn.onclick = openStWorldPickerModal;
    }

    // Delete Shelf button
    const deleteBookBtn = backdrop.querySelector('#pwm-delete-book-btn');
    if (deleteBookBtn) {
        deleteBookBtn.onclick = () => {
            if (state.activeBookFilter === 'all') return;
            const book = state.activeBookFilter;
            if (confirm(t('deleteBookConfirm', { book }))) {
                delete state.importedBooks[book];
                state.activeBookFilter = 'all';
                saveState();
                renderModal();
            }
        };
    }

    // File Input button (Upload JSON)
    const fileInput = backdrop.querySelector('#pwm-file-input');
    const uploadFileBtn = backdrop.querySelector('#pwm-import-file-btn');
    if (uploadFileBtn && fileInput) {
        uploadFileBtn.onclick = () => fileInput.click();
        fileInput.onchange = handleJsonFileUpload;
    }

    // AI Scan button
    const scanBtn = backdrop.querySelector('#pwm-scan-chat-btn');
    if (scanBtn) scanBtn.onclick = scanRecentChatForAttire;

    // Character selector
    const charSelect = backdrop.querySelector('#pwm-char-select');
    if (charSelect) {
        charSelect.onchange = (e) => {
            state.activeCharacter = e.target.value;
            loadCharacterAttireIntoSelection(state.activeCharacter);
            renderItemsGrid();
            renderPreview();
        };
    }

    // Add character button
    backdrop.querySelector('#pwm-add-char-btn').onclick = () => {
        const name = prompt(state.currentLang === 'th' ? 'ใส่ชื่อตัวละครใหม่ในปาร์ตี้:' : 'Enter new party character name:');
        if (name && name.trim()) {
            const trimmed = name.trim();
            if (!state.characters.includes(trimmed)) state.characters.push(trimmed);
            state.activeCharacter = trimmed;
            loadCharacterAttireIntoSelection(trimmed);
            renderModal();
        }
    };

    // Search input
    const searchInput = backdrop.querySelector('#pwm-search-input');
    searchInput.oninput = (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderItemsGrid();
    };

    // Category Tabs
    backdrop.querySelectorAll('.pwm-tab').forEach(tab => {
        tab.onclick = () => {
            state.activeCategory = tab.dataset.cat;
            backdrop.querySelectorAll('.pwm-tab').forEach(t => t.classList.remove('pwm-tab-active'));
            tab.classList.add('pwm-tab-active');
            renderItemsGrid();
        };
    });

    // Action buttons
    backdrop.querySelector('#pwm-apply-chat-btn').onclick = applyOutfitToChat;
    backdrop.querySelector('#pwm-save-party-btn').onclick = saveAttireToParty;
    backdrop.querySelector('#pwm-clear-btn').onclick = clearCharacterAttire;
}

/**
 * SillyTavern World Info Browser Modal
 */
async function openStWorldPickerModal() {
    const modal = document.getElementById('pwm-st-picker-modal');
    const listContainer = document.getElementById('pwm-st-books-list');
    const closeBtn = document.getElementById('pwm-st-modal-close');
    if (!modal || !listContainer) return;

    modal.style.display = 'flex';
    closeBtn.onclick = () => { modal.style.display = 'none'; };

    try {
        const books = await getAvailableTavernLorebooks();
        if (!books.length) {
            listContainer.innerHTML = `<div style="text-align: center; padding: 25px; color: #94a3b8;">${t('noStBooks')}</div>`;
            return;
        }

        listContainer.innerHTML = books.map(bookName => {
            const isImported = Boolean(state.importedBooks[bookName]);
            const count = isImported ? state.importedBooks[bookName].length : 0;
            return `
                <div class="pwm-st-book-row">
                    <div class="pwm-st-book-info">
                        <span class="pwm-st-book-title"><i class="fa-solid fa-book"></i> ${escapeHtml(bookName)}</span>
                        ${isImported ? `<span class="pwm-st-book-badge">${t('alreadyImported')} (${count} items)</span>` : ''}
                    </div>
                    <button type="button" class="pwm-btn pwm-btn-sm ${isImported ? 'pwm-btn-secondary' : 'pwm-btn-primary'} pwm-import-st-row-btn" data-book="${escapeHtml(bookName)}">
                        <i class="fa-solid fa-download"></i> ${isImported ? t('reimportBtn') : t('importBtn')}
                    </button>
                </div>
            `;
        }).join('');

        listContainer.querySelectorAll('.pwm-import-st-row-btn').forEach(btn => {
            btn.onclick = async () => {
                const bName = btn.dataset.book;
                btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Importing...`;
                btn.disabled = true;

                try {
                    const rawData = await fetchLorebookData(bName);
                    const parsed = parseLorebookEntries(rawData, bName);

                    state.importedBooks[bName] = parsed;
                    state.sourceFilter = 'imported';
                    state.activeBookFilter = bName;

                    saveState();
                    modal.style.display = 'none';
                    renderModal();
                    alert(t('importSuccess', { n: parsed.length, book: bName }));
                } catch (err) {
                    console.error('[PWM] Error importing ST world book:', err);
                    alert('Error: ' + err.message);
                    btn.disabled = false;
                    btn.innerHTML = `<i class="fa-solid fa-download"></i> ${t('importBtn')}`;
                }
            };
        });
    } catch (e) {
        listContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: #f87171;">Error loading books: ${e.message}</div>`;
    }
}

function handleJsonFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            const bookName = file.name.replace(/\.json$/i, '');
            const parsed = parseLorebookEntries(data, bookName);

            state.importedBooks[bookName] = parsed;
            state.sourceFilter = 'imported';
            state.activeBookFilter = bookName;

            saveState();
            renderModal();
            alert(t('importSuccess', { n: parsed.length, book: bookName }));
        } catch (err) {
            console.error('[PWM] Lorebook JSON upload error:', err);
            alert('Invalid JSON lorebook file: ' + err.message);
        }
    };
    reader.readAsText(file);
}

function renderItemsGrid() {
    const container = document.getElementById('pwm-items-grid');
    if (!container) return;

    const allItems = getAllOutfitsList();
    const isThai = state.currentLang === 'th';

    const filtered = allItems.filter(item => {
        if (state.activeCategory !== 'All' && item.category !== state.activeCategory) return false;
        if (state.searchQuery) {
            const q = state.searchQuery;
            const matchName = item.name.toLowerCase().includes(q);
            const matchThName = (item.th_name || '').toLowerCase().includes(q);
            const matchDesc = (item.desc || '').toLowerCase().includes(q);
            const matchThDesc = (item.th_desc || '').toLowerCase().includes(q);
            const matchKeys = (item.keys || []).some(k => k.toLowerCase().includes(q));
            if (!matchName && !matchThName && !matchDesc && !matchThDesc && !matchKeys) return false;
        }
        return true;
    });

    if (!filtered.length) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #64748b;">
                <i class="fa-solid fa-box-open" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                ${isThai ? 'ไม่พบชุดในหมวดนี้' : 'No outfits found in this category or search.'}
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(item => {
        const isSelected = checkIsItemSelected(item);
        const displayName = (isThai && item.th_name) ? item.th_name : item.name;
        const displayDesc = (isThai && item.th_desc) ? item.th_desc : item.desc;
        const subName = (isThai && item.th_name && item.th_name !== item.name) ? item.name : '';

        const badgeClass = item.source === 'imported' ? 'pwm-badge-imported' : 'pwm-badge-default';
        const badgeLabel = item.source === 'imported' ? (item.book || 'Custom') : 'Default';

        return `
            <div class="pwm-item-card ${isSelected ? 'pwm-selected' : ''}" data-id="${escapeHtml(item.id)}">
                <div class="pwm-item-header">
                    <span class="pwm-item-title">
                        ${isSelected ? '<i class="fa-solid fa-circle-check pwm-check-icon"></i>' : ''}
                        <span>${escapeHtml(displayName)}</span>
                    </span>
                    <span class="pwm-item-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
                </div>
                ${subName ? `<div class="pwm-item-subname">${escapeHtml(subName)}</div>` : ''}
                <div class="pwm-item-desc">${escapeHtml(displayDesc)}</div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.pwm-item-card').forEach(card => {
        card.onclick = () => toggleItemSelection(card.dataset.id);
    });
}

function checkIsItemSelected(item) {
    const name = item.name;
    const cat = item.category;

    if (cat === 'Tops') return state.selectedTop === name;
    if (cat === 'Bottoms') return state.selectedBottom === name;
    if (cat === 'Legwear') return state.selectedLegwear === name;
    if (cat === 'Add-ons & Modifiers' || cat === 'States & Conditions') {
        return state.selectedModifiers.has(name);
    }
    return state.selectedMain === name;
}

function toggleItemSelection(itemId) {
    const all = getAllOutfitsList();
    const item = all.find(it => it.id === itemId);
    if (!item) return;

    const name = item.name;
    const cat = item.category;

    if (cat === 'Tops') {
        state.selectedTop = state.selectedTop === name ? null : name;
        if (state.selectedTop) state.selectedMain = null;
    } else if (cat === 'Bottoms') {
        state.selectedBottom = state.selectedBottom === name ? null : name;
        if (state.selectedBottom) state.selectedMain = null;
    } else if (cat === 'Legwear') {
        state.selectedLegwear = state.selectedLegwear === name ? null : name;
    } else if (cat === 'Add-ons & Modifiers' || cat === 'States & Conditions') {
        if (state.selectedModifiers.has(name)) {
            state.selectedModifiers.delete(name);
        } else {
            state.selectedModifiers.add(name);
        }
    } else {
        // Specialty Sets, Dresses, Fullbody Suits
        state.selectedMain = state.selectedMain === name ? null : name;
        if (state.selectedMain) {
            state.selectedTop = null;
            state.selectedBottom = null;
        }
    }

    renderItemsGrid();
    renderPreview();
}

function getCompiledSelectionList() {
    const list = [];
    if (state.selectedMain) list.push(state.selectedMain);
    if (state.selectedTop) list.push(state.selectedTop);
    if (state.selectedBottom) list.push(state.selectedBottom);
    if (state.selectedLegwear) list.push(state.selectedLegwear);
    for (const m of state.selectedModifiers) list.push(m);
    return list;
}

function renderPreview() {
    const preview = document.getElementById('pwm-preview-row');
    if (!preview) return;

    const list = getCompiledSelectionList();
    if (!list.length) {
        preview.innerHTML = `<span><b>${escapeHtml(state.activeCharacter || 'Target')}:</b> <i>${t('noOutfit')}</i></span>`;
    } else {
        preview.innerHTML = `
            <span><b>${escapeHtml(state.activeCharacter)}:</b></span>
            ${list.map(piece => `<span class="pwm-preview-tag">${escapeHtml(piece)}</span>`).join('')}
        `;
    }
}

function renderPartySummary() {
    const summary = document.getElementById('pwm-party-summary-row');
    if (!summary) return;

    const chars = Object.keys(state.wardrobes);
    if (!chars.length) {
        summary.innerHTML = `<span>👥 <b>${t('partySummary')}</b> ${state.currentLang === 'th' ? 'ยังไม่มีชุดประจำ คลิก [บันทึกเป็นชุดประจำตัวละคร] เพื่อผูกชุด' : 'None registered yet.'}</span>`;
        return;
    }

    summary.innerHTML = `
        <span style="font-weight: 600; color: #cbd5e1;">👥 ${t('partySummary')}</span>
        ${chars.map(c => {
            const w = state.wardrobes[c];
            const pieces = [];
            if (w.main) pieces.push(w.main);
            if (w.top) pieces.push(w.top);
            if (w.bottom) pieces.push(w.bottom);
            if (w.legwear) pieces.push(w.legwear);
            if (w.modifiers?.length) pieces.push(...w.modifiers);
            const str = pieces.length ? pieces.join(' + ') : 'Default';
            return `<span class="pwm-party-item"><b>${escapeHtml(c)}:</b> [${escapeHtml(str)}]</span>`;
        }).join(' ' || ' ' )}
    `;
}

function applyOutfitToChat() {
    const char = state.activeCharacter || 'She';
    const list = getCompiledSelectionList();
    if (!list.length) return;

    const textarea = document.getElementById('send_textarea');
    if (!textarea) return;

    const tag = `*[${char}] is wearing [Outfit: ${list.join(' + ')}]*\n`;
    if (textarea.value) {
        textarea.value = tag + textarea.value;
    } else {
        textarea.value = tag;
    }

    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    closeWardrobeModal();
}

function saveAttireToParty() {
    const char = state.activeCharacter;
    if (!char) return;

    state.wardrobes[char] = {
        main: state.selectedMain || '',
        top: state.selectedTop || '',
        bottom: state.selectedBottom || '',
        legwear: state.selectedLegwear || '',
        modifiers: Array.from(state.selectedModifiers)
    };

    saveState();
    renderPartySummary();
    const alertMsg = state.currentLang === 'th'
        ? `บันทึกชุดของ ${char} เรียบร้อย! AI จะจำชุดนี้ไว้ตลอดใน Party Attire Sheet ที่ depth 2`
        : `Saved ${char}'s attire! The AI will now remember this outfit in the party sheet.`;
    alert(alertMsg);
}

function clearCharacterAttire() {
    const char = state.activeCharacter;
    if (!char) return;

    delete state.wardrobes[char];
    state.selectedMain = null;
    state.selectedTop = null;
    state.selectedBottom = null;
    state.selectedLegwear = null;
    state.selectedModifiers.clear();

    saveState();
    renderItemsGrid();
    renderPreview();
    renderPartySummary();
}

function openWardrobeModal() {
    renderModal();
    const backdrop = document.getElementById('pwm-modal-backdrop');
    if (backdrop) backdrop.classList.add('pwm-open');
}

function closeWardrobeModal() {
    const backdrop = document.getElementById('pwm-modal-backdrop');
    if (backdrop) backdrop.classList.remove('pwm-open');
}

function injectLauncherButton() {
    if (document.getElementById('pwm-wardrobe-btn')) return;

    const container = document.getElementById('chat_buttons') || 
                      document.getElementById('form_sheld') || 
                      document.querySelector('.form_buttons') ||
                      document.getElementById('send_form');

    if (!container) return;

    const btn = document.createElement('div');
    btn.id = 'pwm-wardrobe-btn';
    btn.className = 'menu_button fa-solid fa-shirt';
    btn.title = 'Party Wardrobe & Outfit Manager';
    btn.style.cssText = 'cursor: pointer; margin: 0 4px; display: inline-flex; align-items: center; justify-content: center;';
    btn.onclick = openWardrobeModal;

    const sendBtn = document.getElementById('send_but');
    if (sendBtn && container === sendBtn.parentElement) {
        container.insertBefore(btn, sendBtn);
    } else {
        container.appendChild(btn);
    }
}

function setupSettingsPanel() {
    const container = document.getElementById('extensions_settings') || document.getElementById('extensions_settings2');
    if (!container || document.getElementById('pwm-extension-settings')) return;

    const panel = document.createElement('div');
    panel.id = 'pwm-extension-settings';
    panel.style.cssText = 'padding: 6px 0; margin-bottom: 8px;';

    panel.innerHTML = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #0c1220; border: 1px solid #1e293b; border-radius: 8px;">
                <b style="color: #f472b6; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-shirt"></i> Party Wardrobe Manager
                </b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down" style="color: #94a3b8;"></div>
            </div>
            <div class="inline-drawer-content" style="display: block; padding: 14px; background: #07090e; border: 1px solid #1e293b; border-top: none; border-radius: 0 0 8px 8px;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0 0 12px 0; line-height: 1.5;">
                    Manage character outfits, import custom lorebooks into split shelves, and maintain persistent RPG party attire sheets.
                </p>
                <div style="margin: 0 0 14px 0;">
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #e2e8f0; cursor: pointer;">
                        <input type="checkbox" id="pwm-setting-injection" ${state.enableInjection ? 'checked' : ''} style="cursor: pointer;">
                        <b>Enable Persistent Party Attire Injection (Prompt Depth 2)</b>
                    </label>
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <button type="button" class="pwm-btn pwm-btn-primary" id="pwm-settings-open-btn" style="padding: 8px 14px; font-size: 0.88em;">
                        <i class="fa-solid fa-shirt"></i> Open Wardrobe Manager
                    </button>
                    <button type="button" class="pwm-btn pwm-btn-secondary" id="pwm-settings-pick-st-btn" style="padding: 8px 14px; font-size: 0.88em;">
                        <i class="fa-solid fa-book-bookmark"></i> Pick from ST World
                    </button>
                    <button type="button" class="pwm-btn pwm-btn-danger" id="pwm-settings-clear-all" style="padding: 8px 14px; font-size: 0.88em;">
                        <i class="fa-solid fa-trash-can"></i> Reset All Wardrobes
                    </button>
                </div>
            </div>
        </div>
    `;

    container.appendChild(panel);

    const toggleHeader = panel.querySelector('.inline-drawer-toggle');
    const content = panel.querySelector('.inline-drawer-content');
    const icon = panel.querySelector('.inline-drawer-icon');
    if (toggleHeader && content) {
        toggleHeader.onclick = () => {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            if (icon) {
                icon.classList.toggle('fa-circle-chevron-down', isHidden);
                icon.classList.toggle('fa-circle-chevron-up', !isHidden);
            }
        };
    }

    panel.querySelector('#pwm-settings-open-btn').onclick = openWardrobeModal;
    panel.querySelector('#pwm-settings-pick-st-btn').onclick = () => {
        openWardrobeModal();
        setTimeout(openStWorldPickerModal, 150);
    };
    panel.querySelector('#pwm-setting-injection').onchange = (e) => {
        state.enableInjection = e.target.checked;
        saveState();
    };
    panel.querySelector('#pwm-settings-clear-all').onclick = () => {
        if (confirm('Clear all party member outfits?')) {
            state.wardrobes = {};
            saveState();
            renderPartySummary();
            alert('All character outfits cleared.');
        }
    };
}

function injectUIElements() {
    injectLauncherButton();
    setupSettingsPanel();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[m]));
}

export function init() {
    if (!state.initialized) {
        state.initialized = true;
        loadState();
        console.log('[Party Wardrobe Manager] v1.4.1 initialized (Default EN + Saved Preferences + Split Shelves + ST World Info + Full Thai Descs).');

        const ctx = getSillyContext();
        if (ctx?.eventSource && ctx.event_types) {
            ctx.eventSource.on(ctx.event_types.CHAT_CHANGED, () => {
                setTimeout(() => {
                    injectUIElements();
                    updatePromptInjection();
                }, 300);
            });
            ctx.eventSource.on(ctx.event_types.CHARACTER_PAGE_LOADED, () => {
                setTimeout(injectUIElements, 300);
            });
            ctx.eventSource.on(ctx.event_types.WORLDINFO_UPDATED, () => {
                setTimeout(injectUIElements, 300);
            });
        }

        // Click listener on document to ensure settings drawer mounts when user opens the extensions panel
        document.addEventListener('click', () => {
            setTimeout(injectUIElements, 100);
        });
    }

    // Always attempt injection across multiple timings
    [50, 250, 600, 1500, 3000].forEach(ms => setTimeout(injectUIElements, ms));
    updatePromptInjection();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
