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
      "sukumizu",
      "ชุดว่ายน้ำโรงเรียน"
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
      "ชุดลาเท็กซ์หัวใจ",
      "ชุดเปิดหัวใจ"
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
      "เลโอตาร์ดมันเงา",
      "ชุดรัดรูปเปิดหัวใจ"
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
      "ชุดบันนี่เปิดหัวใจ",
      "ชุดกระต่ายเปิดหัวใจ"
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
      "ชุดเมดลาเท็กซ์",
      "ชุดเมดเปิดอก"
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
      "ชุดแม่ชีลาเท็กซ์",
      "ชุดซิสเตอร์ลาเท็กซ์"
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
      "ชุดพยาบาลลาเท็กซ์",
      "ชุดพยาบาลแหวกอก"
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
      "ชุดมิโกะผ้าบาง",
      "ชุดมิโกะฮาเร็ม"
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
      "ชุดระบำหน้าท้อง",
      "ชุดนักเต้นสีทอง"
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
      "ชุดเจ้าสาวลูกไม้",
      "ชุดชั้นในเจ้าสาว"
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
      "ชุดแคทสูทสีม่วง",
      "ชุดรัดรูปเปิดหัวใจสีม่วง"
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
      "ชุดนอนไม่ได้นอนผ้าบาง",
      "ชุดนอนบางเบา"
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
      "ชุดว่ายน้ำลาเท็กซ์ม่วง",
      "ชุดว่ายน้ำขอบหัวใจ"
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
      "เลโอตาร์ดหัวใจทอง",
      "ชุดรัดรูปแดงทอง"
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
      "ชุดผู้กองลาเท็กซ์",
      "ชุดทหารสาวลาเท็กซ์"
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
      "เลโอตาร์ดสีเหลืองเปิดหลัง",
      "ชุดรัดรูปสีเหลือง"
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
      "ชุดบันนี่ลาเท็กซ์ดำ",
      "ชุดกระต่ายดำ"
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
      "เซ็ตบันนี่พาสตี้",
      "ชุดบันนี่ปิดหัวใจ"
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
      "เซ็ตปีศาจหัวใจทอง",
      "ชุดลาเท็กซ์เขาทอง"
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
      "ไมโครบิกินี่ลายเสือดาว",
      "บิกินี่จิ๋วลายเสือ"
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
      "ชุดซัคคิวบัสชมพู",
      "ชุดปีศาจสาวลาเท็กซ์"
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
      "เอี๊ยมพยาบาลหัวใจ",
      "ชุดพยาบาลเอี๊ยม"
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
      "ฮาร์เนสแม่ชีตาข่าย",
      "ชุดซิสเตอร์สายรัด"
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
      "เบบี้ดอลล์ติดคลิปหัวใจ",
      "ชุดนอนบางเบาคลิปเงิน"
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
      "เสื้อครอป",
      "เสื้อเอวลอย"
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
      "เกาะอก",
      "เสื้อเกาะอก"
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
      "เสื้อสเวตเตอร์ตัวใหญ่",
      "เสื้อไหล่ตก"
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
      "คอร์เซ็ท",
      "เสื้อรัดรูปผูกเชือก"
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
      "เสื้อกล้าม",
      "เสื้อกล้ามรัดรูป"
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
      "kitchen apron bare",
      "เอี๊ยมเปลือย"
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
      "บิกินี่",
      "ชุดบิกินี่"
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
      "ผ้าพันอก",
      "ซาราชิ"
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
      "ชุดชั้นใน",
      "บราและกางเกงใน"
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
      "กระโปรงสั้นพิเศษ",
      "ไมโครสเกิร์ต"
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
      "กางเกงโยคะ",
      "เลกกิ้ง"
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
      "ชุดเดรสสายเดี่ยว",
      "สลิปเดรส"
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
      "ชุดซันเดรส",
      "เดรสฤดูร้อน"
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
      "ชุดค็อกเทลเดรส",
      "ชุดราตรีสั้น"
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
      "กี่เพ้า",
      "ชุดกี่เพ้า"
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
      "ยูกาตะ",
      "ชุดยูกาตะ"
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
      "ชุดเมด",
      "ชุดสาวใช้"
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
      "ชุดพยาบาล",
      "เดรสพยาบาล"
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
      "มินิเดรสลาเท็กซ์",
      "เดรสยางรัดรูป"
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
      "แร็ปเดรส",
      "เดรสผูกเอว"
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
      "ชุดนอนเบบี้ดอลล์",
      "เนกลิเช"
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
      "เลโอตาร์ด",
      "ชุดรัดรูป"
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
      "แคทสูท",
      "ชุดบอดี้สูทเต็มตัว"
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
      "ปลั๊กสูท",
      "ชุดนักบินไซไฟ"
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
      "บอดี้สูทลาเท็กซ์",
      "ชุดยางบอดี้สูท"
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
      "เท็ดดี้ลูกไม้",
      "ชุดชั้นในเท็ดดี้"
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
      "ถุงน่องเหนือเข่า",
      "ถุงน่องสายรัด"
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
      "ถุงน่องบาง",
      "ถุงน่องซีทรู"
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
      "สายรัดถุงน่อง",
      "การ์เตอร์เบลท์"
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
      "เสื้อเบลาส์ผ้าไหม",
      "เสื้อเชิ้ตผ้าไหม"
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
      "สายเดี่ยวผ้าซาติน",
      "เสื้อคามิโซล"
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
      "เกาะอกแถบแคบ",
      "แถบคาดอก"
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
      "เสื้อกีฬาตัวใหญ่",
      "เสื้อทีม"
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
      "กางเกงบลูม่า",
      "บลูม่า"
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
      "กางเกงฮากามะ",
      "ฮากามะ"
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
      "ชุดฮั่นฝู",
      "ชุดจีนโบราณ"
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
      "ชุดสูททำงาน",
      "ชุดสาวออฟฟิศ"
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
      "ชุดกะลาสี",
      "ชุดนักเรียนญี่ปุ่นคอสเพลย์"
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
      "ชุดออกกำลังกาย",
      "ชุดวิ่ง"
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
      "ชุดวอร์ม",
      "เสื้อวอร์มแหวกอก"
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
      "พาสตี้หัวใจ",
      "ที่แปะจุกหัวใจ"
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
      "เสื้อคลุมผ้าไหมเปิดอก",
      "ชุดคลุมอาบน้ำ"
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
      "เปลือยเปล่า",
      "แก้ผ้า"
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
      "นุ่งผ้าเช็ดตัวผืนเดียว",
      "พันผ้าขนหนู"
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
      "เสื้อผ้าเปียกโชก",
      "เสื้อผ้าแนบเนื้อ"
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
      "แต่งตัวครึ่งๆ กลางๆ",
      "เสื้อผ้าหลุดลุ่ย"
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
      "เพิ่งตื่นนอน",
      "ตื่นนอน"
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
      "เพิ่งอาบน้ำเสร็จ",
      "ตัวชื้นน้ำ"
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
      "ผ่าเป้า",
      "เปิดเป้า"
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
      "เปิดอก",
      "ผ่าอก"
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
      "เว้าหัวใจ",
      "เจาะช่องหัวใจ"
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
      "เว้าหลังลึก",
      "เปิดหลัง"
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
      "ผ่าข้างสูง",
      "กระโปรงผ่าสูง"
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
      "ผ้าซีทรู",
      "ผ้าบางใส"
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
      "ทรงหลวม",
      "เสื้อผ้าหลวม"
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
      "ผิวมันเงา",
      "เคลือบเงา"
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
      "เครื่องประดับตามตัว",
      "โซ่ประดับตัว"
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
      "ขนลุก",
      "ผิวสัมผัสหนาว"
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
      "รองเท้าส้นสูง",
      "ส้นสูง"
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
      "ปลอกคอ",
      "โชคเกอร์"
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
      "เท้าเปล่า",
      "ไม่ใส่รองเท้า"
    ]
  },
  {
    "id": "Costume_Vampire_Countess",
    "name": "Vampire Countess",
    "th_name": "เคาน์เตสแวมไพร์กอธิค",
    "category": "Specialty Sets",
    "desc": "A dramatic gothic Victorian vampire countess ensemble. Features a boned deep-crimson velvet underbust corset with intricate black lace overlay, high standing batwing collar, cascading sheer black split bustle skirt worn over lace boyshorts, and ruffled choker. High-contrast gothic elegance.",
    "th_desc": "ชุดเคาน์เตสแวมไพร์สไตล์กอธิควิกตอเรียน โดดเด่นด้วยคอร์เซ็ทผ้ากำมะหยี่สีแดงเข้มเสริมโครงกระชับทรงคลุมทับด้วยลูกไม้ดำ คอเสื้อทรงปีกค้างคาวตั้งสูง กระโปรงสุ่มผ่าข้างผ้าโปร่งทิ้งตัวสวมทับกางเกงลูกไม้ขาสั้น และโชคเกอร์คอระบายลูกไม้ ให้เสน่ห์ลึกลับหรูหรา",
    "source": "default",
    "keys": [
      "Vampire Countess",
      "Vampire Gown",
      "เคาน์เตสแวมไพร์กอธิค",
      "ชุดแวมไพร์"
    ]
  },
  {
    "id": "Costume_Cyber_Kunoichi",
    "name": "Cyber Kunoichi",
    "th_name": "นินจาสาวไซเบอร์",
    "category": "Specialty Sets",
    "desc": "A high-tech form-fitting mesh shinobi suit with luminous neon cyan line trim. Features an open back, high-neck collar, segmented composite shoulder pads, arm wraps, and asymmetrical leg guard ties.",
    "th_desc": "ชุดชิโนบิสาวไซเบอร์รัดรูปแนบเนื้อตัดเย็บจากผ้าตาข่ายไฮเทค ตกแต่งด้วยเส้นไฟนีออนสีฟ้าสว่างไสว ดีไซน์เปิดแผ่นหลัง คอเสื้อทรงสูง เสริมเกราะไหล่และปลอกแขนคาร์บอนพร้อมสายรัดขาสไตล์นินจาอนาคต",
    "source": "default",
    "keys": [
      "Cyber Kunoichi",
      "Cyber Ninja",
      "นินจาสาวไซเบอร์",
      "นินจาไซเบอร์"
    ]
  },
  {
    "id": "Costume_Gothic_Lolita_Doll",
    "name": "Gothic Lolita Doll",
    "th_name": "ตุ๊กตากอธิคโลลิต้า",
    "category": "Specialty Sets",
    "desc": "An ornate gothic lolita porcelain doll dress. Layered ruffled black organza petticoats, boned lace bodice, bell sleeves, satin hair ribbons, and a delicate scalloped bib collar.",
    "th_desc": "ชุดเดรสตุ๊กตากระเบื้องเคลือบกอธิคโลลิต้าแสนประณีต กระโปรงสุ่มผ้าออร์แกนซ่าสีดำซ้อนระบายเป็นชั้น คอร์เซ็ทลูกไม้กระชับเอว แขนเสื้อทรงระฆัง และที่คาดผมริบบิ้นซาตินสีดำขลับ",
    "source": "default",
    "keys": [
      "Gothic Lolita Doll",
      "Gothic Lolita",
      "ตุ๊กตากอธิคโลลิต้า",
      "โลลิต้ากอธิค"
    ]
  },
  {
    "id": "Costume_Succubus_Queen",
    "name": "Succubus Queen",
    "th_name": "ราชินีซัคคิวบัส",
    "category": "Specialty Sets",
    "desc": "A midnight patent leather harness set with batwing hip drapery. Features heart-cutout bust cups, silver O-ring linkages, studded choker, and sheer mesh hip veils.",
    "th_desc": "เซ็ตชุดชั้นในหนังมันเงาสีดำขลับสไตล์ราชินีปิศาจซัคคิวบัส ตัวบราเว้าช่องรูปหัวใจเชื่อมต่อด้วยห่วงเงินโอริง ประดับผ้าคลุมสะโพกทรงปีกค้างคาวโปร่งแสงและโชคเกอร์หมุดเงิน",
    "source": "default",
    "keys": [
      "Succubus Queen",
      "Succubus Armor",
      "ราชินีซัคคิวบัส",
      "ชุดซัคคิวบัส"
    ]
  },
  {
    "id": "Costume_Cyberpunk_Mercenary",
    "name": "Cyberpunk Mercenary",
    "th_name": "ทหารรับจ้างไซเบอร์พังก์",
    "category": "Specialty Sets",
    "desc": "A tactical sci-fi combat set with a cropped armored bolero jacket, high-waist tactical shorts, utility thigh holsters, and glowing orange electroluminescent wire accents.",
    "th_desc": "ชุดยุทธวิธีไซเบอร์พังก์ล้ำยุค ประกอบด้วยแจ็คเก็ตครอปทรงสั้นเสริมเกราะ กางเกงขาสั้นเอวสูง ซองใส่อุปกรณ์รัดต้นขา และสายไฟเรืองแสงสีส้มสไตล์ทหารรับจ้างไซไฟ",
    "source": "default",
    "keys": [
      "Cyberpunk Mercenary",
      "Cyberpunk Gear",
      "ทหารรับจ้างไซเบอร์พังก์",
      "ไซเบอร์พังก์"
    ]
  },
  {
    "id": "Costume_Micro_Cheerleader",
    "name": "Micro Cheerleader",
    "th_name": "เชียร์ลีดเดอร์ไมโคร",
    "category": "Specialty Sets",
    "desc": "An ultra-cropped sporty team halter top with vibrant contrast trim, paired with an ultra-short knife-pleated cheerleader skirt and matching wrist cuffs.",
    "th_desc": "ชุดเชียร์ลีดเดอร์ทรงไมโครแบบสปอร์ต เสื้อคล้องคอครอปสั้นพิเศษสกรีนลายทีม จับคู่กับกระโปรงสั้นจับจีบรอบเอวต่ำและปลอกข้อมือเข้าชุดกัน ให้ลุคสดใสและกระฉับกระเฉง",
    "source": "default",
    "keys": [
      "Micro Cheerleader",
      "Cheerleader Uniform",
      "เชียร์ลีดเดอร์ไมโคร",
      "ชุดเชียร์ลีดเดอร์"
    ]
  },
  {
    "id": "Costume_Tainted_Saintess",
    "name": "Tainted Saintess",
    "th_name": "นักบุญสาวต้องมนตร์",
    "category": "Specialty Sets",
    "desc": "Pristine white silk holy vestments with high double thigh slits, delicate gold embroidery, an open chest window, and a cascading sheer white veil.",
    "th_desc": "ชุดนักบุญศักดิ์สิทธิ์ผ้าไหมสีขาวบริสุทธิ์ ดีไซน์แหวกผ่าขาสูงทั้งสองข้าง ปักดิ้นทองคำลวดลายศักดิ์สิทธิ์ พร้อมช่องเปิดเว้าบริเวณหน้าอกและผ้าคลุมศีรษะโปร่งแสงทิ้งตัวยาว",
    "source": "default",
    "keys": [
      "Tainted Saintess",
      "Corrupted Nun",
      "นักบุญสาวต้องมนตร์",
      "ชุดนักบุญ"
    ]
  },
  {
    "id": "Costume_Dark_Magical_Girl",
    "name": "Dark Magical Girl",
    "th_name": "สาวน้อยเวทมนตร์ด้านมืด",
    "category": "Specialty Sets",
    "desc": "An asymmetrical flared sailor leotard with iridescent midnight organza capelet, heart-shaped dark crystal brooch, puff sleeves, and thigh ribbons.",
    "th_desc": "ชุดบอดี้สูทกะลาสีสาวน้อยเวทมนตร์โทนดำเงางาม ชายกระโปรงบานสั้นซ้อนผ้าออร์แกนซ่าประกายเหลือบ ผ้าคลุมไหล่โปร่งแสง กลัดเข็มกลัดคริสตัลหัวใจสีม่วงเข้มและริบบิ้นผูกต้นขา",
    "source": "default",
    "keys": [
      "Dark Magical Girl",
      "Gothic Mahou",
      "สาวน้อยเวทมนตร์ด้านมืด",
      "สาวน้อยเวทมนตร์"
    ]
  },
  {
    "id": "Costume_Pharaoh_Empress",
    "name": "Pharaoh Empress",
    "th_name": "จักรพรรดินีฟาโรห์",
    "category": "Specialty Sets",
    "desc": "A sheer pleated golden linen kalasiris dress with ornate lapis lazuli collar necklace, linked golden hip chains, bare midriff, and an asp cobra circlet.",
    "th_desc": "ชุดกาลาซิริสผ้าลินินสีทองโปร่งจับพลีตสไตล์อียิปต์โบราณ ประดับแผงคอทองคำฝังหินลาพิสลาซูลี สายโซ่ทองระย้าคาดสะโพก และรัดเกล้ารูปงูเห่าทองคำทรงอำนาจ",
    "source": "default",
    "keys": [
      "Pharaoh Empress",
      "Egyptian Queen",
      "จักรพรรดินีฟาโรห์",
      "ชุดฟาโรห์"
    ]
  },
  {
    "id": "Costume_Race_Queen",
    "name": "Race Queen",
    "th_name": "เรซควีนสาวสนามแข่ง",
    "category": "Specialty Sets",
    "desc": "A high-gloss zip-front spandex crop jacket with checkered flag contrast panels, matching ultra-short hot pants, and a wide faux-leather sponsor belt.",
    "th_desc": "ชุดพิทเกิร์ลสาวสนามแข่งมอเตอร์สปอร์ต เสื้อแจ็คเก็ตครอปผ้ายืดสแปนเด็กซ์เงาวับรูดซิปหน้า ตกแต่งลายตารางหมากรุก จับคู่กับกางเกงฮ็อตแพนท์ขาสั้นกุดและเข็มขัดสปอนเซอร์เส้นโต",
    "source": "default",
    "keys": [
      "Race Queen",
      "Grid Girl",
      "เรซควีนสาวสนามแข่ง",
      "ชุดเรซควีน"
    ]
  },
  {
    "id": "Costume_Dragon_Knight_Bikini",
    "name": "Dragon Knight Bikini",
    "th_name": "ชุดเกราะบิกินี่อัศวินมังกร",
    "category": "Specialty Sets",
    "desc": "Burnished crimson dragon-scale metal plates sculpting the bust and pelvis, interconnected with delicate steel chainmail links and leather cinch straps.",
    "th_desc": "ชุดเกราะบิกินี่อัศวินมังกรทำจากเกล็ดโลหะสีแดงเพลิงเงางาม โอบกระชับทรวงอกและสะโพก เชื่อมโยงด้วยห่วงโซ่ถักเงินและสายรัดหนังแท้ ให้ลุคนักรบสาวแฟนตาซีสุดแกร่ง",
    "source": "default",
    "keys": [
      "Dragon Knight Bikini",
      "Armor Bikini",
      "ชุดเกราะบิกินี่อัศวินมังกร",
      "เกราะบิกินี่"
    ]
  },
  {
    "id": "Costume_Kitsune_Shrine_Dancer",
    "name": "Kitsune Shrine Dancer",
    "th_name": "มิโกะจิ้งจอกเก้าหาง",
    "category": "Specialty Sets",
    "desc": "A flowing scarlet and pure white silk dancer robe featuring bare shoulders, oversized bell sleeves, a wide golden brocade obi, and dangling brass bell tassels.",
    "th_desc": "ชุดระบำบูชาเทพมิโกะจิ้งจอกผ้าไหมขาวสลับแดงชาด เปิดเปลือยไหล่มน แขนเสื้อกว้างพลิ้วไหว คาดโอบิดิ้นทองลายกนกและพู่กระดิ่งทองเหลืองที่ส่งเสียงกรุ๊งกริ๊งยามก้าวเดิน",
    "source": "default",
    "keys": [
      "Kitsune Shrine Dancer",
      "Fox Miko",
      "มิโกะจิ้งจอกเก้าหาง",
      "มิโกะจิ้งจอก"
    ]
  },
  {
    "id": "Costume_Satin_French_Maid",
    "name": "Satin French Maid",
    "th_name": "เมดฝรั่งเศสผ้าซาติน",
    "category": "Specialty Sets",
    "desc": "A glossy black satin sweetheart minidress with scalloped white lace trim, a sheer ruffled organza apron, puffed sleeves, and lace wrist cuffs.",
    "th_desc": "ชุดเมดฝรั่งเศสผ้าซาตินสีดำขลับแวววาว คอเว้ารูปหัวใจแต่งขอบลูกไม้ขาว ผ้ากันเปื้อนผ้าออร์แกนซ่าจับระบายโปร่งบาง แขนพองน่ารัก และปลอกข้อมือลูกไม้เข้าชุด",
    "source": "default",
    "keys": [
      "Satin French Maid",
      "French Maid",
      "เมดฝรั่งเศสผ้าซาติน",
      "ชุดเมด"
    ]
  },
  {
    "id": "Costume_Starlight_Idol",
    "name": "Starlight Idol",
    "th_name": "ไอดอลเวทีดวงดาว",
    "category": "Specialty Sets",
    "desc": "A sparkling pastel sequin bustier paired with tiered iridescent tulle ruffles, star-shaped crystal belt buckle, and a satin choker with trailing back ribbons.",
    "th_desc": "ชุดไอดอลแสดงสดบนเวที เสื้อเกาะอกปักเลื่อมระยิบระยับโทนพาสเทล กระโปรงสุ่มผ้าทูลล์ซ้อนชั้นเหลือบแสง หัวเข็มขัดคริสตัลรูปดาว และโชคเกอร์ริบบิ้นทิ้งชายด้านหลัง",
    "source": "default",
    "keys": [
      "Starlight Idol",
      "Pop Idol",
      "ไอดอลเวทีดวงดาว",
      "ชุดไอดอล"
    ]
  },
  {
    "id": "Costume_Bondage_Bunny",
    "name": "Bondage Bunny",
    "th_name": "บันนี่สูทสายรัดบอนเดจ",
    "category": "Specialty Sets",
    "desc": "A glossy vinyl bunny bodysuit crisscrossed with delicate buckle straps and silver O-rings, featuring an open clavicle cutout and fluffy pompom tail.",
    "th_desc": "ชุดบันนี่สูทไวนิลสีดำเงาคาดทับด้วยสายรัดบัคเคิลและห่วงเงินโอริง ดีไซน์เว้าช่วงไหปลาร้า ด้านหลังติดหางปุยสีขาวนุ่มนวล ผสมผสานความเซ็กซี่และสไตล์บอนเดจอย่างลงตัว",
    "source": "default",
    "keys": [
      "Bondage Bunny",
      "Harness Bunny",
      "บันนี่สูทสายรัดบอนเดจ",
      "บันนี่สายรัด"
    ]
  },
  {
    "id": "Costume_Valkyrie_Maiden",
    "name": "Valkyrie Maiden",
    "th_name": "วัลคิรีสาวแห่งวัลฮัลลา",
    "category": "Specialty Sets",
    "desc": "A silver feather-embellished breastplate, draped sheer white silk chiton with side slits, golden wrist bracers, and a winged silver circlet.",
    "th_desc": "ชุดนักรบสาววัลคิรี เกราะอกเงินแกะสลักลวดลายขนนก สวมทับชุดผ้าไหมชีฟองสีขาวโปร่งแหวกข้าง ปลอกแขนทองคำ และมงกุฎรัดเกล้าปีกเงินศักดิ์สิทธิ์",
    "source": "default",
    "keys": [
      "Valkyrie Maiden",
      "Valkyrie Armor",
      "วัลคิรีสาวแห่งวัลฮัลลา",
      "ชุดวัลคิรี"
    ]
  },
  {
    "id": "Costume_Royal_Courtesan",
    "name": "Royal Courtesan",
    "th_name": "นางสนมหลวงแดนสวรรค์",
    "category": "Specialty Sets",
    "desc": "Translucent layered lavender chiffon wrap gown with a jewel-encrusted waist girdle, bare shoulders, and delicate floating arm ribbons that drift with motion.",
    "th_desc": "ชุดผ้าคลุมชีฟองโปร่งบางสีม่วงลาเวนเดอร์ซ้อนชั้น คาดเข็มขัดเอวประดับอัญมณีวิจิตร เปลือยไหล่เนียน พร้อมสายริบบิ้นต้นแขนบางเบาที่พลิ้วไสวไปตามทุกลีลาการเคลื่อนไหว",
    "source": "default",
    "keys": [
      "Royal Courtesan",
      "Harem Gown",
      "นางสนมหลวงแดนสวรรค์",
      "ชุดนางสนม"
    ]
  },
  {
    "id": "Costume_Wild_Leopard_Huntress",
    "name": "Wild Leopard Huntress",
    "th_name": "นักล่าสาวลายเสือดาว",
    "category": "Specialty Sets",
    "desc": "A faux-fur trimmed leopard print micro suede halter top and matching wrap skirt with bone bead accents, braided leather ties, and fur wristlets.",
    "th_desc": "ชุดนักล่าสาวพงไพรลายเสือดาวทำจากหนังกลับเนื้อนุ่มตกแต่งขอบขนสัตว์เทียม บราคล้องคอเว้าลึกจับคู่กระโปรงป้ายสั้นแต่งลูกปัดกระดูกสัตว์และสายหนังถัก",
    "source": "default",
    "keys": [
      "Wild Leopard Huntress",
      "Leopard Bikini",
      "นักล่าสาวลายเสือดาว",
      "ชุดลายเสือ"
    ]
  },
  {
    "id": "Costume_SciFi_Android_Chassis",
    "name": "SciFi Android Chassis",
    "th_name": "แอนดรอยด์สาวโครงสร้างซิลิโคน",
    "category": "Specialty Sets",
    "desc": "A matte white and chrome segmented synth-skin paneling suit with glowing cyan circuit tracings, open ribcage accents, and smooth silicone surface feel.",
    "th_desc": "ชุดเกราะชีวภาพแอนดรอยด์สีขาวด้านสลับแผ่นโครเมียมเงาวับ มีเส้นวงจรเรืองแสงสีฟ้าพาดผ่านเรือนร่าง เว้าโชว์ช่วงเอวและกระดูกซี่โครง ให้ฟีลลิ่งผิวสัมผัสซิลิโคนสังเคราะห์ชั้นสูง",
    "source": "default",
    "keys": [
      "SciFi Android Chassis",
      "Cyborg Suit",
      "แอนดรอยด์สาวโครงสร้างซิลิโคน",
      "ชุดไซบอร์ก"
    ]
  },
  {
    "id": "Costume_Gothic_Nun_Latex",
    "name": "Gothic Nun Latex",
    "th_name": "แม่ชีลาเท็กซ์กอธิค",
    "category": "Specialty Sets",
    "desc": "High-gloss black rubber habit featuring a plunging neckline cutout, crucifix pendant choker, white latex coif veil, and long floor-sweeping side-slit skirt.",
    "th_desc": "ชุดแม่ชียางลาเท็กซ์สีดำขลับขัดเงาวาววับ คอเสื้อเว้าลึกโชว์ร่องอก ประดับจี้ไม้กางเขนเงิน ผ้าคลุมศีรษะลาเท็กซ์สีขาวตัดดำ และกระโปรงยาวผ่าข้างสูงถึงสะโพก",
    "source": "default",
    "keys": [
      "Gothic Nun Latex",
      "Latex Nun",
      "แม่ชีลาเท็กซ์กอธิค",
      "ชุดแม่ชีลาเท็กซ์"
    ]
  },
  {
    "id": "Costume_Cowgirl_Chaps",
    "name": "Cowgirl Chaps",
    "th_name": "คาวเกิร์ลหนังคาวบอย",
    "category": "Specialty Sets",
    "desc": "A plunging distressed denim crop vest, brown suede fringe chaps worn over cheeky denim hot pants, and a crimson bandana tied loosely around the throat.",
    "th_desc": "ชุดคาวเกิร์ลสาวตะวันตก เสื้อกั๊กยีนส์ฟอกครอปสั้นแหวกอก สวมทับกางเกงแชปส์หนังกลับสีน้ำตาลแต่งพู่ระบายคู่กับกางเกงยีนส์ขาสั้น และผ้าพันคอบันดานาสีแดงสด",
    "source": "default",
    "keys": [
      "Cowgirl Chaps",
      "Cowgirl Outfit",
      "คาวเกิร์ลหนังคาวบอย",
      "ชุดคาวเกิร์ล"
    ]
  },
  {
    "id": "Costume_Amazon_Warrior",
    "name": "Amazon Warrior",
    "th_name": "นักรบสาวอเมซอน",
    "category": "Specialty Sets",
    "desc": "A hardened leather battle corset, asymmetrical fur-lined gladiator war skirt, brass pectoral plates, and a braided gold torque collar.",
    "th_desc": "ชุดนักรบสาวเผ่าอเมซอน คอร์เซ็ทหนังหนาฟอกฝาดเสริมแผ่นเกราะทองเหลือง กระโปรงสงครามทรงกลาดิเอเตอร์แต่งขอบขนสัตว์ และกำไลคอทองคำถักทรงพลัง",
    "source": "default",
    "keys": [
      "Amazon Warrior",
      "Gladiator Woman",
      "นักรบสาวอเมซอน",
      "ชุดนักรบหญิง"
    ]
  },
  {
    "id": "Costume_Silk_Boudoir_Bride",
    "name": "Silk Boudoir Bride",
    "th_name": "เจ้าสาวห้องนอนผ้าไหม",
    "category": "Specialty Sets",
    "desc": "A translucent white floral lace lingerie set with silk ribbon ties, paired with a cathedral-length sheer tulle veil and satin garter belt.",
    "th_desc": "ชุดชั้นในเจ้าสาวผ้าไหมผสมลูกไม้ลายดอกไม้โปร่งแสงสีขาวบริสุทธิ์ ผูกริบบิ้นซาติน มาพร้อมผ้าคลุมหน้าเจ้าสาวผ้ามุ้งทูลล์ทิ้งตัวยาวจรดพื้นและสายรัดถุงน่องซาติน",
    "source": "default",
    "keys": [
      "Silk Boudoir Bride",
      "Bridal Lingerie",
      "เจ้าสาวห้องนอนผ้าไหม",
      "ชุดเจ้าสาวเซ็กซี่"
    ]
  },
  {
    "id": "Costume_Dark_Angel",
    "name": "Dark Angel",
    "th_name": "ทูตสวรรค์ปีกดำ",
    "category": "Specialty Sets",
    "desc": "A black feathered corset bra with boned support, cascading shredded chiffon high-low skirt, studded leather collar, and matching dark wrist cuffs.",
    "th_desc": "ชุดทูตสวรรค์ตกสวรรค์ บราคอร์เซ็ทประดับขนนกสีดำขลับ เสริมโครงดันทรง กระโปรงผ้าชีฟองผ่าเฉียงชายรุ่ยสไตล์โกธิค ปลอกคอหนังประดับหมุดเงิน และปลอกข้อมือขนนก",
    "source": "default",
    "keys": [
      "Dark Angel",
      "Fallen Angel",
      "ทูตสวรรค์ปีกดำ",
      "นางฟ้าปีกดำ"
    ]
  },
  {
    "id": "Costume_Space_Explorer_Suit",
    "name": "Space Explorer Suit",
    "th_name": "ชุดนักบินอวกาศแนบเนื้อ",
    "category": "Specialty Sets",
    "desc": "A metallic pearl-silver skin-tight explorer suit with orange thermal pressure piping, zip-open chest panel, and magnetic collar ring.",
    "th_desc": "ชุดสำรวจอวกาศรัดรูปเนื้อผ้าเมทัลลิกสีเงินเหลือบมุก เดินขอบด้วยท่อปรับแรงดันอุณหภูมิสีส้ม ซิปหน้าอกปรับเปิดได้ และคอเสื้อพร้อมห่วงล็อกหน้ากากสูญญากาศ",
    "source": "default",
    "keys": [
      "Space Explorer Suit",
      "Astronaut Suit",
      "ชุดนักบินอวกาศแนบเนื้อ",
      "ชุดอวกาศ"
    ]
  },
  {
    "id": "Top_Keyhole_Turtleneck",
    "name": "Keyhole Turtleneck",
    "th_name": "เสื้อคอเต่าเจาะอก",
    "category": "Tops",
    "desc": "A ribbed knit sleeveless sweater with a snug high turtleneck collar and a dramatic teardrop cutout exposing the cleavage.",
    "th_desc": "เสื้อไหมพรมถักแขนกุดทรงคอเต่ากระชับ โดดเด่นด้วยช่องเจาะเว้ารูปหยดน้ำขนาดใหญ่บริเวณหน้าอก เผยเนินอกสวยอย่างสะดุดตา",
    "source": "default",
    "keys": [
      "Keyhole Turtleneck",
      "Virgin Killer",
      "เสื้อคอเต่าเจาะอก",
      "เสื้อเจาะอก"
    ]
  },
  {
    "id": "Top_Backless_Halter",
    "name": "Backless Halter",
    "th_name": "เสื้อคล้องคอเปิดหลังเปลือย",
    "category": "Tops",
    "desc": "A liquid silk satin halter top draping gracefully across the bust in soft folds while leaving the entire spine and lower back bare.",
    "th_desc": "เสื้อคล้องคอผ้าไหมซาตินทิ้งตัวเป็นลอนนุ่มนวลด้านหน้า ด้านหลังเว้าเปิดโล่งตั้งแต่ต้นคอลงไปจนถึงบั้นเอว อวดแผ่นหลังเนียนสวย",
    "source": "default",
    "keys": [
      "Backless Halter Top",
      "Halter Top",
      "เสื้อคล้องคอเปิดหลังเปลือย",
      "เสื้อคล้องคอ"
    ]
  },
  {
    "id": "Top_Leather_Biker_Bra",
    "name": "Leather Biker Bra",
    "th_name": "บราหนังไบเกอร์",
    "category": "Tops",
    "desc": "A black motorcycle lambskin bralette styled like a mini moto jacket with functional silver zippers, snap-down lapels, and buckle straps.",
    "th_desc": "บราหนังแกะสีดำแท้ดีไซน์แจ็คเก็ตมอเตอร์ไซค์ แต่งซิปเงินรูดได้จริง ปกเสื้อติดกระดุมแป๊ก และสายคาดบัคเคิลใต้ราวนม ให้ลุคสาวไบเกอร์สุดเท่",
    "source": "default",
    "keys": [
      "Leather Biker Bra",
      "Leather Bra",
      "บราหนังไบเกอร์",
      "บราหนัง"
    ]
  },
  {
    "id": "Top_Off_Shoulder_Crop",
    "name": "Off Shoulder Crop",
    "th_name": "เสื้อครอปเปิดไหล่",
    "category": "Tops",
    "desc": "A soft stretchy ribbed cotton crop top resting delicately below the collarbones, exposing bare shoulders and stopping above the navel.",
    "th_desc": "เสื้อครอปผ้าริบเนื้อนุ่มยืดหยุ่น ขอบเสื้อปาดต่ำใต้ไหปลาร้าเปิดเปลือยหัวไหล่ทั้งสองข้าง ชายเสื้อสั้นเหนือสะดือ อวดหน้าท้องเพรียวบาง",
    "source": "default",
    "keys": [
      "Off Shoulder Crop Top",
      "Crop Top",
      "เสื้อครอปเปิดไหล่",
      "เสื้อเปิดไหล่"
    ]
  },
  {
    "id": "Top_Victorian_Corset",
    "name": "Victorian Corset",
    "th_name": "คอร์เซ็ทวิกตอเรียน",
    "category": "Tops",
    "desc": "A heavy damask brocade boned waist-cinching corset top with a sweetheart neckline, brass front busk clasps, and satin ribbon back lacing.",
    "th_desc": "คอร์เซ็ทสไตล์วิกตอเรียนตัดเย็บจากผ้าดามัสก์เสริมโครงเหล็กกระชับเอวคอด คอเว้ารูปหัวใจ ด้านหน้ามีตะขอเหล็กและด้านหลังร้อยเชือกริบบิ้นซาตินปรับระดับได้",
    "source": "default",
    "keys": [
      "Victorian Corset",
      "Corset Top",
      "คอร์เซ็ทวิกตอเรียน",
      "คอร์เซ็ท"
    ]
  },
  {
    "id": "Top_Sheer_Lace_Blouse",
    "name": "Sheer Lace Blouse",
    "th_name": "เสื้อลูกไม้ซีทรู",
    "category": "Tops",
    "desc": "A whispering sheer black floral lace button-down blouse with ruffled collar and cuffs, casting intricate floral shadows over bare skin.",
    "th_desc": "เสื้อเชิ้ตแขนยาวผ้าลูกไม้ซีทรูสีดำโปร่งแสงลวดลายดอกไม้วิจิตร คอเสื้อและปลายแขนจับจีบระบาย เผยเงาลูกไม้ทาบทับผิวเนียนอย่างน่าหลงใหล",
    "source": "default",
    "keys": [
      "Sheer Lace Blouse",
      "Lace Blouse",
      "เสื้อลูกไม้ซีทรู",
      "เสื้อลูกไม้"
    ]
  },
  {
    "id": "Top_Crisscross_Wrap",
    "name": "Crisscross Wrap",
    "th_name": "เสื้อพันผูกไขว้หน้า",
    "category": "Tops",
    "desc": "Stretchy modal fabric wide bands crossing over the breasts in an X-pattern and tying securely behind the spine, framing an underbust cutout.",
    "th_desc": "เสื้อแถบผ้ายืดเนื้อนุ่มพันไขว้ทับทรวงอกเป็นรูปกากบาท แล้วโอบไปผูกด้านหลัง เว้าโชว์ช่วงใต้ราวนมและหน้าท้องอย่างมีสไตล์",
    "source": "default",
    "keys": [
      "Crisscross Wrap Top",
      "Wrap Top",
      "เสื้อพันผูกไขว้หน้า",
      "เสื้อไขว้หน้า"
    ]
  },
  {
    "id": "Top_Bolero_Sleeves",
    "name": "Bolero Sleeves",
    "th_name": "เสื้อครอปแขนยาวโบเลโร่",
    "category": "Tops",
    "desc": "An ultra-crop minimalist knit shrug featuring long snug sleeves and a mock-neck collar, leaving the entire bust and torso uncovered.",
    "th_desc": "เสื้อครอปสั้นพิเศษสไตล์โบเลโร่ มีเพียงคอปกตั้งและแขนยาวแนบเนื้อ ปล่อยให้หน้าอกและลำตัวเปิดโล่ง เหมาะสำหรับใส่ทับบราหรือเกาะอก",
    "source": "default",
    "keys": [
      "Bolero Shrug Sleeves",
      "Arm Warmers",
      "เสื้อครอปแขนยาวโบเลโร่",
      "เสื้อโบเลโร่"
    ]
  },
  {
    "id": "Top_Metallic_Bandeau",
    "name": "Metallic Bandeau",
    "th_name": "เกาะอกเมทัลลิกแวววาว",
    "category": "Tops",
    "desc": "A liquid gold foil stretch bandeau top hugging the chest securely with inner silicone grip bands and catching vibrant light reflections.",
    "th_desc": "เสื้อเกาะอกฟอยล์สีทองเมทัลลิกแวววาวเหมือนทองคำเหลว แนบกระชับรอบอกด้วยแถบซิลิโคนด้านใน เล่นแสงเงาสวยงามทุกมุมมอง",
    "source": "default",
    "keys": [
      "Metallic Bandeau",
      "Gold Bandeau",
      "เกาะอกเมทัลลิกแวววาว",
      "เกาะอก"
    ]
  },
  {
    "id": "Top_Sheer_Mesh_Tee",
    "name": "Sheer Mesh Tee",
    "th_name": "เสื้อยืดตาข่ายซีทรู",
    "category": "Tops",
    "desc": "A boxy cropped black fine-mesh t-shirt completely transparent to showcase whatever lingerie or skin lies underneath.",
    "th_desc": "เสื้อยืดครอปทรงหลวมผ้าตาข่ายตาถี่สีดำ มองทะลุเห็นบราหรือผิวพรรณด้านในได้อย่างชัดเจน ให้ลุคสตรีทแฟชั่นผสมความเซ็กซี่",
    "source": "default",
    "keys": [
      "Sheer Mesh Tee",
      "Mesh Shirt",
      "เสื้อยืดตาข่ายซีทรู",
      "เสื้อตาข่าย"
    ]
  },
  {
    "id": "Top_Peasant_Blouse",
    "name": "Peasant Blouse",
    "th_name": "เสื้อบลาวส์สาวชาวไร่",
    "category": "Tops",
    "desc": "An elasticated white cotton milkmaid blouse with gathered ruffled neckline that sits off-the-shoulder, short puff sleeves, and a laced corset waist.",
    "th_desc": "เสื้อบลาวส์สาวชนบทผ้าฝ้ายสีขาว คอเสื้อดึงสม็อครูดระบายปาดไหล่ แขนพองตุ๊กตา และเชือกร้อยด้านหน้าคล้ายคอร์เซ็ทขนาดเล็ก",
    "source": "default",
    "keys": [
      "Peasant Blouse",
      "Milkmaid Top",
      "เสื้อบลาวส์สาวชาวไร่",
      "เสื้อชาวไร่"
    ]
  },
  {
    "id": "Top_Strappy_Sports_Bra",
    "name": "Strappy Sports Bra",
    "th_name": "สปอร์ตบราสายรัดไขว้",
    "category": "Tops",
    "desc": "A performance moisture-wicking athletic bra with a scoop front and an intricate web of crossing geometric elastic back straps.",
    "th_desc": "สปอร์ตบราออกกำลังกายเนื้อผ้าระบายอากาศได้ดี คอด้านหน้าทรงเว้าลึก ด้านหลังแต่งสายยางยืดไขว้กันเป็นลวดลายเรขาคณิตสุดประณีต",
    "source": "default",
    "keys": [
      "Strappy Sports Bra",
      "Gym Bra",
      "สปอร์ตบราสายรัดไขว้",
      "สปอร์ตบรา"
    ]
  },
  {
    "id": "Top_Satin_Cami",
    "name": "Satin Cami",
    "th_name": "เสื้อสายเดี่ยวผ้าซาติน",
    "category": "Tops",
    "desc": "A bias-cut emerald satin camisole with delicate spaghetti straps and scalloped black eyelash lace framing the deep V-neckline.",
    "th_desc": "เสื้อสายเดี่ยวผ้าซาตินสีเขียวมรกตตัดเย็บเฉียงทิ้งตัวเข้ารูป แต่งขอบคอวีลึกด้วยลูกไม้ขนตาสีดำบางเบา ให้สัมผัสเรียบลื่นนุ่มนวล",
    "source": "default",
    "keys": [
      "Satin Lace Camisole",
      "Silk Cami",
      "เสื้อสายเดี่ยวผ้าซาติน",
      "เสื้อสายเดี่ยว"
    ]
  },
  {
    "id": "Top_Front_Tie_Cardigan",
    "name": "Front Tie Cardigan",
    "th_name": "คาร์ดิแกนผูกโบว์หน้า",
    "category": "Tops",
    "desc": "A lightweight pastel knit long-sleeve crop cardigan fastened solely by a pair of delicate silk ribbons tied in a bow right at the bustline.",
    "th_desc": "เสื้อคาร์ดิแกนไหมพรมถักเนื้อบางเบาแขนยาว ติดกระดุมเปิดโล่ง เชื่อมต่อกันเพียงริบบิ้นผ้าไหมผูกโบว์ตรงกลางร่องอก",
    "source": "default",
    "keys": [
      "Front Tie Cardigan",
      "Tie Top",
      "คาร์ดิแกนผูกโบว์หน้า",
      "คาร์ดิแกน"
    ]
  },
  {
    "id": "Top_Dragon_Embroidered_Vest",
    "name": "Dragon Embroidered Vest",
    "th_name": "เสื้อกั๊กผ้าไหมปักดิ้นทอง",
    "category": "Tops",
    "desc": "A traditional Chinese red silk jacquard vest with gold metallic thread dragon embroidery, standing mandarin collar, and knotted frog closures.",
    "th_desc": "เสื้อกั๊กผ้าไหมจีนสีแดงสดทอลายในตัว ปักลายมังกรเหินด้วยดิ้นทองคำ คอจีนทรงตั้ง และกระดุมถักแบบจีนโบราณ",
    "source": "default",
    "keys": [
      "Dragon Silk Vest",
      "Oriental Vest",
      "เสื้อกั๊กผ้าไหมปักดิ้นทอง",
      "เสื้อกั๊กไหม"
    ]
  },
  {
    "id": "Bottom_Pleated_Tennis_Skirt",
    "name": "Pleated Tennis Skirt",
    "th_name": "กระโปรงเทนนิสจีบรอบ",
    "category": "Bottoms",
    "desc": "A crisp snowy white athletic mini skirt with sharp knife pleats, a wide fitted waistband, and an active sporty bounce.",
    "th_desc": "กระโปรงเทนนิสสั้นสีขาวสะอาดตา อัดจีบคมกริบรอบตัว ขอบเอวเรียบกระชับ พลิ้วไหวเด้งตามจังหวะก้าวเดินอย่างกระปรี้กระเปร่า",
    "source": "default",
    "keys": [
      "Pleated Tennis Skirt",
      "Tennis Skirt",
      "กระโปรงเทนนิสจีบรอบ",
      "กระโปรงเทนนิส"
    ]
  },
  {
    "id": "Bottom_Lace_Trim_Bloomers",
    "name": "Lace Trim Bloomers",
    "th_name": "กางเกงบลูมเมอร์ลูกไม้",
    "category": "Bottoms",
    "desc": "Puffy pastel pink cotton lounge shorts with elasticated frilly leg openings, delicate satin bows, and tiered eyelet lace trim.",
    "th_desc": "กางเกงบลูมเมอร์ขาสั้นทรงพองผ้าฝ้ายสีชมพูพาสเทล ขากางเกงรูดยางยืดแต่งระบายลูกไม้และโบว์ริบบิ้นซาติน ให้ลุคคุณหนูห้องนอนแสนหวาน",
    "source": "default",
    "keys": [
      "Lace Trim Bloomers",
      "Bloomers",
      "กางเกงบลูมเมอร์ลูกไม้",
      "บลูมเมอร์"
    ]
  },
  {
    "id": "Bottom_Side_Tie_Bikini",
    "name": "Side Tie Bikini",
    "th_name": "กางเกงบิกินี่ผูกข้าง",
    "category": "Bottoms",
    "desc": "Ultra-low rise swimwear bottoms in electric magenta with thin string straps tied in dainty easy-pull bows at each hipbone.",
    "th_desc": "กางเกงว่ายน้ำบิกินี่เอวต่ำสีบานเย็นสดใส ด้านข้างผูกด้วยสายเส้นเล็กเป็นโบว์บริเวณกระดูกสะโพกทั้งสองข้าง ถอดออกได้ง่ายดาย",
    "source": "default",
    "keys": [
      "Side Tie Bikini Bottoms",
      "Bikini Bottoms",
      "กางเกงบิกินี่ผูกข้าง",
      "บิกินี่ผูกข้าง"
    ]
  },
  {
    "id": "Bottom_High_Waist_Shorts",
    "name": "High Waist Shorts",
    "th_name": "กางเกงขาสั้นเอวสูงทรงวินเทจ",
    "category": "Bottoms",
    "desc": "Form-sculpting 1950s-inspired vintage high-rise denim shorts with copper button fly, rolled cuffs, and a snug fit around the hips.",
    "th_desc": "กางเกงยีนส์ขาสั้นเอวสูงสไตล์วินเทจยุค 50s ตัดเย็บเน้นส่วนโค้งเว้าของสะโพกและเอว ติดกระดุมทองแดงเรียงแถวและพับขอบขากางเกงเรียบร้อย",
    "source": "default",
    "keys": [
      "Vintage High Waist Shorts",
      "Denim Shorts",
      "กางเกงขาสั้นเอวสูงทรงวินเทจ",
      "กางเกงยีนส์เอวสูง"
    ]
  },
  {
    "id": "Bottom_Glossy_Vinyl_Miniskirt",
    "name": "Glossy Vinyl Miniskirt",
    "th_name": "มินิสเกิร์ตไวนิลเงาวับ",
    "category": "Bottoms",
    "desc": "A slick black patent vinyl micro skirt with an exposed full-length silver side zipper, shining with mirror-like reflections.",
    "th_desc": "มินิสเกิร์ตสั้นกุดทำจากไวนิลสีดำขัดเงาวับสะท้อนแสงราวกับกระจก โดดเด่นด้วยซิปรูดโลหะสีเงินยาวตลอดด้านข้าง",
    "source": "default",
    "keys": [
      "Glossy Vinyl Miniskirt",
      "Vinyl Skirt",
      "มินิสเกิร์ตไวนิลเงาวับ",
      "กระโปรงไวนิล"
    ]
  },
  {
    "id": "Bottom_Slit_Maxi_Skirt",
    "name": "Slit Maxi Skirt",
    "th_name": "กระโปรงยาวผ่าข้างสูง",
    "category": "Bottoms",
    "desc": "A floor-skimming jersey modal maxi skirt in burgundy, featuring a split that opens all the way up to the hip crest on one leg.",
    "th_desc": "กระโปรงยาวจรดพื้นผ้าเจอร์ซีย์สีแดงเบอร์กันดีทิ้งตัวสวย ผ่าข้างสูงยาวขึ้นไปจนถึงขอบสะโพก อวดเรียวขาเพรียวยามก้าวเดิน",
    "source": "default",
    "keys": [
      "High Slit Maxi Skirt",
      "Maxi Skirt",
      "กระโปรงยาวผ่าข้างสูง",
      "กระโปรงผ่าสูง"
    ]
  },
  {
    "id": "Bottom_Booty_Shorts",
    "name": "Booty Shorts",
    "th_name": "กางเกงขาสั้นบิวตี้ช็อต",
    "category": "Bottoms",
    "desc": "Tight athletic black spandex shorts with white contrast piping along the curved dolphin hem, hugging the glutes firmly.",
    "th_desc": "กางเกงขาสั้นแนบเนื้อผ้าสแปนเด็กซ์สีดำ กุ๊นขอบโค้งทรงดอลฟินด้วยผ้าสีขาว กระชับสะโพกและบั้นท้ายอย่างชัดเจน",
    "source": "default",
    "keys": [
      "Spandex Booty Shorts",
      "Booty Shorts",
      "กางเกงขาสั้นบิวตี้ช็อต",
      "กางเกงบิวตี้ช็อต"
    ]
  },
  {
    "id": "Bottom_Flared_Skater_Skirt",
    "name": "Flared Skater Skirt",
    "th_name": "กระโปรงสเก็ตเตอร์บาน",
    "category": "Bottoms",
    "desc": "A circle-cut stretchy scuba skater skirt that flares widely around the mid-thigh, swirling dramatically whenever turning.",
    "th_desc": "กระโปรงบานทรงสเก็ตเตอร์ตัดเย็บทรงวงกลมจากผ้าสกูบ้ายืดหยุ่น ชายกระโปรงบานสะพรั่งพลิ้วไหวอย่างร่าเริงทุกการหมุนตัว",
    "source": "default",
    "keys": [
      "Flared Skater Skirt",
      "Skater Skirt",
      "กระโปรงสเก็ตเตอร์บาน",
      "กระโปรงบาน"
    ]
  },
  {
    "id": "Bottom_Distressed_Jeans",
    "name": "Distressed Jeans",
    "th_name": "กางเกงยีนส์ขาดรอยขาด",
    "category": "Bottoms",
    "desc": "Low-slung faded indigo skinny denim jeans with heavy shredded distressing along the front thighs, knees, and rear pockets.",
    "th_desc": "กางเกงยีนส์สกินนี่เอวต่ำสีอินดิโก้ฟอก แต่งรอยขาดเส้นด้ายรุ่ยตามแนวต้นขาและหัวเข่า เผยผิวเนื้อด้านในสไตล์สตรีทเซอร์",
    "source": "default",
    "keys": [
      "Distressed Skinny Jeans",
      "Ripped Jeans",
      "กางเกงยีนส์ขาดรอยขาด",
      "ยีนส์ขาด"
    ]
  },
  {
    "id": "Bottom_Leather_Micro_Skirt",
    "name": "Leather Micro Skirt",
    "th_name": "ไมโครสเกิร์ตหนังแท้",
    "category": "Bottoms",
    "desc": "An ultra-daring 7-inch black lambskin leather skirt with snap-button front and raw cut hem, barely covering the essentials.",
    "th_desc": "ไมโครสเกิร์ตหนังแกะแท้สีดำความยาวเพียง 7 นิ้ว ติดกระดุมแป๊กด้านหน้า ชายกระโปรงตัดขอบเปลือย เผยเรียวขาอย่างถึงที่สุด",
    "source": "default",
    "keys": [
      "Leather Micro Skirt",
      "Leather Skirt",
      "ไมโครสเกิร์ตหนังแท้",
      "กระโปรงหนัง"
    ]
  },
  {
    "id": "Bottom_Sarong_Wrap",
    "name": "Sarong Wrap",
    "th_name": "ผ้าพันเอวสไตล์ซารอง",
    "category": "Bottoms",
    "desc": "A semi-translucent floral chiffon beach wrap tied loosely at the hip, fluttering open with sea breezes to reveal the bikini beneath.",
    "th_desc": "ผ้าพันเอวผืนบางลายดอกไม้เมืองร้อนผ้าชีฟอง ผูกปมหลวมๆ บริเวณสะโพก พลิ้วเปิดตามแรงลมเผยให้เห็นชุดว่ายน้ำด้านใน",
    "source": "default",
    "keys": [
      "Tropical Chiffon Sarong",
      "Sarong",
      "ผ้าพันเอวสไตล์ซารอง",
      "ผ้าซารอง"
    ]
  },
  {
    "id": "Bottom_Cheeky_Boy_Shorts",
    "name": "Cheeky Boy Shorts",
    "th_name": "กางเกงในบอยช็อตต์ผ้าฝ้าย",
    "category": "Bottoms",
    "desc": "Comfortable heather grey ribbed cotton boy shorts with an elastic white logo waistband and curved cheeky leg cut.",
    "th_desc": "กางเกงในทรงบอยช็อตต์ผ้าฝ้ายริบสีเทาเนื้อนุ่ม ขอบเอวยางยืดสีขาวสไตล์สปอร์ต เว้าโชว์แก้มก้นเล็กน้อยเพื่อความสบายและมีเสน่ห์",
    "source": "default",
    "keys": [
      "Cheeky Cotton Boy Shorts",
      "Boy Shorts",
      "กางเกงในบอยช็อตต์ผ้าฝ้าย",
      "บอยช็อตต์"
    ]
  },
  {
    "id": "Dress_Backless_Silk_Gown",
    "name": "Backless Silk Gown",
    "th_name": "ชุดราตรีผ้าไหมเปิดหลังลึก",
    "category": "Dresses",
    "desc": "A sweeping floor-length midnight blue silk dress with halter neckline, completely backless all the way down to the tailbone.",
    "th_desc": "ชุดราตรียาวผ้าไหมแท้สีน้ำเงินมิดไนท์บลู คอคล้องระบายสวยงาม แผ่นหลังเปิดโล่งลึกจรดสะโพกด้านล่าง ให้ลุคพรมแดงหรูหราสง่างาม",
    "source": "default",
    "keys": [
      "Backless Silk Evening Gown",
      "Backless Gown",
      "ชุดราตรีผ้าไหมเปิดหลังลึก",
      "ชุดราตรีเปิดหลัง"
    ]
  },
  {
    "id": "Dress_Gothic_Velvet_Gown",
    "name": "Gothic Velvet Gown",
    "th_name": "ชุดราตรีกำมะหยี่กอธิค",
    "category": "Dresses",
    "desc": "Heavy royal purple crushed velvet dress with square neckline, flared trumpet bell sleeves, and a gold-laced corset bodice.",
    "th_desc": "ชุดราตรียาวผ้ากำมะหยี่สีม่วงเข้ม คอเหลี่ยมเปิดเนินอก แขนเสื้อบานทรงทรัมเป็ต และช่วงเอวร้อยเชือกดิ้นทองทรงคอร์เซ็ท",
    "source": "default",
    "keys": [
      "Gothic Velvet Gown",
      "Gothic Gown",
      "ชุดราตรีกำมะหยี่กอธิค",
      "ชุดราตรีกอธิค"
    ]
  },
  {
    "id": "Dress_Bandage_Bodycon",
    "name": "Bandage Bodycon",
    "th_name": "เดรสรัดรูปผ้ายืดแบนเดจ",
    "category": "Dresses",
    "desc": "A thick elastane bandage dress woven from sculpted cross-wrapping strips in scarlet red, holding and emphasizing curves firmly.",
    "th_desc": "เดรสบอดี้คอนผ้ายืดแบนเดจสีแดงเพลิง แถบผ้ายืดทอหนาพิเศษโอบรัดสรีระเป็นลอนกระชับ ช่วยเน้นส่วนเว้าส่วนโค้งรูปนาฬิกาทรายอย่างทรงพลัง",
    "source": "default",
    "keys": [
      "Bandage Bodycon Dress",
      "Bodycon Dress",
      "เดรสรัดรูปผ้ายืดแบนเดจ",
      "เดรสรัดรูป"
    ]
  },
  {
    "id": "Dress_Chinese_Qipao_Mini",
    "name": "Chinese Qipao Mini",
    "th_name": "กี่เพ้าสั้นผ่าข้าง",
    "category": "Dresses",
    "desc": "A modern shortened scarlet silk qipao featuring peony brocade, teardrop chest keyhole, mandarin collar, and thigh-high side slits.",
    "th_desc": "ชุดกี่เพ้าผ้าไหมสั้นสีแดงสดลายดอกโบตั๋น คอจีนทรงสง่า เจาะช่องเว้าตรงกลางอก และผ่าข้างสูงเปิดต้นขาขาวเนียน",
    "source": "default",
    "keys": [
      "Mini Silk Qipao",
      "Cheongsam Mini",
      "กี่เพ้าสั้นผ่าข้าง",
      "กี่เพ้าสั้น"
    ]
  },
  {
    "id": "Dress_Summer_Floral_Wrap",
    "name": "Summer Floral Wrap",
    "th_name": "เดรสป้ายหน้ารับลมร้อน",
    "category": "Dresses",
    "desc": "A fluttering lightweight chiffon wrap dress decorated with pastel blossoms, a V-neckline tied at the waist, and ruffled hem.",
    "th_desc": "ชุดเดรสป้ายหน้าผ้าชีฟองเนื้อเบาพิมพ์ลายดอกไม้พาสเทล คอวีป้ายผูกริบบิ้นข้างเอว ชายกระโปรงระบายพลิ้วไหวรับลมฤดูร้อนอย่างอ่อนหวาน",
    "source": "default",
    "keys": [
      "Summer Floral Wrap Dress",
      "Wrap Dress",
      "เดรสป้ายหน้ารับลมร้อน",
      "เดรสป้ายหน้า"
    ]
  },
  {
    "id": "Dress_Trench_Coat_Dress",
    "name": "Trench Coat Dress",
    "th_name": "เดรสเทรนช์โค้ทมีเข็มขัด",
    "category": "Dresses",
    "desc": "A tailored beige cotton gabardine double-breasted trench coat dress worn buttoned tight with an oversized belt cinch.",
    "th_desc": "เดรสสไตล์เทรนช์โค้ทกระดุมสองแถวสีเบจ คัตติ้งเนี้ยบ คาดเข็มขัดหัวเหล็กเส้นโตกระชับเอว ให้ลุคสายลับสาวทรงเสน่ห์",
    "source": "default",
    "keys": [
      "Belted Trench Dress",
      "Trench Dress",
      "เดรสเทรนช์โค้ทมีเข็มขัด",
      "เดรสโค้ท"
    ]
  },
  {
    "id": "Dress_Sheer_Lace_Maxi",
    "name": "Sheer Lace Maxi",
    "th_name": "เดรสยาวลูกไม้โปร่งแสง",
    "category": "Dresses",
    "desc": "An ethereal black sheer corded-lace maxi dress worn as an overlay, draping all the way to the floor in delicate floral patterns.",
    "th_desc": "ชุดเดรสยาวผ้าลูกไม้ซีทรูสีดำโปร่งแสงทั้งตัว ลวดลายลูกไม้ถักแน่น ลากชายยาวจรดพื้น อวดสรีระและชุดชั้นในด้านในอย่างมีชั้นเชิง",
    "source": "default",
    "keys": [
      "Sheer Lace Maxi Dress",
      "Lace Maxi",
      "เดรสยาวลูกไม้โปร่งแสง",
      "เดรสลูกไม้"
    ]
  },
  {
    "id": "Dress_Cocktail_Sparkle",
    "name": "Cocktail Sparkle",
    "th_name": "เดรสค็อกเทลระยิบระยับ",
    "category": "Dresses",
    "desc": "A mini party dress encrusted with shimmering champagne gold sequins that catch every ray of ambient party lighting.",
    "th_desc": "ชุดเดรสสั้นออกงานปาร์ตี้ค็อกเทล ปักเลื่อมสีแชมเปญโกลด์ประกายแวววาวรอบตัว สะท้อนแสงไฟวิบวับเปล่งประกายในค่ำคืนราตรี",
    "source": "default",
    "keys": [
      "Sparkling Sequin Cocktail Dress",
      "Sequin Dress",
      "เดรสค็อกเทลระยิบระยับ",
      "เดรสเลื่อม"
    ]
  },
  {
    "id": "Dress_Knit_Sweater_Dress",
    "name": "Knit Sweater Dress",
    "th_name": "เดรสไหมพรมถักเนื้อนุ่ม",
    "category": "Dresses",
    "desc": "A cozy cream-colored chunky cable-knit sweater dress with a foldover off-the-shoulder neckline, hugging down to mid-thigh.",
    "th_desc": "เดรสไหมพรมถักเปียเนื้อหนานุ่มสีครีม คอพับกว้างปาดเปิดไหล่เนียน ชายกระโปรงยาวคลุมถึงกึ่งกลางต้นขา ให้ความรู้สึกอบอุ่นและเซ็กซี่ในคราวเดียว",
    "source": "default",
    "keys": [
      "Off-Shoulder Sweater Dress",
      "Sweater Dress",
      "เดรสไหมพรมถักเนื้อนุ่ม",
      "เดรสไหมพรม"
    ]
  },
  {
    "id": "Dress_Gothic_Lolita_Jumper",
    "name": "Gothic Lolita Jumper",
    "th_name": "จัมเปอร์สเกิร์ตโลลิต้า",
    "category": "Dresses",
    "desc": "A Victorian-style black velvet jumper dress with crossed shoulder straps, lace-up front corset panel, and tiered frilly skirt.",
    "th_desc": "ชุดจัมเปอร์สเกิร์ต (JSK) ผ้ากำมะหยี่สีดำสไตล์วิกตอเรียน สายเอี๊ยมไขว้หลัง ด้านหน้าแต่งเชือกร้อยคอร์เซ็ทและกระโปรงสุ่มระบายลูกไม้เป็นชั้น",
    "source": "default",
    "keys": [
      "Lolita Jumper Skirt Dress",
      "JSK Lolita",
      "จัมเปอร์สเกิร์ตโลลิต้า",
      "ชุดโลลิต้า"
    ]
  },
  {
    "id": "Dress_Kimono_Mini_Robe",
    "name": "Kimono Mini Robe",
    "th_name": "ยูกาตะสั้นประยุกต์",
    "category": "Dresses",
    "desc": "A thigh-skimming glossy satin kimono mini dress in black and gold cherry blossoms, cinched tightly with a stiff brocade obi sash.",
    "th_desc": "ชุดกิโมโนสั้นประยุกต์ตัดเย็บจากผ้าซาตินดำพิมพ์ลายดอกซากุระทอง ชายกระโปรงสั้นเหนือเข่า คาดโอบิผ้าดิ้นทองหนากระชับเอวสวยงาม",
    "source": "default",
    "keys": [
      "Short Kimono Robe Dress",
      "Mini Kimono",
      "ยูกาตะสั้นประยุกต์",
      "กิโมโนสั้น"
    ]
  },
  {
    "id": "Fullbody_Metallic_Catsuit",
    "name": "Metallic Catsuit",
    "th_name": "แคทสูทเมทัลลิกประกายมุก",
    "category": "Fullbody Suits",
    "desc": "A full-length liquid pearl-silver metallic spandex catsuit covering from high neck to ankles, with a two-way hidden spine zipper.",
    "th_desc": "ชุดแคทสูทเต็มตัวผ้ายืดเมทัลลิกสีเงินเหลือบมุกแนบเนื้อตั้งแต่ลำคอจรดข้อเท้า มาพร้อมซิปซ่อนสองทางด้านหลัง รัดกระชับสัดส่วนทุกตารางนิ้ว",
    "source": "default",
    "keys": [
      "Metallic Catsuit",
      "Liquid Catsuit",
      "แคทสูทเมทัลลิกประกายมุก",
      "แคทสูท"
    ]
  },
  {
    "id": "Fullbody_Fishnet_Bodysuit",
    "name": "Fishnet Bodysuit",
    "th_name": "บอดี้สูทตาข่ายเต็มตัว",
    "category": "Fullbody Suits",
    "desc": "A seamless stretchy black fishnet full-body stocking wrapping the torso, arms, and legs in fine geometric diamond netting.",
    "th_desc": "ชุดบอดี้สต็อกกิ้งผ้าตาข่ายยืดหยุ่นไร้ตะเข็บสีดำขลับ โอบรัดเรือนร่างตั้งแต่ลำตัว แขน และเรียวขาด้วยลวดลายตาข่ายข้าวหลามตัดแนบเนียน",
    "source": "default",
    "keys": [
      "Fishnet Bodystocking",
      "Fishnet Suit",
      "บอดี้สูทตาข่ายเต็มตัว",
      "ชุดตาข่ายเต็มตัว"
    ]
  },
  {
    "id": "Fullbody_Diving_Wetsuit",
    "name": "Diving Wetsuit",
    "th_name": "ชุดเว็ทสูทดำน้ำสปอร์ต",
    "category": "Fullbody Suits",
    "desc": "A sleek neoprene surfing wetsuit with high neck, bright turquoise side contouring panels, and a long pull-cord back zipper.",
    "th_desc": "ชุดเว็ทสูทดำน้ำผ้านีโอพรีนเนื้อนุ่มกระชับ คอตั้ง ตัดต่อแถบสีฟ้าเทอร์ควอยซ์ด้านข้างช่วยพรางและขับเน้นสรีระ พร้อมสายดึงซิปยาวด้านหลัง",
    "source": "default",
    "keys": [
      "Sporty Diving Wetsuit",
      "Wetsuit",
      "ชุดเว็ทสูทดำน้ำสปอร์ต",
      "ชุดดำน้ำ"
    ]
  },
  {
    "id": "Fullbody_Lace_Bodysuit",
    "name": "Lace Bodysuit",
    "th_name": "บอดี้สูทลูกไม้โปร่ง",
    "category": "Fullbody Suits",
    "desc": "A sheer long-sleeve black lace bodysuit with snap-crotch closure, scalloped neckline, and floral tracings mapping the torso.",
    "th_desc": "ชุดบอดี้สูทแขนยาวผ้าลูกไม้โปร่งแสงสีดำสนิท ลวดลายดอกไม้เลื้อยผ่านลำตัว คอเว้าหยัก และกระดุมแป๊กตรงเป้าเปิดปิดสะดวก",
    "source": "default",
    "keys": [
      "Floral Lace Bodysuit",
      "Lace Bodysuit",
      "บอดี้สูทลูกไม้โปร่ง",
      "บอดี้สูทลูกไม้"
    ]
  },
  {
    "id": "Fullbody_High_Cut_Leotard",
    "name": "High Cut Leotard",
    "th_name": "ลีโอตาร์ดเว้าขาสูงพิเศษ",
    "category": "Fullbody Suits",
    "desc": "A glossy neon pink nylon leotard cut ultra-high above the hip bones in vintage 1980s fitness style, accentuating leg length.",
    "th_desc": "ชุดลีโอตาร์ดผ้านิยมยุค 80s สีชมพูนีออนเงาวาว เว้าโคนขาสูงลิ่วขึ้นไปเหนือแนวกระดูกสะโพก ช่วยขับเน้นให้เรียวขาดูยาวเพรียวสะกดสายตา",
    "source": "default",
    "keys": [
      "80s High Cut Leotard",
      "Aerobic Leotard",
      "ลีโอตาร์ดเว้าขาสูงพิเศษ",
      "ลีโอตาร์ด"
    ]
  },
  {
    "id": "Fullbody_SciFi_Pilot_Suit",
    "name": "SciFi Pilot Suit",
    "th_name": "ชุดนักบินไซไฟสูญญากาศ",
    "category": "Fullbody Suits",
    "desc": "A pressurized EVA pilot suit with flexible segmented joints, spine interface nodes, matte charcoal finish, and crimson chest armor.",
    "th_desc": "ชุดปลั๊กสูทนักบินหุ่นรบไซไฟสีเทาเข้มตัดเกราะอกสีแดง เสริมข้อต่อยืดหยุ่นรองรับแรงกดอากาศและพอร์ตเชื่อมต่อระบบประสาทด้านหลัง",
    "source": "default",
    "keys": [
      "SciFi Pilot Plugsuit",
      "Pilot Suit",
      "ชุดนักบินไซไฟสูญญากาศ",
      "ชุดปลั๊กสูท"
    ]
  },
  {
    "id": "Fullbody_Harness_Unitard",
    "name": "Harness Unitard",
    "th_name": "ยูนิคอร์นสูทสายรัดบอนเดจ",
    "category": "Fullbody Suits",
    "desc": "A matte black seamless unitard overlaid with an integrated web of faux-leather harness straps and chrome O-rings contouring the bust and thighs.",
    "th_desc": "ชุดยูนิคอร์นสูทแนบเนื้อสีดำด้านที่เย็บติดสายรัดหนังเทียมและห่วงเงินโอริงรอบอกและโคนขา ผสานแฟชั่นชุดแนบเนื้อและบอนเดจอย่างมีระดับ",
    "source": "default",
    "keys": [
      "Bondage Harness Unitard",
      "Harness Unitard",
      "ยูนิคอร์นสูทสายรัดบอนเดจ",
      "ยูนิคอร์นสูท"
    ]
  },
  {
    "id": "Legwear_Lace_Top_StayUps",
    "name": "Lace StayUps",
    "th_name": "ถุงน่องสเตย์อัพขอบลูกไม้",
    "category": "Legwear",
    "desc": "Sheer 15-denier glossy black thigh-high stockings with wide scalloped lace bands backed by hidden silicone gripper strips.",
    "th_desc": "ถุงน่องยาวระดับต้นขาเนื้อเชียร์บาง 15 ดีเนียร์ ขอบลูกไม้ลูกฟูกกว้างแต่งแถบซิลิโคนกันลื่นด้านใน เกาะกระชับต้นขาแน่นโดยไม่ต้องใช้สายรัด",
    "source": "default",
    "keys": [
      "Lace Top Stay-Up Stockings",
      "Stay Ups",
      "ถุงน่องสเตย์อัพขอบลูกไม้",
      "ถุงน่องสเตย์อัพ"
    ]
  },
  {
    "id": "Legwear_Diamond_Fishnets",
    "name": "Diamond Fishnets",
    "th_name": "ถุงน่องตาข่ายลายเพชร",
    "category": "Legwear",
    "desc": "Intricate micro-fishnet tights woven into a repeating diamond geometric lattice pattern, accentuating leg definition.",
    "th_desc": "ถุงน่องตาข่ายเส้นละเอียดทอลายตารางเพชรเรขาคณิต ช่วยสร้างมิติเงาและเน้นกล้ามเนื้อเรียวขาให้ดูเพรียวสวยน่ามอง",
    "source": "default",
    "keys": [
      "Diamond Pattern Fishnets",
      "Diamond Fishnets",
      "ถุงน่องตาข่ายลายเพชร",
      "ถุงน่องตาข่าย"
    ]
  },
  {
    "id": "Legwear_Thigh_High_Leather_Boots",
    "name": "Thigh High Leather Boots",
    "th_name": "รองเท้าบูทหนังสูงเหนือเข่า",
    "category": "Legwear",
    "desc": "Glossy black patent leather stiletto boots rising high past the knees, with full inner zippers and razor-sharp heels.",
    "th_desc": "รองเท้าบูทหนังแท้ส้นเข็มสีดำขัดเงาวับ ทรงสูงขึ้นไปเหนือหัวเข่าถึงกึ่งกลางต้นขา ซิปยาวด้านใน ส้นแหลมคมกริบเพิ่มความมั่นใจ",
    "source": "default",
    "keys": [
      "Thigh-High Leather Stiletto Boots",
      "Thigh High Boots",
      "รองเท้าบูทหนังสูงเหนือเข่า",
      "บูทหนังสูง"
    ]
  },
  {
    "id": "Legwear_Striped_Knee_Socks",
    "name": "Striped Knee Socks",
    "th_name": "ถุงเท้าลายขวางยาวเหนือเข่า",
    "category": "Legwear",
    "desc": "Soft ribbed cotton thigh-high socks with alternating horizontal sky-blue and white stripes, popular in Japanese schoolgirl fashion.",
    "th_desc": "ถุงเท้ายาวเหนือเข่าผ้าริบคอตตอนเนื้อนุ่มลายขวางสลับสีขาว-ฟ้าพาสเทล สไตล์อะนิเมะยอดนิยม ให้ลุคน่ารักสดใสขี้เล่น",
    "source": "default",
    "keys": [
      "Striped Anime Thigh Socks",
      "Thigh High Socks",
      "ถุงเท้าลายขวางยาวเหนือเข่า",
      "ถุงเท้ายาว"
    ]
  },
  {
    "id": "Legwear_Wet_Look_Leggings",
    "name": "Wet Look Leggings",
    "th_name": "เลกกิ้งหนังเทียมเงาเปียก",
    "category": "Legwear",
    "desc": "Form-hugging black polyurethane stretch leggings with high-gloss liquid wet-look sheen, molding smoothly over hips and calves.",
    "th_desc": "กางเกงเลกกิ้งผ้ายืดเคลือบโพลียูรีเทนสีดำเงาวับราวกับเปียกน้ำ โอบกระชับสะโพกและเรียวขาได้อย่างแนบเนียนทุกสัดส่วน",
    "source": "default",
    "keys": [
      "Wet Look Faux-Leather Leggings",
      "Wet Look Leggings",
      "เลกกิ้งหนังเทียมเงาเปียก",
      "เลกกิ้งหนัง"
    ]
  },
  {
    "id": "Legwear_Garter_Leg_Harness",
    "name": "Garter Leg Harness",
    "th_name": "สายรัดต้นขาฮาร์เนสคู่",
    "category": "Legwear",
    "desc": "Dual black faux-leather thigh bands linked with silver O-rings, studded eyelets, and dangling elastic clips for stockings.",
    "th_desc": "สายรัดต้นขาหนังเทียมสีดำเส้นคู่ เชื่อมต่อด้วยห่วงเงินโอริง ตาไก่โลหะ และคลิปยางยืดสำหรับหนีบถุงน่อง สไตล์พังก์แฟชั่นสุดเปรี้ยว",
    "source": "default",
    "keys": [
      "Double Leg Harness & Garters",
      "Leg Harness",
      "สายรัดต้นขาฮาร์เนสคู่",
      "สายรัดต้นขา"
    ]
  },
  {
    "id": "Misc_Boyfriend_Shirt",
    "name": "Boyfriend Shirt",
    "th_name": "เสื้อเชิ้ตโอเวอร์ไซส์ผู้ชาย",
    "category": "Daywear & Misc",
    "desc": "An oversized crisp white cotton button-up shirt worn loose over bare skin, falling to mid-thigh with rolled sleeves and unbuttoned collar.",
    "th_desc": "เสื้อเชิ้ตผ้าฝ้ายสีขาวตัวโคร่งของผู้ชาย สวมคลุมบนผิวเปลือยเปล่าอย่างหลวมๆ ชายเสื้อยาวคลุมถึงกึ่งกลางต้นขา พับแขนเสื้อและปลดกระดุมบนเผยไหปลาร้า",
    "source": "default",
    "keys": [
      "Oversized Boyfriend Shirt",
      "Boyfriend Shirt",
      "เสื้อเชิ้ตโอเวอร์ไซส์ผู้ชาย",
      "เสื้อเชิ้ตโอเวอร์ไซส์"
    ]
  },
  {
    "id": "Misc_Silk_Pajama_Set",
    "name": "Silk Pajama Set",
    "th_name": "ชุดนอนผ้าไหมซาตินสองชิ้น",
    "category": "Daywear & Misc",
    "desc": "A champagne silk pajama set featuring a short-sleeve button-down top with white piping, paired with matching loose drawstring shorts.",
    "th_desc": "ชุดนอนผ้าไหมซาตินสีแชมเปญสองชิ้น เสื้อคอปกแขนสั้นกุ๊นขอบขาวคู่กับกางเกงขาสั้นเอวผูกสาย สัมผัสลื่นสบายผิวสำหรับพักผ่อนยามค่ำคืน",
    "source": "default",
    "keys": [
      "Silk Satin Pajama Set",
      "Silk Pajamas",
      "ชุดนอนผ้าไหมซาตินสองชิ้น",
      "ชุดนอนผ้าไหม"
    ]
  },
  {
    "id": "Misc_Oversized_Zip_Hoodie",
    "name": "Oversized Zip Hoodie",
    "th_name": "เสื้อฮู้ดดี้ซิปโอเวอร์ไซส์",
    "category": "Daywear & Misc",
    "desc": "An oversized soft fleece grey zip hoodie worn long enough to substitute as a mini dress, with the zipper pulled halfway down.",
    "th_desc": "เสื้อฮู้ดดี้ผ้าฟลีซสีเทาตัวใหญ่พิเศษยาวคลุมสะโพกจนใส่แทนมินิเดรสได้ รูดซิปครึ่งอก แขนเสื้อยาวคลุมมือ ให้ลุคชิลล์ๆ สบายๆ",
    "source": "default",
    "keys": [
      "Baggy Zip-Up Hoodie",
      "Zip Hoodie",
      "เสื้อฮู้ดดี้ซิปโอเวอร์ไซส์",
      "เสื้อฮู้ดดี้"
    ]
  },
  {
    "id": "Misc_Plaid_School_Blazer",
    "name": "Plaid School Blazer",
    "th_name": "เสื้อเบลเซอร์สูทนักเรียน",
    "category": "Daywear & Misc",
    "desc": "A tailored navy blue school uniform blazer with brass crest buttons, tartan collar lining, and fitted waistline.",
    "th_desc": "เสื้อสูทเบลเซอร์เครื่องแบบนักเรียนสีกรมท่าคัตติ้งเข้ารูป ติดกระดุมทองเหลืองปั๊มตราโรงเรียน และปกเสื้อซับในผ้าลายสก็อต",
    "source": "default",
    "keys": [
      "Plaid School Blazer",
      "School Blazer",
      "เสื้อเบลเซอร์สูทนักเรียน",
      "เบลเซอร์นักเรียน"
    ]
  },
  {
    "id": "Misc_Bathrobe_Sash",
    "name": "Bathrobe Sash",
    "th_name": "เสื้อคลุมอาบน้ำผ้าขนหนู",
    "category": "Daywear & Misc",
    "desc": "A thick snowy white terrycloth bathrobe casually cinched at the waist with an oversized belt, sliding slightly off one shoulder.",
    "th_desc": "เสื้อคลุมอาบน้ำผ้าขนหนูสีขาวหนานุ่ม ผูกสายคาดเอวหลวมๆ คอเสื้อเปิดกว้างและเลื่อนหลุดไหล่ข้างหนึ่ง เผยผิวเนียนหลังอาบน้ำเสร็จใหม่ๆ",
    "source": "default",
    "keys": [
      "Plush Terry Bathrobe",
      "Bathrobe",
      "เสื้อคลุมอาบน้ำผ้าขนหนู",
      "เสื้อคลุมอาบน้ำ"
    ]
  },
  {
    "id": "Misc_Denim_Overalls",
    "name": "Denim Overalls",
    "th_name": "ชุดเอี๊ยมยีนส์ขาสั้น",
    "category": "Daywear & Misc",
    "desc": "Playful vintage denim shortalls worn with one shoulder strap unbuttoned and hanging loose over a cropped top or bikini.",
    "th_desc": "ชุดเอี๊ยมกางเกงยีนส์ขาสั้นสไตล์วินเทจ ปลดสายเอี๊ยมข้างหนึ่งทิ้งตัวลงอย่างขี้เล่น สวมทับเสื้อครอปหรือบิกินี่ตัวโปรด",
    "source": "default",
    "keys": [
      "Shortall Denim Overalls",
      "Denim Overalls",
      "ชุดเอี๊ยมยีนส์ขาสั้น",
      "เอี๊ยมยีนส์"
    ]
  },
  {
    "id": "Misc_Silk_Yukata_Robe",
    "name": "Silk Yukata Robe",
    "th_name": "ยูกาตะผ้าไหมคลุมไหล่",
    "category": "Daywear & Misc",
    "desc": "A lightweight white cotton yukata printed with indigo morning glories, worn loosely with an uncinched obi belt for summer festival ease.",
    "th_desc": "ชุดยูกาตะฤดูร้อนผ้าฝ้ายสีขาวพิมพ์ลายดอกมอร์นิ่งกลอรี่สีคราม สวมใส่อย่างสบายๆ โดยคลายสายรัดโอบิ เหมาะกับบรรยากาศงานเทศกาลฤดูร้อน",
    "source": "default",
    "keys": [
      "Floral Summer Yukata",
      "Summer Yukata",
      "ยูกาตะผ้าไหมคลุมไหล่",
      "ยูกาตะฤดูร้อน"
    ]
  },
  {
    "id": "Misc_Turtleneck_Poncho",
    "name": "Turtleneck Poncho",
    "th_name": "ผ้าคลุมปอนโชไหมพรมคอเต่า",
    "category": "Daywear & Misc",
    "desc": "A voluminous knit poncho in camel wool featuring an oversized foldover turtleneck collar and fringe tassels swaying with movement.",
    "th_desc": "ผ้าคลุมปอนโชไหมพรมวูลสีคาเมล คอเต่าพับหนาตัวโต ชายผ้าคลุมทิ้งตัวแต่งพู่ระบายที่แกว่งไหวตามการก้าวเดิน ให้ความอบอุ่นมีสไตล์",
    "source": "default",
    "keys": [
      "Chunky Turtleneck Poncho",
      "Knit Poncho",
      "ผ้าคลุมปอนโชไหมพรมคอเต่า",
      "ผ้าคลุมปอนโช"
    ]
  },
  {
    "id": "Misc_Faux_Fur_Coat",
    "name": "Faux Fur Coat",
    "th_name": "เสื้อโค้ทขนสัตว์เทียมหรูหรา",
    "category": "Daywear & Misc",
    "desc": "A plush snowy-white faux-fur long coat draped casually over the shoulders, adding instant Hollywood glamour to any lingerie or outfit.",
    "th_desc": "เสื้อโค้ทขนสัตว์เทียมหนานุ่มสีขาวราวหิมะ สวมคลุมไหล่แบบสบายๆ เพิ่มความหรูหราสไตล์ดาราฮอลลีวูดให้กับชุดด้านในทันตาเห็น",
    "source": "default",
    "keys": [
      "Glamour Faux-Fur Coat",
      "Fur Coat",
      "เสื้อโค้ทขนสัตว์เทียมหรูหรา",
      "โค้ทขนสัตว์"
    ]
  },
  {
    "id": "Misc_Ribbed_Sleep_Tank",
    "name": "Ribbed Sleep Tank",
    "th_name": "เสื้อกล้ามผ้าริบนอนสบาย",
    "category": "Daywear & Misc",
    "desc": "A fitted thin heather grey ribbed cotton tank top with scooped neckline, soft and semi-sheer from frequent washing.",
    "th_desc": "เสื้อกล้ามผ้าริบคอตตอนสีเทาอ่อน คอกว้างเว้าลึก เนื้อผ้านุ่มบางเบาแนบเนื้อ สวมใส่สบายสำหรับนอนหลับพักผ่อน",
    "source": "default",
    "keys": [
      "Ribbed Cotton Sleep Tank",
      "Sleep Tank",
      "เสื้อกล้ามผ้าริบนอนสบาย",
      "เสื้อกล้าม"
    ]
  },
  {
    "id": "Misc_Lab_Coat",
    "name": "Lab Coat",
    "th_name": "เสื้อกาวน์นักวิจัยสีขาว",
    "category": "Daywear & Misc",
    "desc": "A starched white knee-length scientific lab coat worn unbuttoned, billowing open over casual wear or revealing attire.",
    "th_desc": "เสื้อกาวน์นักวิจัยสีขาวสะอาดความยาวระดับเข่า ปลดกระดุมเปิดกว้าง สะบัดพลิ้วไสวเผยให้เห็นชุดสวยที่สวมอยู่ด้านใน",
    "source": "default",
    "keys": [
      "Scientist Lab Coat",
      "Lab Coat",
      "เสื้อกาวน์นักวิจัยสีขาว",
      "เสื้อกาวน์"
    ]
  },
  {
    "id": "Misc_Frilly_Chef_Apron",
    "name": "Frilly Chef Apron",
    "th_name": "ผ้ากันเปื้อนพ่อครัวกุ๊กกิ๊ก",
    "category": "Daywear & Misc",
    "desc": "A sweet pastel pink cotton bib apron trimmed with white eyelet lace ruffles, tied in a neat bow behind the waist.",
    "th_desc": "ผ้ากันเปื้อนทำครัวผ้าฝ้ายสีชมพูพาสเทล แต่งระบายลูกไม้ฉลุสีขาวรอบตัว ผูกโบว์ด้านหลังอย่างเรียบร้อยน่ารัก",
    "source": "default",
    "keys": [
      "Frilly Kitchen Apron",
      "Kitchen Apron",
      "ผ้ากันเปื้อนพ่อครัวกุ๊กกิ๊ก",
      "ผ้ากันเปื้อน"
    ]
  },
  {
    "id": "Misc_Velour_Tracksuit",
    "name": "Velour Tracksuit",
    "th_name": "ชุดแทร็คสูทผ้ากำมะหยี่",
    "category": "Daywear & Misc",
    "desc": "A retro 2000s baby pink velour zip-up hoodie jacket with rhinestone zipper pull and matching low-rise track pants.",
    "th_desc": "เสื้อแจ็คเก็ตแทร็คสูทผ้ากำมะหยี่สีชมพูเบบี้พิงค์สไตล์ Y2K หัวซิปประดับเพชรคริสตัล สวมใส่เข้าคู่กับกางเกงวอร์มเอวต่ำ",
    "source": "default",
    "keys": [
      "Y2K Velour Tracksuit Jacket",
      "Velour Tracksuit",
      "ชุดแทร็คสูทผ้ากำมะหยี่",
      "แทร็คสูท"
    ]
  },
  {
    "id": "Misc_Kimono_Cardigan_Haori",
    "name": "Kimono Cardigan Haori",
    "th_name": "เสื้อฮาโอริคลุมกิโมโน",
    "category": "Daywear & Misc",
    "desc": "A flowing Japanese haori outer jacket in deep crimson silk, adorned with soaring white crane and gold crest patterns.",
    "th_desc": "เสื้อคลุมฮาโอริผ้าไหมญี่ปุ่นสีแดงเข้ม ชายแขนเสื้อทิ้งกว้าง พิมพ์ลวดลายนกกระเรียนขาวโบยบินและตราประจำตระกูลดิ้นทอง",
    "source": "default",
    "keys": [
      "Silk Haori Cardigan",
      "Haori",
      "เสื้อฮาโอริคลุมกิโมโน",
      "เสื้อฮาโอริ"
    ]
  },
  {
    "id": "Misc_Leather_Motorcycle_Jacket",
    "name": "Leather Motorcycle Jacket",
    "th_name": "แจ็คเก็ตหนังมอเตอร์ไซค์",
    "category": "Daywear & Misc",
    "desc": "A heavyweight distressed black cowhide motorcycle jacket featuring asymmetrical front zipper, snap notched lapels, and belted waist.",
    "th_desc": "เสื้อแจ็คเก็ตหนังแท้สไตล์มอเตอร์ไซค์คลาสสิก ซิปเฉียงด้านหน้า ปกเสื้อติดกระดุมแป๊ก และเข็มขัดคาดเอว ให้กลิ่นอายความเท่ดิบ",
    "source": "default",
    "keys": [
      "Classic Moto Leather Jacket",
      "Leather Jacket",
      "แจ็คเก็ตหนังมอเตอร์ไซค์",
      "แจ็คเก็ตหนัง"
    ]
  },
  {
    "id": "Misc_Cozy_Cabin_Cardigan",
    "name": "Cozy Cabin Cardigan",
    "th_name": "คาร์ดิแกนไหมพรมถักหนานุ่ม",
    "category": "Daywear & Misc",
    "desc": "A chunky oversized oatmeal cable-knit cardigan with wooden toggle buttons and deep patch pockets, warm and enveloping.",
    "th_desc": "เสื้อคาร์ดิแกนไหมพรมถักลายเปียสีข้าวโอ๊ตเนื้อหนานุ่มพิเศษ ติดกระดุมไม้ทรงกระบอก มีกระเป๋าข้างสองข้าง อบอุ่นน่าซุกตัว",
    "source": "default",
    "keys": [
      "Cozy Cable-Knit Cardigan",
      "Knit Cardigan",
      "คาร์ดิแกนไหมพรมถักหนานุ่ม",
      "คาร์ดิแกนไหมพรม"
    ]
  },
  {
    "id": "State_Torn_Attire",
    "name": "Torn Attire",
    "th_name": "เสื้อผ้าขาดจากการต่อสู้",
    "category": "States & Conditions",
    "desc": "The current outfit has sustained severe combat battle-damage, shredded along the seams with frayed slashes exposing skin underneath.",
    "th_desc": "เสื้อผ้าที่สวมใส่ได้รับความเสียหายจากการต่อสู้อย่างหนัก ตะเข็บหลุดลุ่ย รอยขาดเฉือนเว้าแหว่งเผยให้เห็นผิวเนียนด้านในอย่างน่าตื่นเต้น",
    "source": "default",
    "keys": [
      "Battle-Torn Clothing",
      "Torn Clothes",
      "เสื้อผ้าขาดจากการต่อสู้",
      "เสื้อผ้าขาด"
    ]
  },
  {
    "id": "State_Oil_Sheened",
    "name": "Oil Sheened",
    "th_name": "ผิวกายเคลือบออยล์แวววาว",
    "category": "States & Conditions",
    "desc": "Bare skin and tight fabrics glisten with a radiant coating of fragrant aromatic massage oil, creating wet glossy highlights under ambient lighting.",
    "th_desc": "เรือนร่างและผืนผ้าแนบเนื้อเคลือบชโลมด้วยน้ำมันหอมระเหยแวววาว ผิวเนียนเปล่งประกายล้อแสงไฟระยิบระยับ สะท้อนความเย้ายวนทุกการขยับตัว",
    "source": "default",
    "keys": [
      "Glistening Body Oil",
      "Oiled Body",
      "ผิวกายเคลือบออยล์แวววาว",
      "ชโลมออยล์"
    ]
  },
  {
    "id": "State_Bound_Ribbons",
    "name": "Bound Ribbons",
    "th_name": "ผูกมัดด้วยริบบิ้นไหมซาติน",
    "category": "States & Conditions",
    "desc": "Soft crimson silk satin ribbons bind the wrists together in front and loop decoratively around the torso in aesthetic Japanese bondage patterns.",
    "th_desc": "ริบบิ้นผ้าไหมซาตินสีแดงสดพันธนาการข้อมือทั้งสองข้างไว้ด้วยกันด้านหน้า และพาดผ่านเรือนร่างเป็นลวดลายชิบาริสุดประณีต นุ่มนวลแต่ไม่อาจหลุดพ้น",
    "source": "default",
    "keys": [
      "Bound in Satin Ribbons",
      "Ribbon Bondage",
      "ผูกมัดด้วยริบบิ้นไหมซาติน",
      "พันธนาการริบบิ้น"
    ]
  },
  {
    "id": "State_Dripping_Sweat",
    "name": "Dripping Sweat",
    "th_name": "เหงื่อชุ่มกายหลังออกกำลังกาย",
    "category": "States & Conditions",
    "desc": "A fine dewy sheen of perspiration clings to the skin, collarbones, and dampens the fabric after intense athletic or emotional exertion.",
    "th_desc": "หยาดเหงื่อเม็ดละเอียดผุดพรายทั่วเรือนร่างและไหปลาร้า ชโลมเสื้อผ้าจนเปียกชื้นแนบเนื้อหลังผ่านการออกกำลังกายหรือกิจกรรมอันเร่าร้อน",
    "source": "default",
    "keys": [
      "Dripping Post-Workout Sweat",
      "Sweaty Skin",
      "เหงื่อชุ่มกายหลังออกกำลังกาย",
      "เหงื่อท่วมตัว"
    ]
  },
  {
    "id": "State_Disheveled_Sleepwear",
    "name": "Disheveled Sleepwear",
    "th_name": "ชุดนอนหลุดรุ่ยยามตื่นนอน",
    "category": "States & Conditions",
    "desc": "The sleepwear is delightfully rumpled and twisted from bedsheets, with one strap slipped down the arm and fabric clinging loosely.",
    "th_desc": "ชุดนอนบิดย่นหลุดรุ่ยจากการพลิกตัวบนที่นอน สายเสื้อเลื่อนหลุดลงมาข้างแขน ชายกระโปรงเลิกสูง เผยความงดงามไร้เดียงสายามตื่นนอน",
    "source": "default",
    "keys": [
      "Disheveled Sleep State",
      "Morning Mess",
      "ชุดนอนหลุดรุ่ยยามตื่นนอน",
      "สภาพเพิ่งตื่น"
    ]
  },
  {
    "id": "State_Blindfolded",
    "name": "Blindfolded",
    "th_name": "ปิดตาด้วยผ้าไหมซาติน",
    "category": "States & Conditions",
    "desc": "A wide black satin ribbon tied securely across the eyes, depriving sight and heightening touch, scent, and auditory sensitivity.",
    "th_desc": "ผ้าไหมซาตินสีดำขลับผูกปิดทับดวงตาทั้งสองข้างอย่างมิดชิด พรากการมองเห็นและช่วยปลุกเร้าประสาทสัมผัสการได้ยินและการรับรสสัมผัสให้เฉียบคมยิ่งขึ้น",
    "source": "default",
    "keys": [
      "Satin Blindfold",
      "Blindfolded",
      "ปิดตาด้วยผ้าไหมซาติน",
      "ผ้าปิดตา"
    ]
  },
  {
    "id": "State_Restrained_Handcuffs",
    "name": "Restrained Handcuffs",
    "th_name": "มือถูกพันธนาการด้วยกุญแจมือ",
    "category": "States & Conditions",
    "desc": "Wrists linked together in front by polished steel or soft velvet-lined cuffs, restricting arm mobility while maintaining poised posture.",
    "th_desc": "ข้อมือทั้งสองข้างถูกล็อกพันธนาการไว้ด้วยกุญแจมือเหล็กขัดเงาบุกำมะหยี่ จำกัดการเคลื่อนไหวของมือให้อยู่ด้านหน้าอย่างจำยอม",
    "source": "default",
    "keys": [
      "Restrained by Handcuffs",
      "Handcuffs",
      "มือถูกพันธนาการด้วยกุญแจมือ",
      "กุญแจมือ"
    ]
  },
  {
    "id": "Addon_Heart_Choker",
    "name": "Heart Choker",
    "th_name": "ปลอกคอโชคเกอร์หัวใจ",
    "category": "Add-ons & Modifiers",
    "desc": "A snug black velvet neck choker centered with a polished rose-gold heart-shaped metal O-ring.",
    "th_desc": "โชคเกอร์ผ้ากำมะหยี่สีดำกระชับรอบคอ ประดับห่วงโลหะรูปหัวใจสีโรสโกลด์ขัดเงาตรงกลางลำคออย่างโดดเด่น",
    "source": "default",
    "keys": [
      "Heart Ring Velvet Choker",
      "Heart Choker",
      "ปลอกคอโชคเกอร์หัวใจ",
      "โชคเกอร์หัวใจ"
    ]
  },
  {
    "id": "Addon_Fox_Tail_Ears",
    "name": "Fox Tail Ears",
    "th_name": "หูและหางจิ้งจอกขนฟู",
    "category": "Add-ons & Modifiers",
    "desc": "A pair of realistic two-tone faux-fur fox ears on a discreet headband, paired with a giant plush fox tail swaying behind.",
    "th_desc": "ที่คาดผมหูจิ้งจอกขนสัตว์เทียมนุ่มฟูสองสี จับคู่กับพวงหางจิ้งจอกขนาดใหญ่ขนนุ่มฟูที่แกว่งไหวไปมาด้านหลัง",
    "source": "default",
    "keys": [
      "Fluffy Fox Ears & Tail",
      "Fox Ears",
      "หูและหางจิ้งจอกขนฟู",
      "หูจิ้งจอก"
    ]
  },
  {
    "id": "Addon_Cat_Ears_Paws",
    "name": "Cat Ears Paws",
    "th_name": "หูแมวและอุ้งมือแมวนุ่ม",
    "category": "Add-ons & Modifiers",
    "desc": "Soft black velvet cat ears with pink inner lining, accompanied by fingerless paw gloves featuring squishy silicone toe beans.",
    "th_desc": "ที่คาดผมหูแมวผ้ากำมะหยี่สีดำซับในสีชมพู มาพร้อมถุงมืออุ้งเท้าแมวไร้นิ้วแต่งปุ่มอุ้งเท้ายางซิลิโคนนุ่มนิ่มน่าสัมผัส",
    "source": "default",
    "keys": [
      "Velvet Cat Ears & Paws",
      "Cat Ears",
      "หูแมวและอุ้งมือแมวนุ่ม",
      "หูแมว"
    ]
  },
  {
    "id": "Addon_Bunny_Ears_Cuffs",
    "name": "Bunny Ears Cuffs",
    "th_name": "หูกระต่ายและข้อมือทักซิโด้",
    "category": "Add-ons & Modifiers",
    "desc": "Tall bendable satin bunny ears mounted on a headband, paired with crisp white French tuxedo wrist cuffs and cufflinks.",
    "th_desc": "ที่คาดผมหูกระต่ายผ้าซาตินทรงสูงดัดทรงได้ มาพร้อมปลอกข้อมือทักซิโด้สีขาวติดกระดุมข้อมือคัฟลิงค์สไตล์เพลย์บอยบันนี่",
    "source": "default",
    "keys": [
      "Satin Bunny Ears & Cuffs",
      "Bunny Ears",
      "หูกระต่ายและข้อมือทักซิโด้",
      "หูกระต่าย"
    ]
  },
  {
    "id": "Addon_Body_Chains",
    "name": "Body Chains",
    "th_name": "สายโซ่ประดับเรือนร่าง",
    "category": "Add-ons & Modifiers",
    "desc": "Delicate gold link chains draping elegantly across the collarbones, crossing beneath the breasts, and encircling the waist.",
    "th_desc": "สายโซ่ทองคำเส้นละเอียดทิ้งตัวพาดผ่านไหปลาร้า ไขว้ลงมาใต้ราวนม และโอบล้อมรอบเอว ขับเน้นทรวดทรงให้ดูหรูหราเจิดจรัส",
    "source": "default",
    "keys": [
      "Gilded Torso Body Chains",
      "Body Chains",
      "สายโซ่ประดับเรือนร่าง",
      "บอดี้เชน"
    ]
  },
  {
    "id": "Addon_Leather_Chest_Harness",
    "name": "Leather Chest Harness",
    "th_name": "ฮาร์เนสสายรัดอกหนังแท้",
    "category": "Add-ons & Modifiers",
    "desc": "A geometric black leather cage harness wrapping under and around the breasts, accented with polished silver rings and buckles.",
    "th_desc": "สายรัดอกฮาร์เนสหนังแท้สีดำตัดเย็บโครงเรขาคณิตโอบรอบเนินอก เชื่อมต่อด้วยห่วงเงินโอริงและบัคเคิลปรับขนาดได้",
    "source": "default",
    "keys": [
      "Leather Chest Harness",
      "Chest Harness",
      "ฮาร์เนสสายรัดอกหนังแท้",
      "ฮาร์เนส"
    ]
  },
  {
    "id": "Addon_Lace_Garter_Set",
    "name": "Lace Garter Set",
    "th_name": "ชุดการ์เตอร์สายรัดถุงน่อง",
    "category": "Add-ons & Modifiers",
    "desc": "A sheer scalloped floral lace waist garter belt with four adjustable satin straps and metal clips designed to hold up stockings.",
    "th_desc": "เข็มขัดการ์เตอร์ลูกไม้ลายดอกไม้โปร่งบางคาดรอบเอว มาพร้อมสายรัดซาติน 4 เส้นและคลิปโลหะสำหรับยึดติดกับถุงน่อง",
    "source": "default",
    "keys": [
      "Floral Lace Garter Belt",
      "Garter Belt",
      "ชุดการ์เตอร์สายรัดถุงน่อง",
      "สายรัดถุงน่อง"
    ]
  },
  {
    "id": "Addon_Silk_Arm_Gloves",
    "name": "Silk Arm Gloves",
    "th_name": "ถุงมือผ้าไหมยาวถึงข้อศอก",
    "category": "Add-ons & Modifiers",
    "desc": "Sleek elbow-length evening gloves crafted from smooth stretch satin, hugging the arms and hands flawlessly.",
    "th_desc": "ถุงมือราตรียาวเลยข้อศอกทำจากผ้าไหมซาตินเนื้อยืดหยุ่น แนบกระชับกับเรียวมือและท่อนแขนอย่างหมดจด เสริมมาดนางพญา",
    "source": "default",
    "keys": [
      "Opera-Length Silk Gloves",
      "Opera Gloves",
      "ถุงมือผ้าไหมยาวถึงข้อศอก",
      "ถุงมือยาว"
    ]
  },
  {
    "id": "Addon_Anklet_Bells",
    "name": "Anklet Bells",
    "th_name": "กำไลข้อเท้ากระพรวนเงิน",
    "category": "Add-ons & Modifiers",
    "desc": "A dainty sterling silver chain anklet strung with miniature polished silver jingle bells that chime softly with every step.",
    "th_desc": "กำไลข้อเท้าสร้อยเงินแท้เส้นจิ๋วร้อยกระพรวนเงินใบเล็กๆ ส่งเสียงดนตรีไพเราะแผ่วเบาทุกจังหวะการย่างก้าว",
    "source": "default",
    "keys": [
      "Silver Jingle Bell Anklet",
      "Bell Anklet",
      "กำไลข้อเท้ากระพรวนเงิน",
      "กำไลข้อเท้า"
    ]
  },
  {
    "id": "Addon_Sheer_Veil",
    "name": "Sheer Veil",
    "th_name": "ผ้าคลุมหน้าโปร่งแสง",
    "category": "Add-ons & Modifiers",
    "desc": "A delicate sheer mesh veil attached to a comb, draping mystically over the eyes and lips with ethereal transparency.",
    "th_desc": "ผ้าคลุมหน้าผ้าตาข่ายโปร่งแสงติดหวีสับ ทิ้งตัวลงมาบดบังดวงตาและริมฝีปากอย่างลึกลับ ชวนให้ค้นหาและน่าหลงใหล",
    "source": "default",
    "keys": [
      "Translucent Face Veil",
      "Face Veil",
      "ผ้าคลุมหน้าโปร่งแสง",
      "ผ้าคลุมหน้า"
    ]
  },
  {
    "id": "Addon_Feather_Boa",
    "name": "Feather Boa",
    "th_name": "ผ้าพันคอขนนกฟูฟ่อง",
    "category": "Add-ons & Modifiers",
    "desc": "A six-foot voluminous pure white ostrich feather boa draped luxuriously across the elbows and shoulders.",
    "th_desc": "ผ้าพันคอขนนกกระจอกเทศสีขาวบริสุทธิ์หนานุ่มฟูฟ่องยาว 6 ฟุต สวมพาดแขนและไหล่อย่างเลิศหรูสไตล์คาบาเรต์และฮอลลีวูด",
    "source": "default",
    "keys": [
      "Ostrich Feather Boa",
      "Feather Boa",
      "ผ้าพันคอขนนกฟูฟ่อง",
      "ผ้าพันคอขนนก"
    ]
  },
  {
    "id": "Addon_Nipple_Chains",
    "name": "Nipple Chains",
    "th_name": "สายโซ่เชื่อมหน้าอกคริสตัล",
    "category": "Add-ons & Modifiers",
    "desc": "Delicate non-piercing silver filigree clamps tipped in silicone, linked across the breast with a sparkling crystal droplet chain.",
    "th_desc": "เครื่องประดับเรือนร่างแบบหนีบไร้การเจาะหุ้มซิลิโคนนุ่มนวล เชื่อมต่อระหว่างหน้าอกด้วยสายโซ่คริสตัลหยดน้ำระยิบระยับ",
    "source": "default",
    "keys": [
      "Crystal Nipple Clamp Chains",
      "Body Jewelry",
      "สายโซ่เชื่อมหน้าอกคริสตัล",
      "สายโซ่หน้าอก"
    ]
  },
  {
    "id": "Addon_Pasties_Stars",
    "name": "Pasties Stars",
    "th_name": "สติ๊กเกอร์แปะหน้าอกรูปดาว",
    "category": "Add-ons & Modifiers",
    "desc": "A pair of iridescent holographic adhesive star pasties designed to add a playful sparkle beneath sheer fabrics.",
    "th_desc": "สติ๊กเกอร์ซิลิโคนติดหน้าอกรูปดาวโฮโลแกรมประกายสีรุ้ง ออกแบบมาสำหรับใส่ภายใต้ชุดซีทรูโปร่งแสงเพื่อเพิ่มประกายเสน่ห์น่ารัก",
    "source": "default",
    "keys": [
      "Holographic Star Pasties",
      "Pasties",
      "สติ๊กเกอร์แปะหน้าอกรูปดาว",
      "ที่แปะหน้าอก"
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
        sourceDefault: '👑 Default Sets (224)',
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
        catAddons: 'Add-ons & Modifiers',
        detailTitle: 'Outfit Details',
        readFullDetail: 'Read Full Details',
        selectAttire: 'Select This Attire',
        deselectAttire: 'Deselect Attire'
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
        sourceDefault: '👑 ชุดมาตรฐาน (224)',
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
                    <button type="button" class="pwm-close-btn" id="pwm-close-btn" title="${t('close')}"><i class="fa-solid fa-xmark"></i></button>
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
                    <button type="button" class="pwm-btn pwm-btn-secondary pwm-footer-exit-btn" id="pwm-footer-close-btn" title="${t('close')}">
                        <i class="fa-solid fa-xmark"></i> <span class="pwm-btn-text">${t('close')}</span>
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

        <!-- Outfit Detail Inspector Modal (Large Readable Bubble) -->
        <div id="pwm-item-detail-modal" class="pwm-submodal" style="display: none;">
            <div class="pwm-submodal-content pwm-detail-bubble-content">
                <div class="pwm-submodal-header">
                    <h3 id="pwm-detail-title"><i class="fa-solid fa-shirt"></i> <span>Outfit Details</span></h3>
                    <button type="button" class="pwm-submodal-close" id="pwm-detail-modal-close" title="${t('close')}"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="pwm-detail-meta" id="pwm-detail-meta"></div>
                <div class="pwm-detail-body" id="pwm-detail-body"></div>
                <div class="pwm-detail-actions" id="pwm-detail-actions"></div>
            </div>
        </div>
    `;

    bindModalEvents(backdrop);
    renderItemsGrid();
    renderPreview();
    renderPartySummary();
}

function bindModalEvents(backdrop) {
    // Close buttons (Header & Footer)
    const headerClose = backdrop.querySelector('#pwm-close-btn');
    if (headerClose) headerClose.onclick = closeWardrobeModal;

    const footerClose = backdrop.querySelector('#pwm-footer-close-btn');
    if (footerClose) footerClose.onclick = closeWardrobeModal;

    // Item Detail Inspector modal events
    const detailModal = backdrop.querySelector('#pwm-item-detail-modal');
    const detailClose = backdrop.querySelector('#pwm-detail-modal-close');
    if (detailClose && detailModal) {
        detailClose.onclick = () => { detailModal.style.display = 'none'; };
        detailModal.onclick = (e) => {
            if (e.target === detailModal) detailModal.style.display = 'none';
        };
    }
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
                    <span class="pwm-item-title" title="${isThai ? 'กดเพื่อสวมใส่ชุดนี้' : 'Click to select this attire'}">
                        ${isSelected ? '<i class="fa-solid fa-circle-check pwm-check-icon"></i>' : ''}
                        <span>${escapeHtml(displayName)}</span>
                    </span>
                    <div class="pwm-item-header-actions">
                        <button type="button" class="pwm-item-info-btn" data-id="${escapeHtml(item.id)}" title="${isThai ? 'เปิดอ่านรายละเอียดฉบับเต็ม (ตัวหนังสือใหญ่)' : 'Inspect Full Details (Large Text Bubble)'}">
                            <i class="fa-solid fa-circle-info"></i> <span>${isThai ? 'ข้อมูล' : 'Details'}</span>
                        </button>
                        <span class="pwm-item-badge ${badgeClass}">${escapeHtml(badgeLabel)}</span>
                    </div>
                </div>
                ${subName ? `<div class="pwm-item-subname">${escapeHtml(subName)}</div>` : ''}
                <div class="pwm-item-desc" data-id="${escapeHtml(item.id)}" title="${isThai ? 'กดเพื่ออ่านรายละเอียดฉบับเต็ม' : 'Click to read full details'}">${escapeHtml(displayDesc)}</div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.pwm-item-card').forEach(card => {
        card.onclick = (e) => {
            // If user clicked the info button or description text, open the Dedicated Detail Inspector Bubble!
            if (e.target.closest('.pwm-item-info-btn') || e.target.closest('.pwm-item-desc')) {
                e.stopPropagation();
                const itemId = card.dataset.id;
                const all = getAllOutfitsList();
                const it = all.find(x => x.id === itemId);
                if (it) openItemDetailModal(it);
                return;
            }
            toggleItemSelection(card.dataset.id);
        };
    });

    container.querySelectorAll('.pwm-item-info-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const itemId = btn.dataset.id;
            const all = getAllOutfitsList();
            const it = all.find(x => x.id === itemId);
            if (it) openItemDetailModal(it);
        };
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


/**
 * Outfit Detail Inspector Modal (Large Readable Bubble)
 */
function openItemDetailModal(item) {
    const modal = document.getElementById('pwm-item-detail-modal');
    if (!modal || !item) return;

    const isThai = state.currentLang === 'th';
    const displayName = (isThai && item.th_name) ? item.th_name : item.name;
    const subName = (isThai && item.th_name && item.th_name !== item.name) ? item.name : '';
    const displayDesc = (isThai && item.th_desc) ? item.th_desc : item.desc;
    const isSelected = checkIsItemSelected(item);

    const titleEl = document.getElementById('pwm-detail-title');
    const metaEl = document.getElementById('pwm-detail-meta');
    const bodyEl = document.getElementById('pwm-detail-body');
    const actionsEl = document.getElementById('pwm-detail-actions');

    if (titleEl) {
        titleEl.innerHTML = `<i class="fa-solid fa-shirt"></i> <span>${escapeHtml(displayName)}</span>`;
    }

    if (metaEl) {
        metaEl.innerHTML = `
            ${subName ? `<span class="pwm-detail-tag"><i class="fa-solid fa-language"></i> ${escapeHtml(subName)}</span>` : ''}
            <span class="pwm-detail-tag"><i class="fa-solid fa-layer-group"></i> ${escapeHtml(item.category)}</span>
            <span class="pwm-detail-tag pwm-detail-source"><i class="fa-solid fa-bookmark"></i> ${escapeHtml(item.source === 'imported' ? (item.book || 'Custom') : 'Default')}</span>
            ${isSelected ? `<span class="pwm-detail-tag pwm-detail-wearing"><i class="fa-solid fa-circle-check"></i> ${isThai ? 'กำลังสวมใส่' : 'Equipped'}</span>` : ''}
        `;
    }

    if (bodyEl) {
        const paragraphs = displayDesc.split(/\n\n+/).filter(Boolean);
        const formattedDesc = (paragraphs.length ? paragraphs : [displayDesc]).map(p => {
            const cleanP = escapeHtml(p.trim()).replace(/\n/g, '<br>');
            return `<p>${cleanP}</p>`;
        }).join('');

        const keysHtml = (item.keys && item.keys.length) ? `
            <div class="pwm-detail-keywords">
                <span class="pwm-detail-kw-label"><i class="fa-solid fa-tags"></i> ${isThai ? 'คำสำคัญ' : 'Keywords'}:</span>
                ${item.keys.map(k => `<span class="pwm-detail-kw-chip">${escapeHtml(k)}</span>`).join('')}
            </div>
        ` : '';

        bodyEl.innerHTML = `
            <div class="pwm-detail-text">
                ${formattedDesc}
            </div>
            ${keysHtml}
        `;
    }

    if (actionsEl) {
        actionsEl.innerHTML = `
            <button type="button" class="pwm-btn ${isSelected ? 'pwm-btn-secondary' : 'pwm-btn-save'}" id="pwm-detail-toggle-select-btn">
                <i class="fa-solid ${isSelected ? 'fa-rotate-left' : 'fa-check'}"></i> 
                ${isSelected ? (isThai ? 'ถอดชุดนี้ออก' : 'Deselect') : (isThai ? 'สวมใส่ชุดนี้' : 'Select This Attire')}
            </button>
            <button type="button" class="pwm-btn pwm-btn-primary" id="pwm-detail-apply-chat-btn">
                <i class="fa-solid fa-paper-plane"></i> ${isThai ? 'ใส่ในแชท' : 'Apply to Chat'}
            </button>
            <button type="button" class="pwm-btn pwm-btn-secondary" id="pwm-detail-close-btn" style="flex: 0 0 65px;">
                ${isThai ? 'ปิด' : 'Close'}
            </button>
        `;

        const selectBtn = actionsEl.querySelector('#pwm-detail-toggle-select-btn');
        if (selectBtn) {
            selectBtn.onclick = () => {
                toggleItemSelection(item.id);
                modal.style.display = 'none';
            };
        }

        const applyBtn = actionsEl.querySelector('#pwm-detail-apply-chat-btn');
        if (applyBtn) {
            applyBtn.onclick = () => {
                if (!checkIsItemSelected(item)) {
                    toggleItemSelection(item.id);
                }
                applyOutfitToChat();
                modal.style.display = 'none';
            };
        }

        const closeBtn = actionsEl.querySelector('#pwm-detail-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.style.display = 'none';
            };
        }
    }

    modal.style.display = 'flex';
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
