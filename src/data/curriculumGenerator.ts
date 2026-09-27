import { Course, Lesson, LessonDifficulty, LessonPage, LessonPagePurpose } from '../types';
import {
  ALL_ARABIC_BASE_LETTERS,
  computeLessonKeyRules,
  sanitizeLessonText,
} from './lessonValidator';

interface LessonVocab {
  shortWords: string[];
  longerWords: string[];
  phrases: string[];
  sentences: string[];
}

/**
 * Single source of truth for beginner lesson vocabulary.
 * Every single word, phrase, and sentence is strictly composed ONLY of
 * the keys unlocked up to that lesson (allowedKeys) and space.
 * No Harakat, no English, no numbers, no punctuation, no unlearned letters.
 */
const LETTER_VOCABULARY: Record<string, LessonVocab> = {
  // Lesson 1: ['ب', 'ت']
  'ب_ت': {
    shortWords: ['بت', 'تب', 'ببت', 'تبت', 'بتب', 'تبب', 'بتت', 'تتب'],
    longerWords: ['بتبت', 'تبتب', 'ببتت', 'تتبب', 'بتببت', 'تبتبت', 'بتتبت'],
    phrases: ['بت تب بت تب', 'تبت ببت تبت ببت', 'بتب تببت بتب تببت', 'بت تبت تب ببت'],
    sentences: [
      'بت تبت تب ببت بت تب تبت ببت بتب بتت',
      'تبتب بتبت بت تب تبت ببت بتب تببت تتب',
    ],
  },

  // Lesson 2: ['ي', 'ل'] + ['ب', 'ت']
  'ي_ل': {
    shortWords: ['يل', 'لي', 'ليل', 'بيت', 'ليت', 'يلبي', 'بيتي', 'تلي', 'بلي', 'تل', 'بل', 'لب'],
    longerWords: ['بلبل', 'ليلتي', 'بيتي', 'يلبي', 'تبيت', 'يبيت', 'ليلي', 'تبتل'],
    phrases: ['بيت ليل', 'بيتي يبيت', 'ليت بلبل يلبي', 'ليل بيتي', 'تلي ليلتي'],
    sentences: [
      'ليت بلبل يلبي بيتي ليلتي يبيت ليلي بت تب',
      'بيتي ليلتي تبيت يلبي بلبل ليت ليل تبت',
    ],
  },

  // Lesson 3: ['ا', 'ن'] + ['ب', 'ت', 'ي', 'ل']
  'ا_ن': {
    shortWords: ['ان', 'نا', 'انا', 'بان', 'ناب', 'نبات', 'بنت', 'بنات', 'نال', 'نالت', 'تين', 'لين', 'تان', 'بيان', 'لبنان', 'نبيل', 'نبل', 'تبين', 'يبين', 'ينال', 'تنال', 'انت', 'ابن', 'اب'],
    longerWords: ['لبنان', 'نباتات', 'بيانات', 'بناتنا', 'انبات', 'نبيلنا', 'اليابان'],
    phrases: ['انا نبيل', 'نال البيان', 'بنت نالت بيان', 'لبنان نبيل', 'نبات تين لين'],
    sentences: [
      'انا نبيل نال بيان بنات لبنان لين تين بان',
      'نالت بنت لبنان نبيل بيان نبات تين لين تبيان',
    ],
  },

  // Lesson 4: ['م', 'ك'] + ['ب', 'ت', 'ي', 'ل', 'ا', 'ن']
  'م_ك': {
    shortWords: ['كم', 'كل', 'كان', 'ملك', 'مال', 'مالك', 'كتاب', 'كتب', 'يكتب', 'تكتب', 'كلام', 'تكلم', 'يتكلم', 'كامل', 'كمال', 'مكان', 'مكن', 'مكتب', 'متين', 'مات', 'من', 'ما', 'ام', 'لكم', 'بكم'],
    longerWords: ['الكتاب', 'المكتب', 'المكان', 'الكمال', 'كلمات', 'تمكين', 'المكاتب', 'مملكتنا'],
    phrases: ['كتاب كامل', 'ملك كامل', 'كتب كاتب', 'كلام متين', 'مكتب كمال'],
    sentences: [
      'كتب كاتب كتاب كامل مكن كمال من بيان متين',
      'ملك كامل يكتب كلام متين بمكتب كمال بكل تمكين',
    ],
  },

  // Lesson 5: ['س', 'ش'] + ['ب', 'ت', 'ي', 'ل', 'ا', 'ن', 'م', 'ك']
  'س_ش': {
    shortWords: ['سم', 'شم', 'سال', 'شال', 'سلام', 'شمس', 'مسك', 'سكت', 'شمل', 'سكن', 'مسكن', 'سليم', 'شمال', 'كسب', 'شب', 'شاب', 'شباب', 'سبب', 'سبت', 'سلك', 'شباك', 'شكل', 'سالم'],
    longerWords: ['السلام', 'الشمس', 'المسكن', 'سالمين', 'شباكنا', 'مسكننا', 'الشباب', 'المسك'],
    phrases: ['سلام كامل', 'شمس شمال', 'مسكن سليم', 'كسب سليم', 'سكت كاتب'],
    sentences: [
      'سكن سليم مسكن كامل وشمل السلام مسكن كمال وشبابنا',
      'شمس تبتسم لكن سليم سكت وكتب كتاب السلام بمكان متين',
    ],
  },

  // Lesson 6: ['ط', 'ذ'] + previously learned
  'ط_ذ': {
    shortWords: ['طال', 'طاب', 'ذات', 'طلب', 'بطل', 'طبل', 'طين', 'طلي', 'طل', 'ذل', 'ذلك', 'بطاطا', 'طالب', 'يطلب', 'تطلب', 'طلبات', 'ذبل', 'نشاط', 'طماطم', 'طيب'],
    longerWords: ['الطالب', 'النشاط', 'المطالب', 'طلبات', 'البطل', 'طليطلة', 'الطيب'],
    phrases: ['طلب طالب', 'ذلك الطالب', 'طال ليل', 'طاب مسكن', 'نشاط بطل'],
    sentences: [
      'طلب ذلك الطالب كتاب كامل من كمال ونال نشاط بطل',
      'طال ليل ذلك الطالب وطلب السلام بمكان طيب مع سالم',
    ],
  },

  // Lesson 7: ['ق', 'ف'] + previously learned
  'ق_ف': {
    shortWords: ['قال', 'قف', 'فق', 'فاق', 'قلب', 'قبل', 'قيل', 'قلم', 'فلك', 'فتن', 'فلت', 'فلق', 'قفل', 'قاسم', 'مقال', 'فطن', 'سقف', 'فلس', 'فقال', 'فكتب'],
    longerWords: ['القلم', 'المقال', 'المستقبل', 'انفاق', 'اتفاق', 'فلسطين', 'القافلة'],
    phrases: ['قال قاسم', 'كتب بالقلم', 'فاق ذلك الطالب', 'قلم كامل', 'مقال فطن'],
    sentences: [
      'قال قاسم مقال كامل وكتب بالقلم عن طالب فاق الكل',
      'طلب قاسم قلم فكتب مقال فاق الكل ونال اتفاق تام',
    ],
  },

  // Lesson 8: ['ع', 'غ'] + previously learned
  'ع_غ': {
    shortWords: ['علم', 'عمل', 'عام', 'غاب', 'غلى', 'غالي', 'غلب', 'بلغ', 'عالي', 'عين', 'عن', 'مع', 'عسل', 'شعل', 'شعاع', 'غنم', 'طعام', 'علف', 'غفل', 'عقاب', 'عقل', 'معلم', 'تعلم', 'يعلم', 'يعمل'],
    longerWords: ['التعليم', 'العلم', 'المعلم', 'العمل', 'العقل', 'علامات', 'الاعلام', 'الغالي'],
    phrases: ['علم نافع', 'عمل متقن', 'بلغ الطالب', 'معلم كامل', 'عقل سليم'],
    sentences: [
      'العلم النافع يبني العقل السليم ويعمل المعلم مع طالب فطن',
      'بلغ الطالب قمة العلم بالعمل النافع وتعلم مع معلم كامل',
    ],
  },

  // Lesson 9: ['ه', 'خ'] + previously learned
  'ه_خ': {
    shortWords: ['هي', 'هم', 'هنا', 'هناك', 'به', 'له', 'منه', 'عنه', 'معه', 'خاف', 'خاب', 'خان', 'خيل', 'خيط', 'ختم', 'خلق', 'نخل', 'فخم', 'مخ', 'خف', 'خط', 'سهل', 'مهل', 'فهم', 'همم', 'هاتف', 'شبه', 'خام', 'خال', 'خشب', 'ذهب'],
    longerWords: ['الخلق', 'الخيل', 'التفاهم', 'المتفهم', 'اخلاقنا', 'اخفاف', 'المخلص'],
    phrases: ['فهم الطالب', 'ذهب معه', 'خلق طيب', 'نخل باسق', 'خط متقن'],
    sentences: [
      'فهم الطالب كلام معلمه وذهب معه بخلق طيب وعلم عالي',
      'هناك خيل بخط متقن فقام طالب تفهم كل علم نافع بهمة',
    ],
  },

  // Lesson 10: ['ح', 'ج'] + previously learned
  'ح_ج': {
    shortWords: ['حج', 'حق', 'حكم', 'حلم', 'حجم', 'جمل', 'جبل', 'جناح', 'جميل', 'جامع', 'جمع', 'نجاح', 'حاج', 'حجة', 'نجم', 'تاج', 'نتاج', 'جهل', 'حليم', 'حكيم', 'حاكم', 'نجيب', 'حب', 'حسب', 'جلب'],
    longerWords: ['الحكيم', 'الجميل', 'النجاح', 'الجبال', 'الجامع', 'الحجاج', 'المجاهد'],
    phrases: ['حكم حكيم', 'جبل عالي', 'نجاح كامل', 'تاج جميل', 'خلق جميل'],
    sentences: [
      'حكم الحاكم بالحق فجمع المعلم طلاب الجامع بمكان جميل',
      'نجح الطالب نجاحا جميلا فنال تاج النجاح بعلمه الحكيم',
    ],
  },

  // Lesson 11: ['ص', 'ض'] + previously learned
  'ص_ض': {
    shortWords: ['صام', 'صان', 'صمت', 'صحب', 'صبح', 'صحف', 'ضل', 'ضاع', 'ضيف', 'نصف', 'فصل', 'اصل', 'صلب', 'صيف', 'ضيق', 'حصان', 'صالح', 'مصلح', 'نصح', 'قبض', 'نبض', 'غضب', 'بيض', 'خصم', 'فحص', 'قفص', 'مقص', 'صباح'],
    longerWords: ['الصباح', 'المصلح', 'الصالح', 'الفصل', 'الانصاف', 'الخصام', 'الصامد'],
    phrases: ['صاحب صالح', 'صباح طيب', 'انصاف كامل', 'فصل الصيف', 'نصح مصلح'],
    sentences: [
      'صان الصالح لسانه فنصح صاحب طيب بخلق حسن',
      'يصبح الصباح فيقبل الصالح على العمل بنشاط وانصاف',
    ],
  },

  // Lesson 12: ['د', 'ث'] + previously learned
  'د_ث': {
    shortWords: ['دم', 'دان', 'دنا', 'دمع', 'دخل', 'دعم', 'دافع', 'دل', 'دلال', 'ثب', 'ثبت', 'بث', 'ثلث', 'ثلاث', 'اثبت', 'ثعلب', 'ثياب', 'ثمن', 'ثمين', 'مثل', 'تمثال', 'حديث', 'حدث', 'بحث', 'باحث', 'يد', 'مد', 'سد', 'شد', 'حد', 'جد', 'عدد', 'مدد', 'عهد', 'شهد', 'بلد', 'جلد', 'صدق', 'فهد'],
    longerWords: ['الحديث', 'الباحث', 'الثبات', 'المدخل', 'الاستعداد', 'الصادق', 'الاجتهاد'],
    phrases: ['ثبت الطالب', 'بحث باحث', 'حديث ثابت', 'دافع بالحق', 'صدق الحديث'],
    sentences: [
      'ثبت الباحث على طلب العلم فدخل مجلس العلم فبحث في حديث ثابت',
      'شهد الطالب صدق الحديث فدافع بالحق واثبت ثبات الجبال',
    ],
  },

  // Lesson 13: ['ر', 'ى'] + previously learned
  'ر_ى': {
    shortWords: ['رى', 'رمى', 'رب', 'دار', 'بار', 'نار', 'جار', 'حار', 'سار', 'شار', 'عار', 'غار', 'فار', 'قار', 'مر', 'قر', 'سر', 'بر', 'حر', 'ضر', 'فر', 'طار', 'طير', 'ريح', 'ريش', 'ربيع', 'كريم', 'رحيم', 'سفر', 'قمر', 'بحر', 'نهر', 'هدى', 'فتى', 'على', 'الى', 'بلى', 'حتى', 'سعى', 'مشى', 'كفى', 'بقى', 'بشرى', 'صغرى', 'كبرى', 'درس', 'طريق', 'فريق', 'صبر'],
    longerWords: ['الطريق', 'الربيع', 'الرحيم', 'الرياض', 'البشرى', 'المرتضى', 'الصابر'],
    phrases: ['طريق النجاح', 'فصل الربيع', 'بشرى خير', 'هدى مبين', 'سعى الفتى'],
    sentences: [
      'سار الفتى في طريق العلم فرأى هدى يهديه الى بر الامان',
      'اقبل الربيع فكسى الارض حسنا وبشرى لكل فتى سعى للخير',
    ],
  },

  // Lesson 14: ['ة', 'و'] + previously learned
  'ة_و': {
    shortWords: ['ورد', 'وطن', 'ولد', 'وعد', 'وقت', 'وقع', 'وفد', 'وجد', 'وجه', 'ورقة', 'وردة', 'رحمة', 'نعمة', 'حكمة', 'جنة', 'شجرة', 'قوة', 'مودة', 'اخوة', 'دعوة', 'دولة', 'صورة', 'قرية', 'مدينة', 'مكتبة', 'مدرسة', 'جامعة', 'كلمة', 'طيبة', 'صلاة', 'حياة', 'نور', 'يوم', 'قول', 'هو'],
    longerWords: ['الوطنية', 'المودة', 'الوردية', 'المكتبة', 'المدرسة', 'الحكمة', 'الرحمة'],
    phrases: ['حب الوطن', 'كلمة طيبة', 'حياة كريمة', 'قوة الامل', 'شجرة ورد'],
    sentences: [
      'الكلمة الطيبة كشجرة طيبة تثمر خيرا ومودة في قلوب الناس',
      'حب الوطن والعمل بقوة وحكمة يبني نهضة كريمة في الحياة',
    ],
  },

  // Lesson 15: ['ز', 'ظ'] + previously learned
  'ز_ظ': {
    shortWords: ['زر', 'زار', 'زمن', 'زاد', 'زال', 'زيت', 'زهر', 'زهور', 'زينة', 'نزاهة', 'عزم', 'جزم', 'حزم', 'غزال', 'فاز', 'حاز', 'ظل', 'ظفر', 'ظهر', 'ظاهر', 'ظرف', 'نظر', 'منظر', 'نظيف', 'حظ', 'غلظ', 'وعظ', 'حفظ', 'حافظ', 'يعظ', 'عظيم', 'عظمة', 'ظلام'],
    longerWords: ['الظاهرين', 'الزاهرة', 'الظلال', 'الزمان', 'النزاهة', 'المحافظ', 'العظيم'],
    phrases: ['زمن العطاء', 'ظل وارف', 'زهور نضرة', 'ظفر مؤزر', 'نظافة تامة'],
    sentences: [
      'الظفر حليف الصابرين ومن حفظ لسانه نال عزا وظفرا في كل زمن',
      'ظل الشجرة وارف في الظهيرة وحسن الخلق زينة المرء في الحياة',
    ],
  },

  // Lesson 16: ['ئ', 'ء', 'ؤ'] + all previous
  'ئ_ء_ؤ': {
    shortWords: ['شيء', 'دفء', 'بطء', 'بدء', 'جزء', 'سماء', 'ماء', 'هواء', 'بناء', 'قارئ', 'شاطئ', 'هادئ', 'مبتدئ', 'مسؤول', 'لؤلؤ', 'مؤمن', 'فؤاد', 'بؤس', 'رؤية', 'تفاؤل', 'كفاءة', 'براءة', 'نشأة', 'مسألة'],
    longerWords: ['المسؤولية', 'المؤمنين', 'البراءة', 'الرئيسية', 'التفاؤل', 'القراءة', 'المبتدئين'],
    phrases: ['دفء المشاعر', 'بدء العمل', 'قلب مؤمن', 'مسؤولية كبرى', 'نقاء الهواء'],
    sentences: [
      'المؤمن يتفاءل بالخير في كل بدء ويتحمل المسؤولية بشجاعة واخلاص',
      'القراءة المستمرة تضيء شاطئ الفكر وتملأ الفؤاد بالحكمة والضياء',
    ],
  },
};

/**
 * Generates 12 substantial, pedagogically progressive pages for a 2-key (or 3-key) lesson.
 * Strictly guarantees that EVERY character in EVERY page belongs to `allowedKeys` or `' '`.
 */
export function generateTwoKeyLessonPages(
  k1: string,
  k2: string,
  prevKeys: string[],
  lessonTitleAr: string,
  lessonTitleEn: string,
  lessonTitleBn: string,
  k3?: string
): LessonPage[] {
  const p = prevKeys.filter((k) => k !== k1 && k !== k2 && (!k3 || k !== k3) && k !== ' ');
  const targetNewKeys = k3 ? [k1, k2, k3] : [k1, k2];
  const allowedKeys = Array.from(new Set([...p, ...targetNewKeys]));

  const vocabKey = k3 ? `${k1}_${k2}_${k3}` : `${k1}_${k2}`;
  const rawVocab = LETTER_VOCABULARY[vocabKey] || {
    shortWords: [`${k1}${k2}`, `${k2}${k1}`, `${k1}${k2}${k1}`, `${k2}${k1}${k2}`],
    longerWords: [`${k1}${k2}${k1}${k2}`, `${k2}${k1}${k2}${k1}`],
    phrases: [`${k1}${k2} ${k2}${k1}`, `${k1} ${k2} ${k1}${k2}`],
    sentences: [`${k1}${k2} ${k2}${k1} ${k1} ${k2} ${k2}${k1} ${k1}${k2}`],
  };

  // Strictly sanitize all vocabulary against allowedKeys!
  const vocab: LessonVocab = {
    shortWords: rawVocab.shortWords
      .map((w) => sanitizeLessonText(w, allowedKeys))
      .filter((w) => w.length > 0),
    longerWords: rawVocab.longerWords
      .map((w) => sanitizeLessonText(w, allowedKeys))
      .filter((w) => w.length > 0),
    phrases: rawVocab.phrases
      .map((ph) => sanitizeLessonText(ph, allowedKeys))
      .filter((ph) => ph.length > 0),
    sentences: rawVocab.sentences
      .map((s) => sanitizeLessonText(s, allowedKeys))
      .filter((s) => s.length > 0),
  };

  const prev1 = p.length > 0 ? p[0] : k1;
  const prev2 = p.length > 1 ? p[1] : k2;
  const prev3 = p.length > 2 ? p[2] : prev1;

  // Combinations
  const pair1 = `${k1}${k2}`;
  const pair2 = `${k2}${k1}`;
  const dbl1 = `${k1}${k1}`;
  const dbl2 = `${k2}${k2}`;

  const shortStr = (vocab.shortWords.length > 0 ? vocab.shortWords : [pair1, pair2]).join(' ');
  const longStr = (vocab.longerWords.length > 0 ? vocab.longerWords : [pair1, pair2]).join(' ');
  const phraseStr = (vocab.phrases.length > 0 ? vocab.phrases : [shortStr]).join(' ');
  const sentenceStr1 = vocab.sentences[0] || `${shortStr} ${phraseStr}`;
  const sentenceStr2 = vocab.sentences[1] || sentenceStr1;

  const keyDisplay = k3 ? `(${k1}) و (${k2}) و (${k3})` : `(${k1}) و (${k2})`;

  const rawPages: LessonPage[] = [
    // Page 1 — New key introduction
    {
      pageNumber: 1,
      purpose: 'intro',
      titleAr: `التعريف بالمفاتيح: ${keyDisplay}`,
      titleEn: `Key Introduction: ${k1} & ${k2}`,
      titleBn: `কী পরিচিতি: ${k1} এবং ${k2}`,
      instructionAr: `تعرف على موضع الحرفين واضغط بهدوء لبدء بناء الذاكرة العضلية.`,
      instructionEn: `Locate ${k1} and ${k2}. Press with steady rhythm to anchor muscle memory.`,
      instructionBn: `কীবোর্ডে ${k1} ও ${k2} এর অবস্থান দেখুন এবং নির্দিষ্ট আঙুল দিয়ে প্রেস করুন।`,
      targetText: k3
        ? `${k1} ${k2} ${k3} ${k1} ${k2} ${k3} ${k1} ${k1} ${k2} ${k2} ${k3} ${k3} ${k1} ${k2} ${k3}`
        : `${k1} ${k2} ${k1} ${k2} ${k1} ${k2} ${k1} ${k1} ${k2} ${k2} ${k1} ${k2} ${k1} ${k2} ${k1} ${k1} ${k2} ${k2} ${k1} ${k2}`,
    },
    // Page 2 — Single-key repetition
    {
      pageNumber: 2,
      purpose: 'single',
      titleAr: `تكرار وتثبيت المفاتيح الفردية`,
      titleEn: `Single-Key Repetition & Anchor`,
      titleBn: `একক কী পুনরাবৃত্তি ও ভারসাম্য`,
      instructionAr: `اضرب المفتاح بأطراف الأصابع الصحيحة مع الحفاظ على استقرار اليدين.`,
      instructionEn: `Strike each key with its assigned finger while keeping hands balanced on home row.`,
      instructionBn: `হাত স্থির রেখে নির্ধারিত আঙুল দিয়ে প্রতিটি কী পুনরাবৃত্তি করুন।`,
      targetText: k3
        ? `${k1} ${k1} ${k1} ${k2} ${k2} ${k2} ${k3} ${k3} ${k3} ${k1} ${k2} ${k3} ${k1} ${k2} ${k3}`
        : `${k1} ${k1} ${k1} ${k1} ${k1} ${k2} ${k2} ${k2} ${k2} ${k2} ${k1} ${k1} ${k1} ${k2} ${k2} ${k2} ${k1} ${k1} ${k2} ${k2} ${k1} ${k2}`,
    },
    // Page 3 — Two-key combinations
    {
      pageNumber: 3,
      purpose: 'combinations',
      titleAr: `تراكيب الحروف والتبديل الزوجي`,
      titleEn: `Two-Key Combinations & Digraphs`,
      titleBn: `দুই কী-এর জোড়া ও যুগল রূপ`,
      instructionAr: `بدل بين الحرفين في تراكيب زوجية سلسة لبناء ترابط عصبي حركي.`,
      instructionEn: `Flow between the keys in paired digraphs to bridge neural pathways.`,
      instructionBn: `দুই অক্ষরের সমন্বয়ে ছন্দ তৈরি করে সাবলীলভাবে টাইপ করুন।`,
      targetText: `${pair1} ${pair2} ${pair1} ${pair2} ${dbl1} ${dbl2} ${pair1} ${pair2} ${dbl1} ${dbl2} ${pair1} ${pair2} ${pair1} ${pair2}`,
    },
    // Page 4 — Finger alternation
    {
      pageNumber: 4,
      purpose: 'alternating',
      titleAr: `تبادل الأصابع وحركة اليدين`,
      titleEn: `Finger Alternation Rhythm`,
      titleBn: `আঙুলের পর্যায়ক্রমিক রূপান্তর`,
      instructionAr: `وازن قوة النبض بين اليد اليسرى واليمنى مع الحفاظ على وتيرة منتظمة.`,
      instructionEn: `Balance keystroke impulse across both hands with consistent rhythm.`,
      instructionBn: `উভয় হাতের মাঝে গতির ছন্দ বজায় রেখে টাইপ করুন।`,
      targetText: `${k1} ${k2} ${k2} ${k1} ${k1} ${k2} ${k1} ${k2} ${k2} ${k1} ${k1} ${k2} ${k2} ${k1} ${k1} ${k2} ${k1} ${k2} ${k1} ${k2}`,
    },
    // Page 5 — New + previously learned keys
    {
      pageNumber: 5,
      purpose: 'mixed',
      titleAr: `الدمج التراكمي مع الحروف السابقة`,
      titleEn: `Cumulative Integration with Mastered Keys`,
      titleBn: `পূর্বে শেখা কী-এর সাথে সমন্বয়`,
      instructionAr: `ندمج الحرفين الجديدين مع الحروف التي أتقنتها في الدروس السابقة.`,
      instructionEn: `Integrate newly learned keys with previously mastered letters.`,
      instructionBn: `পূর্বে শেখা বর্ণগুলোর সাথে নতুন বর্ণগুলো মিলিয়ে টাইপ করুন।`,
      targetText: p.length > 1
        ? `${k1} ${prev1} ${k2} ${prev2} ${k1}${prev1} ${k2}${prev2} ${prev1}${k1} ${prev2}${k2} ${k1} ${prev3} ${k2} ${prev1} ${k1} ${k2}`
        : `${k1} ${k2} ${dbl1} ${dbl2} ${pair1} ${pair2} ${k1} ${k2} ${dbl1} ${dbl2} ${pair1} ${pair2} ${k1} ${k2}`,
    },
    // Page 6 — Short words
    {
      pageNumber: 6,
      purpose: 'words',
      titleAr: `الكلمات القصيرة الأصيلة (3–4 أحرف)`,
      titleEn: `Authentic Short Arabic Words`,
      titleBn: `সংক্ষিপ্ত আরবি শব্দ (৩-৪ অক্ষর)`,
      instructionAr: `اكتب كلمات عربية حقيقية تتضمن الحروف المدروسة لبناء الذاكرة البصرية.`,
      instructionEn: `Type real Arabic vocabulary containing the focus keys to solidify muscle memory.`,
      instructionBn: `শেখা বর্ণগুলো দিয়ে গঠিত বাস্তব শব্দগুলো টাইপ করুন।`,
      targetText: `${shortStr} ${shortStr}`,
    },
    // Page 7 — Longer words
    {
      pageNumber: 7,
      purpose: 'words',
      titleAr: `الكلمات المتوسطة والطويلة (5–7 أحرف)`,
      titleEn: `Longer Arabic Vocabulary`,
      titleBn: `দীর্ঘতর আরবি শব্দ (৫-৭ অক্ষর)`,
      instructionAr: `توسع في كتابة الكلمات الأطول مع المحافظة على انسيابية التنقل بين الحروف.`,
      instructionEn: `Expand into multi-syllable Arabic words while keeping fluid finger movement.`,
      instructionBn: `দীর্ঘতর শব্দগুলোতে আঙুল সঞ্চালনের ধারাবাহিকতা রক্ষা করুন।`,
      targetText: `${longStr} ${shortStr}`,
    },
    // Page 8 — Short phrases
    {
      pageNumber: 8,
      purpose: 'combinations',
      titleAr: `العبارات التعبيرية والتراكيب اللغوية`,
      titleEn: `Expressive Phrases & Collocations`,
      titleBn: `অর্থপূর্ণ সংক্ষিপ্ত বাক্যখণ্ড`,
      instructionAr: `اكتب العبارات بانسيابية مع الضغط الخفيف على المسافة بالإبهام.`,
      instructionEn: `Type continuous phrases smoothly, using light thumb taps for spaces.`,
      instructionBn: `শব্দগুলোর মাঝে বৃদ্ধাঙ্গুলি দিয়ে আলতো করে স্পেস চাপুন।`,
      targetText: `${phraseStr} ${phraseStr}`,
    },
    // Page 9 — Sentences
    {
      pageNumber: 9,
      purpose: 'words',
      titleAr: `الجمل العربية المفيدة والتامة`,
      titleEn: `Complete Meaningful Sentences`,
      titleBn: `পরিপূর্ণ আরবি বাক্য`,
      instructionAr: `اقرأ الجملة بتمعن واكتب كلماتها بوعي ودقة وتركيز عالٍ.`,
      instructionEn: `Read the sentence thoughtfully and type each word with focused accuracy.`,
      instructionBn: `বাক্যটি মনোযোগ দিয়ে পড়ুন এবং নির্ভুলভাবে টাইপ করুন।`,
      targetText: `${sentenceStr1} ${sentenceStr2}`,
    },
    // Page 10 — Accuracy challenge
    {
      pageNumber: 10,
      purpose: 'accuracy',
      titleAr: `تحدي الدقة والانضباط الحركي (98%+)`,
      titleEn: `Strict Accuracy Challenge (98%+)`,
      titleBn: `কঠোর নির্ভুলতা চ্যালেঞ্জ (৯৮%+)`,
      instructionAr: `لا تتعجل السرعة! ركز بنسبة 100% على صحة كل ضربة دون ارتكاب أخطاء.`,
      instructionEn: `Do not rush! Prioritize 100% precision over speed. Strike every key deliberately.`,
      instructionBn: `তাড়াহুড়ো না করে কোনো ভুল ছাড়া ১০০% নির্ভুল টাইপিংয়ে মনোযোগ দিন।`,
      targetText: `${k1} ${k2} ${dbl1} ${dbl2} ${shortStr} ${k1} ${k2} ${dbl1} ${dbl2}`,
    },
    // Page 11 — Speed practice
    {
      pageNumber: 11,
      purpose: 'speed',
      titleAr: `بناء وتيرة السرعة والاسترسال`,
      titleEn: `Speed Cadence & Flow`,
      titleBn: `গতির তাল ও মসৃণতা বৃদ্ধি`,
      instructionAr: `اضرب المفاتيح بثقة وتدفق متناغم مستمر كأنك تعزف على آلة موسيقية.`,
      instructionEn: `Type with fluid momentum like playing a musical instrument with steady cadence.`,
      instructionBn: `ছন্দের সাথে অবিরত গতিতে টাইপ করে দ্রুততা অর্জন করুন।`,
      targetText: `${pair1} ${pair2} ${shortStr} ${phraseStr}`,
    },
    // Page 12 — Final lesson challenge
    {
      pageNumber: 12,
      purpose: 'test',
      titleAr: `الاختبار النهائي لإتقان الدرس والترقية`,
      titleEn: `Comprehensive Lesson Mastery Benchmark`,
      titleBn: `পাঠ সমাপনী দক্ষতা পরীক্ষা`,
      instructionAr: `تحدٍ ختامي شامل يجمع الحروف والكلمات والجمل للانتقال بثقة إلى الدرس التالي.`,
      instructionEn: `Full comprehensive milestone combining keys, words, and sentences before moving on.`,
      instructionBn: `পরবর্তী পাঠ আনলক করতে এই পাঠের চূড়ান্ত সামগ্রিক পরীক্ষাটি সম্পন্ন করুন।`,
      targetText: `${k1} ${k2} ${pair1} ${pair2} ${sentenceStr1} ${shortStr}`,
    },
  ];

  // Guarantee that EVERY page passes strict character restriction!
  return rawPages.map((page) => ({
    ...page,
    targetText: sanitizeLessonText(page.targetText, allowedKeys),
  }));
}

/**
 * Generates 12 substantial pages for Harakat (Tashkeel) lessons
 */
export function generateHarakatLessonPages(
  harakatSymbol: string,
  harakatNameAr: string,
  harakatNameEn: string,
  harakatNameBn: string,
  examples: string[],
  sentences: string[]
): LessonPage[] {
  const exStr = examples.join(' ');
  const sent1 = sentences[0] || 'الْعِلْمُ نُورٌ يُضِيءُ دَرْبَ السَّائِرِينَ نَحْوَ الْمَجْدِ.';
  const sent2 = sentences[1] || 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ وَمُسْلِمَةٍ.';

  const pages: LessonPage[] = [
    {
      pageNumber: 1,
      purpose: 'intro',
      titleAr: `مقدمة علامة: ${harakatNameAr} [ ${harakatSymbol} ]`,
      titleEn: `Introduction: ${harakatNameEn} [ ${harakatSymbol} ]`,
      titleBn: `পরিচিতি: ${harakatNameBn} [ ${harakatSymbol} ]`,
      instructionAr: `تعرف على موضع حركة (${harakatNameAr}) عبر مفتاح Shift المناسب.`,
      instructionEn: `Locate the ${harakatNameEn} key using its dedicated Shift combination.`,
      instructionBn: `শিফট কী চেপে ${harakatNameBn} চিহ্নের সঠিক অবস্থান অনুশীলন করুন।`,
      targetText: `ب${harakatSymbol} ت${harakatSymbol} ي${harakatSymbol} ل${harakatSymbol} م${harakatSymbol} ن${harakatSymbol} س${harakatSymbol} ب${harakatSymbol} ت${harakatSymbol} ي${harakatSymbol} ل${harakatSymbol} م${harakatSymbol} ن${harakatSymbol} س${harakatSymbol}`,
    },
    {
      pageNumber: 2,
      purpose: 'single',
      titleAr: `تثبيت الحركة مع حروف الارتكاز`,
      titleEn: `Anchor Letters with Diacritic`,
      titleBn: `হোম রো বর্ণের সাথে হরকত অনুশীলন`,
      instructionAr: `اكتب الحرف أولا ثم أتبعه بالحركة مباشرة دون مسافة بينهما.`,
      instructionEn: `Type the base letter first, then immediately apply the diacritic mark.`,
      instructionBn: `প্রথমে মূল বর্ণটি টাইপ করুন এবং সাথে সাথে হরকতটি বসান।`,
      targetText: `ب${harakatSymbol} ب${harakatSymbol} ت${harakatSymbol} ت${harakatSymbol} ن${harakatSymbol} ن${harakatSymbol} ي${harakatSymbol} ي${harakatSymbol} ل${harakatSymbol} ل${harakatSymbol} م${harakatSymbol} م${harakatSymbol} ك${harakatSymbol} ك${harakatSymbol}`,
    },
    {
      pageNumber: 3,
      purpose: 'combinations',
      titleAr: `المقاطع الصوتية المشكولة المزدوجة`,
      titleEn: `Vocalized Two-Letter Syllables`,
      titleBn: `হরকতযুক্ত দ্বি-বর্ণীয় শব্দাংশ`,
      instructionAr: `اكتب المقاطع المشكولة مع الضغط بنعومة على مفتاح المسافة.`,
      instructionEn: `Type vocalized syllables smoothly with gentle spacebar presses.`,
      instructionBn: `হরকতযুক্ত অক্ষর জোড়াগুলো সাবলীলভাবে টাইপ করুন।`,
      targetText: `ب${harakatSymbol}ت${harakatSymbol} ت${harakatSymbol}ب${harakatSymbol} ي${harakatSymbol}ل${harakatSymbol} ل${harakatSymbol}ي${harakatSymbol} م${harakatSymbol}ن${harakatSymbol} ن${harakatSymbol}م${harakatSymbol} س${harakatSymbol}ل${harakatSymbol} ك${harakatSymbol}م${harakatSymbol}`,
    },
    {
      pageNumber: 4,
      purpose: 'alternating',
      titleAr: `التنقل الحركي بين الحروف والحركات`,
      titleEn: `Finger Transitions with Diacritics`,
      titleBn: `বর্ণ ও হরকতের আঙুল সঞ্চালন`,
      instructionAr: `تنقل بسلاسة بين يد الحرف ويد مفتاح Shift لإتقان الإيقاع التوافقي.`,
      instructionEn: `Transition smoothly between letter strikes and Shift key combinations.`,
      instructionBn: `শিফট ও অক্ষরের মাঝে সমন্বয় তৈরি করে মসৃণভাবে টাইপ করুন।`,
      targetText: `ق${harakatSymbol} ف${harakatSymbol} ع${harakatSymbol} غ${harakatSymbol} ه${harakatSymbol} خ${harakatSymbol} ح${harakatSymbol} ج${harakatSymbol} ص${harakatSymbol} ض${harakatSymbol} د${harakatSymbol} ث${harakatSymbol}`,
    },
    {
      pageNumber: 5,
      purpose: 'mixed',
      titleAr: `الكلمات الثلاثية البسيطة مع التشكيل`,
      titleEn: `Simple 3-Letter Vocalized Words`,
      titleBn: `সহজ তিন অক্ষরের হরকতযুক্ত শব্দ`,
      instructionAr: `اكتب أفعالاً وجذوراً عربية ثلاثية مشكولة بالكامل.`,
      instructionEn: `Type authentic three-letter root verbs fully vocalized with diacritics.`,
      instructionBn: `তিন অক্ষরের ক্রিয়ামূলসমূহ হরকত সহ টাইপ করুন।`,
      targetText: `${exStr.slice(0, 45)} ${exStr.slice(0, 45)}`,
    },
    {
      pageNumber: 6,
      purpose: 'words',
      titleAr: `الكلمات المشكولة الشائعة`,
      titleEn: `Common Fully Vocalized Words`,
      titleBn: `বহুল ব্যবহৃত হরকতযুক্ত শব্দ`,
      instructionAr: `ركز على موضع كل حركة فوق أو تحت الحرف بدقة وانتباه.`,
      instructionEn: `Pay careful attention to the placement of each diacritic mark.`,
      instructionBn: `প্রতিটি হরকত বর্ণের উপরে বা নিচে সঠিক স্থানে প্রয়োগ করুন।`,
      targetText: `${exStr} ${exStr}`,
    },
    {
      pageNumber: 7,
      purpose: 'words',
      titleAr: `الكلمات المشكولة المركبة مع أل التعريف`,
      titleEn: `Vocalized Words with Definite Article`,
      titleBn: `আলিফ-লাম যুক্ত হরকতযুক্ত শব্দ`,
      instructionAr: `اكتب الكلمات المعرفة بـ (أل) المشكولة بالكامل.`,
      instructionEn: `Type words with vocalized definite articles and diacritics.`,
      instructionBn: `আলিফ-লাম সহ যুক্তশব্দগুলো হরকত সহ টাইপ করুন।`,
      targetText: `الْكِتَابُ الْمَدْرَسَةُ الْمُعَلِّمُ التِّلْمِيذُ الْقَلَمُ الْفَصْلُ الدَّرْسُ الْعِلْمُ`,
    },
    {
      pageNumber: 8,
      purpose: 'combinations',
      titleAr: `العبارات المشكولة البليغة`,
      titleEn: `Eloquent Vocalized Phrases`,
      titleBn: `হরকতযুক্ত অর্থপূর্ণ বাক্যখণ্ড`,
      instructionAr: `تدرب على كتابة تراكيب إضافية ونعتية مشكولة بدقة متناهية.`,
      instructionEn: `Practice typing grammatical phrases with precise diacritics.`,
      instructionBn: `ব্যাকরণগত হরকতযুক্ত বাক্যখণ্ডগুলো অভ্যাস করুন।`,
      targetText: `طَلَبُ الْعِلْمِ نُورُ الْحَقِّ حُسْنُ الْخُلُقِ صِدْقُ الْقَوْلِ عَمَلٌ صَالِحٌ`,
    },
    {
      pageNumber: 9,
      purpose: 'words',
      titleAr: `الجمل القرآنية والأدبية المشكولة`,
      titleEn: `Vocalized Classical Sentences`,
      titleBn: `হরকতযুক্ত পূর্ণাঙ্গ সাহিত্যিক বাক্য`,
      instructionAr: `اكتب نصوصاً وجُملاً عربية فصيحة مشكولة بالكامل بأعلى معايير الإتقان.`,
      instructionEn: `Type fully vocalized classical Arabic sentences with utmost precision.`,
      instructionBn: `পূর্ণাঙ্গ হরকত সহ ধ্রুপদী আরবি বাক্যগুলো টাইপ করুন।`,
      targetText: `${sent1} ${sent2}`,
    },
    {
      pageNumber: 10,
      purpose: 'accuracy',
      titleAr: `تحدي الدقة في التشكيل (98%+)`,
      titleEn: `Diacritic Precision Challenge (98%+)`,
      titleBn: `হরকত নির্ভুলতা চ্যালেঞ্জ (৯৮%+)`,
      instructionAr: `الحركات تتطلب تركيزاً مضاعفاً! احرص على ألا تخطئ في أي حركة.`,
      instructionEn: `Diacritics demand double focus! Ensure 100% accurate keystrokes without rush.`,
      instructionBn: `হরকত টাইপিংয়ে বাড়তি সতর্কতা প্রয়োজন, কোনো ভুল না করে শান্তভাবে টাইপ করুন।`,
      targetText: `${exStr.slice(0, 50)} ${sent1}`,
    },
    {
      pageNumber: 11,
      purpose: 'speed',
      titleAr: `بناء تدفق السرعة مع التشكيل`,
      titleEn: `Speed Flow with Diacritics`,
      titleBn: `হরকত সহ টাইপিং গতি বৃদ্ধি`,
      instructionAr: `اربط حركة يدك مع مفتاح Shift بتناغم لتسريع وتيرة كتابة التشكيل.`,
      instructionEn: `Harmonize hand coordination with Shift to accelerate vocalized typing flow.`,
      instructionBn: `শিফট ব্যবহারের গতি বাড়িয়ে সাবলীলভাবে হরকতযুক্ত লেখা এগিয়ে নিন।`,
      targetText: `كَتَبَ قَرَأَ عَلِمَ فَهِمَ حَمِدَ شَكَرَ صَبَرَ ظَفَرَ ${sent2}`,
    },
    {
      pageNumber: 12,
      purpose: 'test',
      titleAr: `الاختبار النهائي لإتقان التشكيل والحركات`,
      titleEn: `Diacritics Mastery Benchmark`,
      titleBn: `হরকত পাঠ সমাপনী পরীক্ষা`,
      instructionAr: `اختبار ختامي شامل يثبت جدارتك في كتابة التشكيل بدقة وسرعة فائقة.`,
      instructionEn: `Comprehensive final test proving your mastery of Arabic diacritics.`,
      instructionBn: `হরকত টাইপিংয়ে পূর্ণ দক্ষতা অর্জনের চূড়ান্ত পরীক্ষা সম্পন্ন করুন।`,
      targetText: `${sent1} ${sent2} ${exStr.slice(0, 40)}`,
    },
  ];

  return pages;
}

/**
 * Generates 12 substantial pages for Advanced text and literature lessons
 */
export function generateAdvancedLessonPages(
  titleAr: string,
  titleEn: string,
  titleBn: string,
  paragraphs: string[]
): LessonPage[] {
  const p1 = paragraphs[0] || 'الْإِتْقَانُ فِي الْعَمَلِ رَكِيزَةٌ أَسَاسِيَّةٌ لِبِنَاءِ الْحَضَارَاتِ.';
  const p2 = paragraphs[1] || 'اللُّغَةُ الْعَرَبِيَّةُ بَحْرٌ زَاخِرٌ بِالدُّرَرِ وَالْمَعَانِي الْبَلِيغَةِ.';
  const p3 = paragraphs[2] || 'تَسْعَى الْأُمَمُ الْمُتَقَدِّمَةُ إِلَى تَرْسِيخِ قِيَمِ الْعِلْمِ وَالْمَعْرِفَةِ.';

  const pages: LessonPage[] = [
    {
      pageNumber: 1,
      purpose: 'intro',
      titleAr: `مدخل النص والتوجيه الفكري`,
      titleEn: `Passage Orientation`,
      titleBn: `পাঠ্যাংশের প্রারম্ভিক নির্দেশনা`,
      instructionAr: `اقرأ المقطع الأول بتدبر ثم اكتبه بثقة وسلاسة مستمرة.`,
      instructionEn: `Read the opening passage attentively, then type with poise and continuous cadence.`,
      instructionBn: `অনুচ্ছেদটি পাঠ করুন এবং অবিচ্ছিন্ন গতিতে টাইপ করুন।`,
      targetText: p1,
    },
    {
      pageNumber: 2,
      purpose: 'single',
      titleAr: `تراكيب المفردات اللغوية المتقدمة`,
      titleEn: `Advanced Linguistic Formations`,
      titleBn: `উন্নত শব্দগঠন ও বাক্যরীতি`,
      instructionAr: `ركز على ترابط الأصابع مع علامات الترقيم والحروف المتتابعة.`,
      instructionEn: `Focus on finger flow through punctuation and successive multi-syllable words.`,
      instructionBn: `বিরামচিহ্ন ও জটিল শব্দগুলোতে আঙুলের সাবলীলতা বজায় রাখুন।`,
      targetText: `${p1.slice(0, 70)} ${p2.slice(0, 70)}`,
    },
    {
      pageNumber: 3,
      purpose: 'combinations',
      titleAr: `النصوص المركبة المتسلسلة`,
      titleEn: `Sequential Prose Structure`,
      titleBn: `ধারাবাহিক গদ্য শৈলী`,
      instructionAr: `حافظ على وتيرة طباعة ثابتة دون التوقف المفاجئ بين الجمل.`,
      instructionEn: `Maintain steady cadence without sudden pauses between sentences.`,
      instructionBn: `বাক্যের মাঝে অনাকাঙ্ক্ষিত বিরতি না দিয়ে গতি ধরে রাখুন।`,
      targetText: p2,
    },
    {
      pageNumber: 4,
      purpose: 'alternating',
      titleAr: `التناوب اللغوي والانسيابية الأدبية`,
      titleEn: `Literary Flow & Cadence`,
      titleBn: `সাহিত্যিক প্রবাহ ও ছন্দের ভারসাম্য`,
      instructionAr: `اكتب بتدفق ذهني مريح كأنك تقرأ النص بصوت خفي في عقلك.`,
      instructionEn: `Type with relaxed mental momentum as if softly narrating the prose.`,
      instructionBn: `মনে মনে পাঠটি আবৃত্তি করে ছন্দময় গতিতে টাইপ করুন।`,
      targetText: `${p2} ${p3.slice(0, 50)}`,
    },
    {
      pageNumber: 5,
      purpose: 'mixed',
      titleAr: `التراكيب البلاغية والأسلوبية`,
      titleEn: `Rhetorical Arabic Mastery`,
      titleBn: `আলংকারিক আরবি ভাষার শৈলী`,
      instructionAr: `اكتب العبارات الفصيحة بدقة تامة مع مراعاة التنوين والهمزات.`,
      instructionEn: `Type eloquent classical prose with strict attention to Tanween and Hamza forms.`,
      instructionBn: `হামজা ও তানভীন সহ আলংকারিক ভাষা নির্ভুলভাবে লিখুন।`,
      targetText: p3,
    },
    {
      pageNumber: 6,
      purpose: 'words',
      titleAr: `الفقرات المتكاملة (الجزء الأول)`,
      titleEn: `Cohesive Paragraphs (Part 1)`,
      titleBn: `সমন্বিত অনুচ্ছেদ (পর্ব ১)`,
      instructionAr: `انتقل لمستوى الفقرات المتصلة الطويلة لبناء طاقة التحمل العضلية.`,
      instructionEn: `Advance to sustained paragraphs to build finger stamina and typing endurance.`,
      instructionBn: `আঙুলের সহনশীলতা ও গতি বৃদ্ধির জন্য দীর্ঘ অনুচ্ছেদ টাইপ করুন।`,
      targetText: `${p1} ${p2}`,
    },
    {
      pageNumber: 7,
      purpose: 'words',
      titleAr: `الفقرات المتكاملة (الجزء الثاني)`,
      titleEn: `Cohesive Paragraphs (Part 2)`,
      titleBn: `সমন্বিত অনুচ্ছেদ (পর্ব ২)`,
      instructionAr: `تابع الطباعة الاحترافية مع الحفاظ على وضعية الجلوس الصحيحة.`,
      instructionEn: `Continue professional typing while maintaining ergonomic posture.`,
      instructionBn: `সঠিক শারীরিক অঙ্গবিন্যাস বজায় রেখে সাবলীলভাবে লিখুন।`,
      targetText: `${p2} ${p3}`,
    },
    {
      pageNumber: 8,
      purpose: 'combinations',
      titleAr: `نصوص الفصاحة والحكمة العربية`,
      titleEn: `Classical Wisdom & Eloquence`,
      titleBn: `ধ্রুপদী প্রজ্ঞা ও বাণীর সংকলন`,
      instructionAr: `اكتب روائع الحكمة العربية المأثورة بدقة وانسياب.`,
      instructionEn: `Type timeless Arabic wisdom with supreme clarity and rhythmic flow.`,
      instructionBn: `ধ্রুপদী বাণী ও প্রবাদসমূহ মনোযোগ সহকারে টাইপ করুন।`,
      targetText: `${p3} ${p1}`,
    },
    {
      pageNumber: 9,
      purpose: 'words',
      titleAr: `النص الكامل غير المنقطع`,
      titleEn: `Unbroken Long Text`,
      titleBn: `অবিচ্ছিন্ন দীর্ঘ পাঠ্যাংশ`,
      instructionAr: `تحدي الكتابة المتواصلة دون انقطاع عبر كامل مساحة النص.`,
      instructionEn: `Continuous typing challenge across the entire scope of the text.`,
      instructionBn: `পুরো পাঠ্যাংশটি বিরতিহীনভাবে দ্রুত টাইপ করুন।`,
      targetText: `${p1} ${p2} ${p3}`,
    },
    {
      pageNumber: 10,
      purpose: 'accuracy',
      titleAr: `تحدي الدقة الاحترافية (99%+)`,
      titleEn: `Professional Accuracy Benchmark (99%+)`,
      titleBn: `পেশাদার নির্ভুলতা যাচাই (৯৯%+)`,
      instructionAr: `معيار المحترفين: دقة تكاد تقترب من الكمال دون أي ضربة خاطئة.`,
      instructionEn: `The professional standard: near-flawless accuracy without errant strokes.`,
      instructionBn: `পেশাদার মানদণ্ড: কোনো ভুল ছাড়াই নিখুঁত টাইপিং সম্পন্ন করুন।`,
      targetText: `${p2} ${p1}`,
    },
    {
      pageNumber: 11,
      purpose: 'speed',
      titleAr: `سباق السرعة القصوى (45+ كلمة/دقيقة)`,
      titleEn: `Maximum Velocity Sprint (45+ WPM)`,
      titleBn: `সর্বোচ্চ গতি স্প্রিন্ট (৪৫+ ডব্লিউপিএম)`,
      instructionAr: `أطلق العنان لسرعتك الحقيقية واضرب المفاتيح بثقة مطلقة.`,
      instructionEn: `Unleash your true speed and strike the keys with complete confidence.`,
      instructionBn: `আপনার সর্বোচ্চ গতিতে আত্মবিশ্বাসের সাথে টাইপ করে যান।`,
      targetText: `${p1} ${p3}`,
    },
    {
      pageNumber: 12,
      purpose: 'test',
      titleAr: `الاختبار النهائي للمستوى المتقدم`,
      titleEn: `Advanced Graduation Milestone`,
      titleBn: `অ্যাডভান্সড পাঠ সমাপনী চূড়ান্ত পরীক্ষা`,
      instructionAr: `اختبار ختامي شامل يبرهن على جاهزيتك التامة لخوض امتحان الشهادة النهائية.`,
      instructionEn: `Comprehensive final test proving your full readiness for the Master Certification Exam.`,
      instructionBn: `মাস্টার সার্টিফিকেশন পরীক্ষার জন্য নিজের প্রস্তুতি যাচাই করুন।`,
      targetText: `${p1} ${p2} ${p3}`,
    },
  ];

  return pages;
}

// =========================================================================
// 3 MASTER COURSE LEVELS
// =========================================================================

export const COURSES: Course[] = [
  {
    id: 'course-beginner',
    order: 1,
    titleAr: 'المستوى 1: المبتدئ — الحروف العربية الأساسية',
    titleEn: 'Level 1: Beginner — Arabic Letters',
    titleBn: 'লেভেল ১: বিগিনার — আরবি মূল বর্ণমালা',
    descriptionAr: 'تعلم جميع الحروف العربية على لوحة المفاتيح 101 القياسية بإدخال مفتاحين في كل درس وبناء الذاكرة العضلية حتى إتقان الحروف والكلمات والجمل البسيطة، يليه امتحان شهادة المبتدئ.',
    descriptionEn: 'Master all Arabic letters on the 101 keyboard, 2 keys at a time with 12-page drills until fluent in letters, words, and basic sentences, followed by the Beginner Exam.',
    descriptionBn: 'আরবি ১০১ কীবোর্ডের সকল বর্ণ জোড়ায় জোড়ায় পুঙ্খানুপুঙ্খভাবে অনুশীলন করুন এবং বিগিনার সার্টিফিকেট অর্জন করুন।',
    category: 'foundation',
    iconName: 'Keyboard',
    lessonIds: [
      'l-1-1', 'l-1-2', 'l-2-1', 'l-2-2', 'l-2-3', 'l-2-4',
      'l-3-1', 'l-3-2', 'l-3-3', 'l-3-4', 'l-3-5', 'l-3-6',
      'l-4-1', 'l-4-2', 'l-4-3', 'l-4-4'
    ],
  },
  {
    id: 'course-intermediate',
    order: 2,
    titleAr: 'المستوى 2: المتوسط — التشكيل والحركات العربية',
    titleEn: 'Level 2: Intermediate — Arabic Letters + Harakat',
    titleBn: 'লেভেল ২: ইন্টারমিডিয়েট — হরকত ও তাশকিল',
    descriptionAr: 'إتقان حركات التشكيل العربي تدريجياً: الفتحة، الضمة، الكسرة، السكون، الشدة، والتنوين بأنواعه مع الكلمات والجمل المشكولة بالكامل، يليه امتحان شهادة المتوسط.',
    descriptionEn: 'Precision typing of all Arabic diacritics (Fatha, Damma, Kasra, Sukoon, Shaddah, Tanween) with fully vocalized text, followed by the Intermediate Exam.',
    descriptionBn: 'যবর, যের, পেশ, সাকিন, তাশদীদ ও তানভীন সহ পূর্ণাঙ্গ হরকতযুক্ত টাইপিং এবং ইন্টারমিডিয়েট সার্টিফিকেট।',
    category: 'diacritics',
    iconName: 'Type',
    lessonIds: [
      'l-int-1', 'l-int-2', 'l-int-3', 'l-int-4', 'l-int-5', 'l-int-6', 'l-int-7'
    ],
  },
  {
    id: 'course-advanced',
    order: 3,
    titleAr: 'المستوى 3: المتقدم — النصوص الكاملة والاحترافية',
    titleEn: 'Level 3: Advanced — Full Arabic Text & Mastery',
    titleBn: 'লেভেল ৩: অ্যাডভান্সড — পূর্ণাঙ্গ পাঠ্যাংশ ও পেশাদার টাইপিং',
    descriptionAr: 'كتابة الكلمات المركبة الطويلة، علامات الترقيم، الفقرات الصحفية، ونصوص الأدب والفصاحة العربية بسرعة وثقة، المؤهلة لامتحان الشهادة الاحترافية الكبرى.',
    descriptionEn: 'Professional typing of long words, complex vocabulary, punctuation, classical prose, and speed marathons leading to the Grand Certification Exam.',
    descriptionBn: 'জটিল শব্দ, বিরামচিহ্ন, সংবাদ নিবন্ধ ও সাহিত্যিক গদ্যের সাবলীল পেশাদার টাইপিং এবং গ্র্যান্ড সার্টিফিকেশন।',
    category: 'advanced',
    iconName: 'Award',
    lessonIds: [
      'l-adv-1', 'l-adv-2', 'l-adv-3', 'l-adv-4', 'l-adv-5', 'l-adv-6', 'l-adv-7', 'l-adv-8'
    ],
  },
];

// Helper to construct a strictly validated Beginner lesson
function createBeginnerLesson(params: {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  titleBn: string;
  descriptionAr: string;
  descriptionEn: string;
  descriptionBn: string;
  difficulty: LessonDifficulty;
  newKeys: string[];
  previouslyLearnedKeys: string[];
  estimatedSeconds: number;
}): Lesson {
  const rules = computeLessonKeyRules(params.newKeys, params.previouslyLearnedKeys);
  const k1 = params.newKeys[0];
  const k2 = params.newKeys[1] || params.newKeys[0];
  const k3 = params.newKeys[2];

  const pages = generateTwoKeyLessonPages(
    k1,
    k2,
    rules.previouslyLearnedKeys,
    params.titleAr,
    params.titleEn,
    params.titleBn,
    k3
  );

  const vocabKey = k3 ? `${k1}_${k2}_${k3}` : `${k1}_${k2}`;
  const vocab = LETTER_VOCABULARY[vocabKey];
  const rawTarget = vocab
    ? `${vocab.shortWords.slice(0, 8).join(' ')} ${vocab.longerWords.slice(0, 4).join(' ')}`
    : `${k1} ${k2} ${k1}${k2} ${k2}${k1}`;
  const targetText = sanitizeLessonText(rawTarget, rules.allowedKeys);

  return {
    id: params.id,
    courseId: 'course-beginner',
    level: 1,
    order: params.order,
    titleAr: params.titleAr,
    titleEn: params.titleEn,
    titleBn: params.titleBn,
    descriptionAr: params.descriptionAr,
    descriptionEn: params.descriptionEn,
    descriptionBn: params.descriptionBn,
    difficulty: params.difficulty,
    newKeys: rules.newKeys,
    focusKeys: rules.newKeys,
    previouslyLearnedKeys: rules.previouslyLearnedKeys,
    allowedKeys: rules.allowedKeys,
    forbiddenKeys: rules.forbiddenKeys,
    pages,
    totalPages: pages.length,
    targetText,
    estimatedSeconds: params.estimatedSeconds,
  };
}

// -------------------------------------------------------------
// PROGRESSIVE UNLOCK ACCUMULATOR FOR 16 BEGINNER LESSONS
// -------------------------------------------------------------
const kL1 = ['ب', 'ت'];
const kL2 = ['ي', 'ل'];
const kL3 = ['ا', 'ن'];
const kL4 = ['م', 'ك'];
const kL5 = ['س', 'ش'];
const kL6 = ['ط', 'ذ'];
const kL7 = ['ق', 'ف'];
const kL8 = ['ع', 'غ'];
const kL9 = ['ه', 'خ'];
const kL10 = ['ح', 'ج'];
const kL11 = ['ص', 'ض'];
const kL12 = ['د', 'ث'];
const kL13 = ['ر', 'ى'];
const kL14 = ['ة', 'و'];
const kL15 = ['ز', 'ظ'];
const kL16 = ['ئ', 'ء', 'ؤ'];

const prev0: string[] = [];
const prev1 = [...kL1];
const prev2 = [...prev1, ...kL2];
const prev3 = [...prev2, ...kL3];
const prev4 = [...prev3, ...kL4];
const prev5 = [...prev4, ...kL5];
const prev6 = [...prev5, ...kL6];
const prev7 = [...prev6, ...kL7];
const prev8 = [...prev7, ...kL8];
const prev9 = [...prev8, ...kL9];
const prev10 = [...prev9, ...kL10];
const prev11 = [...prev10, ...kL11];
const prev12 = [...prev11, ...kL12];
const prev13 = [...prev12, ...kL13];
const prev14 = [...prev13, ...kL14];
const prev15 = [...prev14, ...kL15];

export const ALL_LESSONS: Lesson[] = [
  // -------------------------------------------------------------
  // LEVEL 1: BEGINNER — ALL ARABIC LETTERS (16 LESSONS)
  // -------------------------------------------------------------
  createBeginnerLesson({
    id: 'l-1-1',
    order: 1,
    titleAr: 'ب + ت (مفتاحا الارتكاز الأساسيان)',
    titleEn: 'Baa + Taa (Anchor Keys)',
    titleBn: 'ب + ت (প্রধান দুটি অ্যাঙ্কর কী)',
    descriptionAr: 'السبابة اليسرى على حرف الباء (F) والسبابة اليمنى على حرف التاء (J).',
    descriptionEn: 'Rest left index on Baa (F) and right index on Taa (J).',
    descriptionBn: 'বাম তর্জনী ب (F) এবং ডান তর্জনী ت (J) এর উপর রাখুন।',
    difficulty: 'beginner',
    newKeys: kL1,
    previouslyLearnedKeys: prev0,
    estimatedSeconds: 90,
  }),

  createBeginnerLesson({
    id: 'l-1-2',
    order: 2,
    titleAr: 'ي + ل (حركة الوسطى وامتداد السبابة)',
    titleEn: 'Yaa + Lam (Inner Reach & Middle)',
    titleBn: 'ي + ل (মধ্যমা ও ভিতরের তর্জনী)',
    descriptionAr: 'الوسطى اليسرى على الياء (D) والسبابة اليسرى تمتد لليمين للام (G).',
    descriptionEn: 'Left middle on Yaa (D) and left index stretches to Lam (G).',
    descriptionBn: 'বাম মধ্যমা ي (D) এবং বাম তর্জনী ل (G) এর দিকে প্রসারণ।',
    difficulty: 'beginner',
    newKeys: kL2,
    previouslyLearnedKeys: prev1,
    estimatedSeconds: 95,
  }),

  createBeginnerLesson({
    id: 'l-2-1',
    order: 3,
    titleAr: 'ا + ن (الألف والنون)',
    titleEn: 'Alif + Noon (Home Core)',
    titleBn: 'ا + ن (আলিফ ও নুন)',
    descriptionAr: 'السبابة اليمنى تمتد للألف (H) والوسطى اليمنى على النون (K).',
    descriptionEn: 'Right index stretches to Alif (H) and right middle on Noon (K).',
    descriptionBn: 'ডান তর্জনী ا (H) এবং ডান মধ্যমা ن (K) এর উপর।',
    difficulty: 'beginner',
    newKeys: kL3,
    previouslyLearnedKeys: prev2,
    estimatedSeconds: 100,
  }),

  createBeginnerLesson({
    id: 'l-2-2',
    order: 4,
    titleAr: 'م + ك (الميم والكاف)',
    titleEn: 'Meem + Kaaf (Ring & Pinky)',
    titleBn: 'م + ك (মিম ও কাফ)',
    descriptionAr: 'البنصر الأيمن على الميم (L) والخنصر الأيمن على الكاف (;).',
    descriptionEn: 'Right ring on Meem (L) and right pinky on Kaaf (;).',
    descriptionBn: 'ডান অনামিকা م (L) এবং ডান কনিষ্ঠা ك (;) এর উপর।',
    difficulty: 'beginner',
    newKeys: kL4,
    previouslyLearnedKeys: prev3,
    estimatedSeconds: 105,
  }),

  createBeginnerLesson({
    id: 'l-2-3',
    order: 5,
    titleAr: 'س + ش (السين والشين)',
    titleEn: 'Seen + Sheen (Left Ring & Pinky)',
    titleBn: 'س + ش (সিন ও শিন)',
    descriptionAr: 'البنصر الأيسر على السين (S) والخنصر الأيسر على الشين (A).',
    descriptionEn: 'Left ring on Seen (S) and left pinky on Sheen (A).',
    descriptionBn: 'বাম অনামিকা س (S) এবং বাম কনিষ্ঠা ش (A) এর উপর।',
    difficulty: 'easy',
    newKeys: kL5,
    previouslyLearnedKeys: prev4,
    estimatedSeconds: 110,
  }),

  createBeginnerLesson({
    id: 'l-2-4',
    order: 6,
    titleAr: 'ط + ذ (الطاء والذال)',
    titleEn: 'Taa + Thaal (Home Edge Keys)',
    titleBn: 'ط + ذ (ত্বোয়া ও যাল)',
    descriptionAr: 'الخنصر الأيمن يمتد للطاء (\') والخنصر الأيسر للأعلى للذال (`).',
    descriptionEn: 'Right pinky on Taa (\') and left pinky on Thaal (`).',
    descriptionBn: 'ডান কনিষ্ঠা ط এবং বাম কনিষ্ঠা ذ এর প্রান্তে।',
    difficulty: 'easy',
    newKeys: kL6,
    previouslyLearnedKeys: prev5,
    estimatedSeconds: 110,
  }),

  createBeginnerLesson({
    id: 'l-3-1',
    order: 7,
    titleAr: 'ق + ف (القاف والفاء)',
    titleEn: 'Qaaf + Faa (Top Row Reaches)',
    titleBn: 'ق + ف (ক্বাফ ও ফা)',
    descriptionAr: 'السبابة اليمنى تصعد للقاف (R) والسبابة اليسرى تصعد للفاء (T).',
    descriptionEn: 'Right index reaches up to Qaaf (R) and left index up to Faa (T).',
    descriptionBn: 'ডান তর্জনী ق (R) এবং বাম তর্জনী ف (T) এর উপরে।',
    difficulty: 'easy',
    newKeys: kL7,
    previouslyLearnedKeys: prev6,
    estimatedSeconds: 115,
  }),

  createBeginnerLesson({
    id: 'l-3-2',
    order: 8,
    titleAr: 'ع + غ (العين والغين)',
    titleEn: 'Ayn + Ghayn (Top Center)',
    titleBn: 'ع + غ (আইন ও গাইন)',
    descriptionAr: 'السبابة اليمنى تصعد لليمين للعين (U) والسبابة اليسرى للغين (Y).',
    descriptionEn: 'Right index to Ayn (U) and left index to Ghayn (Y).',
    descriptionBn: 'ডান তর্জনী ع (U) এবং বাম তর্জনী غ (Y) এর উপরে।',
    difficulty: 'medium',
    newKeys: kL8,
    previouslyLearnedKeys: prev7,
    estimatedSeconds: 115,
  }),

  createBeginnerLesson({
    id: 'l-3-3',
    order: 9,
    titleAr: 'هـ + خ (الهاء والخاء)',
    titleEn: 'Haa + Khaa (Top Right)',
    titleBn: 'هـ + خ (হা ও খা)',
    descriptionAr: 'الوسطى اليمنى تصعد للهاء (I) والبنصر الأيمن للخاء (O).',
    descriptionEn: 'Right middle reaches up to Haa (I) and right ring to Khaa (O).',
    descriptionBn: 'ডান মধ্যমা هـ (I) এবং ডান অনামিকা خ (O) এর উপরে।',
    difficulty: 'medium',
    newKeys: kL9,
    previouslyLearnedKeys: prev8,
    estimatedSeconds: 120,
  }),

  createBeginnerLesson({
    id: 'l-3-4',
    order: 10,
    titleAr: 'ح + ج (الحاء والجيم)',
    titleEn: 'Haa + Jeem (Top Far Right)',
    titleBn: 'ح + ج (হ্বো ও জিম)',
    descriptionAr: 'الخنصر الأيمن يصعد للحاء (P) ويمتد للجيم ([).',
    descriptionEn: 'Right pinky reaches to Haa (P) and Jeem ([).',
    descriptionBn: 'ডান কনিষ্ঠা ح (P) এবং ج ([) এর উপরে।',
    difficulty: 'medium',
    newKeys: kL10,
    previouslyLearnedKeys: prev9,
    estimatedSeconds: 120,
  }),

  createBeginnerLesson({
    id: 'l-3-5',
    order: 11,
    titleAr: 'ص + ض (الصاد والضاد)',
    titleEn: 'Saad + Daad (Top Left)',
    titleBn: 'ص + ض (সোয়াদ ও দোয়াদ)',
    descriptionAr: 'الخنصر الأيسر يصعد للضاد (Q) والبنصر الأيسر للصاد (W).',
    descriptionEn: 'Left pinky reaches up to Daad (Q) and left ring to Saad (W).',
    descriptionBn: 'বাম কনিষ্ঠা ض (Q) এবং বাম অনামিকা ص (W) এর উপরে।',
    difficulty: 'medium',
    newKeys: kL11,
    previouslyLearnedKeys: prev10,
    estimatedSeconds: 120,
  }),

  createBeginnerLesson({
    id: 'l-3-6',
    order: 12,
    titleAr: 'د + ث (الدال والثاء)',
    titleEn: 'Daal + Thaa (Top Outer)',
    titleBn: 'د + ث (দাল ও ছা)',
    descriptionAr: 'الوسطى اليسرى تصعد للثاء (E) والخنصر الأيمن للدال (]).',
    descriptionEn: 'Left middle reaches to Thaa (E) and right pinky to Daal (]).',
    descriptionBn: 'বাম মধ্যমা ث (E) এবং ডান কনিষ্ঠা د (]) এর উপরে।',
    difficulty: 'medium',
    newKeys: kL12,
    previouslyLearnedKeys: prev11,
    estimatedSeconds: 120,
  }),

  createBeginnerLesson({
    id: 'l-4-1',
    order: 13,
    titleAr: 'ر + ى (الراء والألف المقصورة)',
    titleEn: 'Raa + Alif Maqsura (Bottom Row Reach)',
    titleBn: 'ر + ى (রা ও আলিফ মাকসুরা)',
    descriptionAr: 'السبابة اليسرى تهبط للراء (V) والسبابة اليمنى للألف المقصورة (N).',
    descriptionEn: 'Left index reaches down to Raa (V) and right index to Alif Maqsura (N).',
    descriptionBn: 'বাম তর্জনী ر (V) এবং ডান তর্জনী ى (N) এর নিচে।',
    difficulty: 'medium',
    newKeys: kL13,
    previouslyLearnedKeys: prev12,
    estimatedSeconds: 120,
  }),

  createBeginnerLesson({
    id: 'l-4-2',
    order: 14,
    titleAr: 'ة + و (التاء المربوطة والواو)',
    titleEn: 'Taa Marbuta + Waw (Bottom Row)',
    titleBn: 'ة + و (তা মারবুতা ও ওয়াও)',
    descriptionAr: 'الوسطى اليسرى تهبط للتاء المربوطة (C) والبنصر الأيمن للواو (,).',
    descriptionEn: 'Left middle reaches to Taa Marbuta (C) and right ring to Waw (,).',
    descriptionBn: 'বাম মধ্যমা ة (C) এবং ডান অনামিকা و (,) এর নিচে।',
    difficulty: 'medium',
    newKeys: kL14,
    previouslyLearnedKeys: prev13,
    estimatedSeconds: 125,
  }),

  createBeginnerLesson({
    id: 'l-4-3',
    order: 15,
    titleAr: 'ز + ظ (الزاي والظاء)',
    titleEn: 'Zay + Dhaa (Bottom Far Reaches)',
    titleBn: 'ز + ظ (যাই ও জোয়া)',
    descriptionAr: 'الوسطى اليمنى تهبط للزاي (.) والخنصر الأيمن للظاء (/).',
    descriptionEn: 'Right middle down to Zay (.) and right pinky down to Dhaa (/).',
    descriptionBn: 'ডান মধ্যমা ز (.) এবং ডান কনিষ্ঠা ظ (/) এর নিচে।',
    difficulty: 'hard',
    newKeys: kL15,
    previouslyLearnedKeys: prev14,
    estimatedSeconds: 125,
  }),

  createBeginnerLesson({
    id: 'l-4-4',
    order: 16,
    titleAr: 'ئ + ء + ؤ (أشكال الهمزات)',
    titleEn: 'Hamza Forms (ئ, ء, ؤ)',
    titleBn: 'ئ + ء + ؤ (বিভিন্ন হামজা রূপ)',
    descriptionAr: 'الخنصر الأيسر على الهمزة على نبرة (Z) والبنصر الأيسر على الهمزة السطرية (X) والوسطى اليسرى على الهمزة على واو (C+Shift).',
    descriptionEn: 'Master all Hamza forms: Ya-Hamza (Z), standalone Hamza (X), and Waw-Hamza (C+Shift).',
    descriptionBn: 'কীবোর্ডের নিচের সারির বিভিন্ন হামজা রূপ অনুশীলন করুন।',
    difficulty: 'hard',
    newKeys: kL16,
    previouslyLearnedKeys: prev15,
    estimatedSeconds: 130,
  }),

  // -------------------------------------------------------------
  // LEVEL 2: INTERMEDIATE — ARABIC LETTERS + HARAKAT (7 LESSONS)
  // -------------------------------------------------------------
  {
    id: 'l-int-1',
    courseId: 'course-intermediate',
    level: 2,
    order: 17,
    titleAr: 'الفتحة والكسرة (Shift + Q, Shift + A)',
    titleEn: 'Fatha & Kasra Diacritics',
    titleBn: 'যবর ও যের (ফাতহাহ ও কাসরাহ)',
    descriptionAr: 'تعلم كتابة الفتحة عبر Shift + Q والكسرة عبر Shift + A مع الأفعال الثلاثية.',
    descriptionEn: 'Master typing Fatha (Shift + Q) and Kasra (Shift + A) with authentic Arabic root verbs.',
    descriptionBn: 'শিফট কি ব্যবহার করে যবর ও যের টাইপ করার অনুশীলন।',
    difficulty: 'easy',
    newKeys: ['َ', 'ِ'],
    focusKeys: ['َ', 'ِ'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ'],
    forbiddenKeys: ['ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    pages: generateHarakatLessonPages(
      'َ',
      'الفتحة والكسرة',
      'Fatha & Kasra',
      'যবর ও যের',
      ['كَتَبَ', 'شَرِبَ', 'عَلِمَ', 'فَهِمَ', 'سَمِعَ', 'لَعِبَ', 'رَسَمَ', 'نَزَلَ', 'صَبَرَ'],
      [
        'كَتَبَ التِّلْمِيذُ الدَّرْسَ بِفَهْمٍ وَعِنَايَةٍ فَائِقَةٍ.',
        'سَمِعَ الطَّالِبُ نَصِيحَةَ مُعَلِّمِهِ وَعَمِلَ بِهَا بِصِدْقٍ.'
      ]
    ),
    totalPages: 12,
    targetText: 'كَتَبَ شَرِبَ عَلِمَ فَهِمَ سَمِعَ لَعِبَ رَسَمَ نَزَلَ كَتَبَ التِّلْمِيذُ الدَّرْسَ بِفَهْمٍ وَعِنَايَةٍ فَائِقَةٍ.',
    estimatedSeconds: 120,
  },
  {
    id: 'l-int-2',
    courseId: 'course-intermediate',
    level: 2,
    order: 18,
    titleAr: 'الضمة والسكون (Shift + E, Shift + X)',
    titleEn: 'Damma & Sukoon Diacritics',
    titleBn: 'পেশ ও সাকিন (দাম্মাহ ও সুকুন)',
    descriptionAr: 'تعلم كتابة الضمة عبر Shift + E والسكون عبر Shift + X مع الأفعال المضارعة والأسماء.',
    descriptionEn: 'Master typing Damma (Shift + E) and Sukoon (Shift + X) in verbs and nouns.',
    descriptionBn: 'পেশ ও সুকুন চিহ্নের সাবলীল টাইপিং অনুশীলন।',
    difficulty: 'medium',
    newKeys: ['ُ', 'ْ'],
    focusKeys: ['ُ', 'ْ'],
    previouslyLearnedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ'],
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ'],
    forbiddenKeys: ['ّ', 'ً', 'ٍ', 'ٌ'],
    pages: generateHarakatLessonPages(
      'ُ',
      'الضمة والسكون',
      'Damma & Sukoon',
      'পেশ ও সাকিন',
      ['يَكْتُبُ', 'يَعْلَمُ', 'يَصْبِرُ', 'يَنْجَحُ', 'قُمْ', 'نَمْ', 'كُلْ', 'قُلْ', 'اعْمَلْ'],
      [
        'يَكْتُبُ التِّلْمِيذُ وَاجِبَهُ بِإِتْقَانٍ وَيَعْمَلُ بِجِدٍّ لِيَنْجَحَ.',
        'قُلْ خَيْرًا أَوْ اصْمُتْ لِتَسْلَمَ فِي كُلِّ أَمْرٍ تَقُولُهُ.'
      ]
    ),
    totalPages: 12,
    targetText: 'يَكْتُبُ يَعْلَمُ يَصْبِرُ يَنْجَحُ قُمْ نَمْ كُلْ قُلْ يَكْتُبُ التِّلْمِيذُ وَاجِبَهُ بِإِتْقَانٍ وَيَعْمَلُ بِجِدٍّ.',
    estimatedSeconds: 125,
  },
  {
    id: 'l-int-3',
    courseId: 'course-intermediate',
    level: 2,
    order: 19,
    titleAr: 'الشدة مع الحركات (Shift + `)',
    titleEn: 'Shaddah with Vowels',
    titleBn: 'তাশদীদ ও সংযুক্ত হরকত',
    descriptionAr: 'إتقان موضع الشدة عبر Shift + الذال (~) والجمع بين الشدة والفتحة والضمة والكسرة.',
    descriptionEn: 'Master Shaddah (Shift + ~) and combinations of Shaddah with Fatha, Damma, and Kasra.',
    descriptionBn: 'তাশদীদ সহ হরকতযুক্ত জটিল আরবি অক্ষরের টাইপিং।',
    difficulty: 'medium',
    newKeys: ['ّ'],
    focusKeys: ['ّ', 'َّ', 'ُّ', 'ِّ'],
    previouslyLearnedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ'],
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ'],
    forbiddenKeys: ['ً', 'ٍ', 'ٌ'],
    pages: generateHarakatLessonPages(
      'ّ',
      'الشدة والتضعيف',
      'Shaddah Gemination',
      'তাশদীদ',
      ['عَلَّمَ', 'قَدَّمَ', 'صَدَّقَ', 'فَكَّرَ', 'يُعَلِّمُ', 'يُحِبُّ', 'مُحَمَّدٌ', 'رَبَّنَا'],
      [
        'عَلَّمَ الْمُعَلِّمُ طُلابَهُ حُبَّ الْعِلْمِ وَالْفَضِيلَةِ بِصَبْرٍ.',
        'قَدَّمَ الْعَالِمُ بَحْثًا قَيِّمًا نَفَعَ بِهِ جَمِيعَ النَّاسِ.'
      ]
    ),
    totalPages: 12,
    targetText: 'عَلَّمَ قَدَّمَ صَدَّقَ فَكَّرَ يُعَلِّمُ يُحِبُّ مُحَمَّدٌ عَلَّمَ الْمُعَلِّمُ طُلابَهُ حُبَّ الْعِلْمِ وَالْفَضِيلَةِ.',
    estimatedSeconds: 130,
  },
  {
    id: 'l-int-4',
    courseId: 'course-intermediate',
    level: 2,
    order: 20,
    titleAr: 'تنوين الفتح وتنوين الكسر (Shift + W, Shift + S)',
    titleEn: 'Tanween Fath & Kasr',
    titleBn: 'তানভীন ফাতহ ও কাসর (দুই যবর ও দুই যের)',
    descriptionAr: 'تعلم تنوين الفتح (Shift + W) وتنوين الكسر (Shift + S) مع الأسماء المنونة.',
    descriptionEn: 'Type Tanween Fath (Shift + W) and Tanween Kasr (Shift + S) on indefinite nouns.',
    descriptionBn: 'দুই যবর ও দুই যের সহ তানভীন চিহ্নের টাইপিং।',
    difficulty: 'medium',
    newKeys: ['ً', 'ٍ'],
    focusKeys: ['ً', 'ٍ'],
    previouslyLearnedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ'],
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ'],
    forbiddenKeys: ['ٌ'],
    pages: generateHarakatLessonPages(
      'ً',
      'تنوين الفتح والكسر',
      'Tanween Fath & Kasr',
      'তানভীন ফাতহ ও কাসর',
      ['كِتَابًا', 'قَلَمًا', 'عِلْمًا', 'رَحْمَةً', 'يَوْمًا', 'بَيْتٍ', 'دَرْسٍ', 'مَالٍ', 'خَيْرٍ'],
      [
        'قَرَأْتُ كِتَابًا مُفِيدًا فِي يَوْمٍ جَمِيلٍ وَنِلْتُ عِلْمًا نَافِعًا.',
        'قَدَّمَ الْمُحْسِنُ عَوْنًا لِكُلِّ مُحْتَاجٍ فِي كُلِّ حِينٍ.'
      ]
    ),
    totalPages: 12,
    targetText: 'كِتَابًا قَلَمًا عِلْمًا رَحْمَةً يَوْمًا بَيْتٍ دَرْسٍ قَرَأْتُ كِتَابًا مُفِيدًا فِي يَوْمٍ جَمِيلٍ وَنِلْتُ عِلْمًا.',
    estimatedSeconds: 130,
  },
  {
    id: 'l-int-5',
    courseId: 'course-intermediate',
    level: 2,
    order: 21,
    titleAr: 'تنوين الضم والهمزات المشكولة (Shift + R)',
    titleEn: 'Tanween Damm & Vocalized Hamza',
    titleBn: 'তানভীন দাম্ম (দুই পেশ) ও হরকতযুক্ত হামজা',
    descriptionAr: 'تعلم تنوين الضم عبر Shift + R وكتابة الأسماء المرفوعة المشكولة.',
    descriptionEn: 'Master Tanween Damm (Shift + R) and vocalized Hamza forms.',
    descriptionBn: 'দুই পেশ এবং হরকতযুক্ত হামজার টাইপিং অনুশীলন।',
    difficulty: 'hard',
    newKeys: ['ٌ'],
    focusKeys: ['ٌ'],
    previouslyLearnedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ'],
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    forbiddenKeys: [],
    pages: generateHarakatLessonPages(
      'ٌ',
      'تنوين الضم والهمزة',
      'Tanween Damm',
      'তানভীন দাম্ম',
      ['نُورٌ', 'ضِيَاءٌ', 'كَرِيمٌ', 'عَظِيمٌ', 'رَسُولٌ', 'مُؤْمِنٌ', 'أَمَلٌ', 'سَلامٌ'],
      [
        'الْعِلْمُ نُورٌ سَاطِعٌ وَالْجَهْلُ ظَلامٌ دَامِسٌ يَضُرُّ أَهْلَهُ.',
        'الصَّبْرُ جَمِيلٌ وَعَاقِبَتُهُ خَيْرٌ وَبَرَكَةٌ فِي الدُّنْيَا وَالآخِرَةِ.'
      ]
    ),
    totalPages: 12,
    targetText: 'نُورٌ ضِيَاءٌ كَرِيمٌ عَظِيمٌ رَسُولٌ مُؤْمِنٌ أَمَلٌ سَلامٌ الْعِلْمُ نُورٌ سَاطِعٌ وَالْجَهْلُ ظَلامٌ دَامِسٌ.',
    estimatedSeconds: 135,
  },
  {
    id: 'l-int-6',
    courseId: 'course-intermediate',
    level: 2,
    order: 22,
    titleAr: 'تراكيب الكلمات والعبارات المشكولة',
    titleEn: 'Vocalized Compound Phrases',
    titleBn: 'হরকতযুক্ত যৌগিক শব্দ ও বাক্যখণ্ড',
    descriptionAr: 'تدريبات مكثفة على الكلمات المشكولة المتتالية والمقاطع المعربة.',
    descriptionEn: 'Intensive drills combining fully vocalized phrases, genitive constructs, and adjectives.',
    descriptionBn: 'হরকতযুক্ত সংযুক্ত শব্দ ও বাক্যাংশের উচ্চতর অনুশীলন।',
    difficulty: 'hard',
    newKeys: ['ّ', 'َ', 'ِ', 'ُ'],
    focusKeys: ['َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    previouslyLearnedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    forbiddenKeys: [],
    pages: generateHarakatLessonPages(
      'َ',
      'التراكيب المشكولة التامة',
      'Complete Vocalized Phrases',
      'হরকতযুক্ত পূর্ণাঙ্গ বাক্যাংশ',
      ['بِسْمِ اللَّهِ', 'الْحَمْدُ لِلَّهِ', 'سُبْحَانَ اللَّهِ', 'لا إِلَهَ إِلا اللَّهُ'],
      [
        'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ.',
        'الرَّحْمَنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ.'
      ]
    ),
    totalPages: 12,
    targetText: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ.',
    estimatedSeconds: 140,
  },
  {
    id: 'l-int-7',
    courseId: 'course-intermediate',
    level: 2,
    order: 23,
    titleAr: 'النصوص المشكولة التامة والتحضير للامتحان',
    titleEn: 'Full Vocalized Text & Exam Prep',
    titleBn: 'পূর্ণাঙ্গ হরকতযুক্ত পাঠ্যাংশ ও পরীক্ষার প্রস্তুতি',
    descriptionAr: 'نصوص عربية أدبية مشكولة بالكامل لاختبار الإتقان الشامل قبل التقدم لامتحان شهادة المتوسط.',
    descriptionEn: 'Fully vocalized classical Arabic text preparing you for the Intermediate Certification Exam.',
    descriptionBn: 'ইন্টারমিডিয়েট ফাইনাল পরীক্ষার জন্য পূর্ণাঙ্গ হরকতযুক্ত পাঠের মাধ্যমে চূড়ান্ত প্রস্তুতি।',
    difficulty: 'advanced',
    newKeys: ['ّ', 'َ', 'ِ', 'ُ', 'ْ'],
    focusKeys: ['َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    previouslyLearnedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, 'َ', 'ِ', 'ُ', 'ْ', 'ّ', 'ً', 'ٍ', 'ٌ'],
    forbiddenKeys: [],
    pages: generateHarakatLessonPages(
      'َ',
      'النصوص المشكولة الكاملة',
      'Full Vocalized Benchmark',
      'পূর্ণাঙ্গ হরকতযুক্ত পাঠ্যাংশ',
      ['الْعِلْمُ', 'الأَدَبُ', 'الْحِكْمَةُ', 'الْفَضِيلَةُ', 'الشَّرَفُ', 'الْمُرُوءَةُ'],
      [
        'الْعِلْمُ يَرْفَعُ بَيْتًا لا عِمَادَ لَهُ وَالْجَهْلُ يَهْدِمُ بَيْتَ الْعِزِّ وَالشَّرَفِ.',
        'تَعَلَّمْ فَلَيْسَ الْمَرْءُ يُولَدُ عَالِمًا وَلَيْسَ أَخُو عِلْمٍ كَمَنْ هُوَ جَاهِلُ.'
      ]
    ),
    totalPages: 12,
    targetText: 'الْعِلْمُ يَرْفَعُ بَيْتًا لا عِمَادَ لَهُ وَالْجَهْلُ يَهْدِمُ بَيْتَ الْعِزِّ وَالشَّرَفِ تَعَلَّمْ فَلَيْسَ الْمَرْءُ يُولَدُ عَالِمًا.',
    estimatedSeconds: 150,
  },

  // -------------------------------------------------------------
  // LEVEL 3: ADVANCED — FULL ARABIC TEXT & MASTERY (8 LESSONS)
  // -------------------------------------------------------------
  {
    id: 'l-adv-1',
    courseId: 'course-advanced',
    level: 3,
    order: 24,
    titleAr: 'الكلمات الطويلة والمركبة (Long & Complex Words)',
    titleEn: 'Long & Complex Arabic Words',
    titleBn: 'দীর্ঘ ও জটিল আরবি শব্দ',
    descriptionAr: 'إتقان الكلمات العربية الطويلة ذات اللواحق المتعددة والضمائر المتصلة (مثل: فسيكفيكهم، واستسقيناكموها).',
    descriptionEn: 'Master complex multi-affix Arabic words and attached pronouns with precision cadence.',
    descriptionBn: 'একাধিক প্রত্যয়যুক্ত জটিল ও দীর্ঘ আরবি শব্দের টাইপিং অনুশীলন।',
    difficulty: 'medium',
    newKeys: ['ف', 'س', 'ك', 'ي', 'ه'],
    focusKeys: ['فَسَيَكْفِيكَهُمُ', 'وَاسْتَسْقَيْنَاكُمُوهَا'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: ALL_ARABIC_BASE_LETTERS,
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'الكلمات الطويلة والمركبة',
      'Long & Complex Words',
      'দীর্ঘ ও জটিল আরবি শব্দ',
      [
        'فَسَيَكْفِيكَهُمُ اللَّهُ وَهُوَ السَّمِيعُ الْعَلِيمُ كَلِمَةٌ قُرْآنِيَّةٌ عَظِيمَةُ الْمَبْنَى وَالْمَعْنَى.',
        'وَاسْتَسْقَيْنَاكُمُوهَا لَفْظَةٌ تَجْمَعُ بَيْنَ فِعْلٍ وَفَاعِلٍ وَمَفْعُولَيْنِ فِي صِيغَةٍ وَاحِدَةٍ.',
        'الْمُسْتَقْبَلِيَّةُ وَالِاسْتِثْمَارِيَّةُ مِنَ الْمُصْطَلَحَاتِ الْحَدِيثَةِ الَّتِي تَتَطَلَّبُ دِقَّةً فِي الطِّبَاعَةِ.'
      ]
    ),
    totalPages: 12,
    targetText: 'فَسَيَكْفِيكَهُمُ اللَّهُ وَهُوَ السَّمِيعُ الْعَلِيمُ وَاسْتَسْقَيْنَاكُمُوهَا الْمُسْتَقْبَلِيَّةُ وَالِاسْتِثْمَارِيَّةُ فِي بِنَاءِ الْحَضَارَةِ.',
    estimatedSeconds: 140,
  },
  {
    id: 'l-adv-2',
    courseId: 'course-advanced',
    level: 3,
    order: 25,
    titleAr: 'الأرقام العربية وعلامات الترقيم (Punctuation & Numbers)',
    titleEn: 'Arabic Punctuation & Numbers',
    titleBn: 'আরবি বিরামচিহ্ন ও সংখ্যা',
    descriptionAr: 'إتقان علامات الترقيم العربية: الفاصلة (،)، النقطة (.)، علامة الاستفهام (؟)، النقطتان (:)، والأقواس مع الأرقام.',
    descriptionEn: 'Master typing Arabic punctuation marks (، . ؟ : « ») and numeral combinations.',
    descriptionBn: 'আরবি কমা, দাড়ি, প্রশ্নবোধক চিহ্ন ও সংখ্যার সমন্বিত টাইপিং।',
    difficulty: 'medium',
    newKeys: ['،', '؟', ':', '.', '١', '٢', '٣'],
    focusKeys: ['،', '؟', ':', '.', '١', '٢', '٣', '٤', '٥'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: [...ALL_ARABIC_BASE_LETTERS, '،', '؟', ':', '.', '١', '٢', '٣', '٤', '٥', '«', '»', '؛', '!'],
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'علامات الترقيم والأرقام',
      'Punctuation & Numbers',
      'বিরামচিহ্ন ও সংখ্যা',
      [
        'قَالَ الْحَكِيمُ: «طَلَبُ الْعِلْمِ نُورٌ، وَالْجَهْلُ ظَلامٌ؛ فَهَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لا يَعْلَمُونَ؟».',
        'تَأَسَّسَتِ الْمَكْتَبَةُ عَامَ ١٤٤٥ هِجْرِيَّةٍ، وَتَضُمُّ أَكْثَرَ مِنْ ٥٠٠٠ كِتَابٍ نَافِعٍ فِي شَتَّى الْعُلُومِ.',
        'بَلَغَ عَدَدُ الْمُشَارِكِينَ ٢٥٠ طَالِبًا، وَحَصَلَ ١٥ مِنْهُمْ عَلَى مَرَاتِبِ الشَّرَفِ الأُولَى بِجَدَارَةٍ.'
      ]
    ),
    totalPages: 12,
    targetText: 'قَالَ الْحَكِيمُ: «طَلَبُ الْعِلْمِ نُورٌ، وَالْجَهْلُ ظَلامٌ؛ فَهَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ؟» تَأَسَّسَتِ الْمَكْتَبَةُ عَامَ ١٤٤٥هـ.',
    estimatedSeconds: 140,
  },
  {
    id: 'l-adv-3',
    courseId: 'course-advanced',
    level: 3,
    order: 26,
    titleAr: 'الجمل الرسمية والتربوية (Formal & Educational Sentences)',
    titleEn: 'Formal & Educational Sentences',
    titleBn: 'দাপ্তরিক ও প্রাতিষ্ঠানিক বাক্যরীতি',
    descriptionAr: 'كتابة المراسلات الرسمية والخطابات الأكاديمية وصيغ التقارير الإدارية بأسلوب رصين.',
    descriptionEn: 'Type professional formal communications, academic reports, and official correspondence.',
    descriptionBn: 'দাপ্তরিক চিঠি, একাডেমিক প্রতিবেদন ও প্রাতিষ্ঠানিক ভাষার অনুশীলন।',
    difficulty: 'medium',
    newKeys: ['ر', 'س', 'م', 'ي'],
    focusKeys: ['الرسمية', 'التربوية', 'التقارير'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: ALL_ARABIC_BASE_LETTERS,
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'الجمل الرسمية والتربوية',
      'Formal & Educational Sentences',
      'দাপ্তরিক ও প্রাতিষ্ঠানিক বাক্যরীতি',
      [
        'تَسْعَى الْمُؤَسَّسَاتُ التَّعْلِيمِيَّةُ إِلَى تَطْوِيرِ مَهَارَاتِ الطُّلابِ وِفْقَ أَعْلَى الْمَعَايِيرِ الْعَالَمِيَّةِ.',
        'تَمَّ اعْتِمَادُ الْخُطَّةِ الإِسْتْرَاتِيجِيَّةِ لِتَحْسِينِ جَوْدَةِ الأَدَاءِ الْمِهَنِيِّ فِي كَافَّةِ الإِدَارَاتِ الْمَعْنِيَّةِ.',
        'نُعْرِبُ عَنْ خَالِصِ التَّقْدِيرِ وَالامْتِنَانِ لِجُهُودِكُمُ الْمُخْلِصَةِ فِي إِنْجَاحِ هَذَا الْمَشْرُوعِ الْوَطَنِيِّ.'
      ]
    ),
    totalPages: 12,
    targetText: 'تَسْعَى الْمُؤَسَّسَاتُ التَّعْلِيمِيَّةُ إِلَى تَطْوِيرِ مَهَارَاتِ الطُّلابِ تَمَّ اعْتِمَادُ الْخُطَّةِ الإِسْتْرَاتِيجِيَّةِ لِلأَدَاءِ الْمِهَنِيِّ.',
    estimatedSeconds: 145,
  },
  {
    id: 'l-adv-4',
    courseId: 'course-advanced',
    level: 3,
    order: 27,
    titleAr: 'الفقرات الصحفية والإخبارية (Journalistic Arabic)',
    titleEn: 'Modern Journalistic Paragraphs',
    titleBn: 'আধুনিক সংবাদ নিবন্ধ ও সাংবাদিক গদ্য',
    descriptionAr: 'طباعة المقالات الإخبارية والافتتاحيات الصحفية الحديثة بانسيابية وتدفق احترافي سريع.',
    descriptionEn: 'Type modern journalistic articles, editorials, and media prose with speed and clarity.',
    descriptionBn: 'সংবাদ নিবন্ধ, সম্পাদকীয় ও আধুনিক মিডিয়ার গদ্যের দ্রুত টাইপিং।',
    difficulty: 'hard',
    newKeys: ['ص', 'ح', 'ف', 'ة'],
    focusKeys: ['الصحافة', 'الإعلام', 'الأخبار'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: ALL_ARABIC_BASE_LETTERS,
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'الفقرات الإخبارية المعاصرة',
      'Modern Journalistic Paragraphs',
      'আধুনিক সংবাদ নিবন্ধ',
      [
        'شَهِدَتِ الْعَاصِمَةُ الْيَوْمَ انْطِلاقَ فَعَالِيَّاتِ الْمُؤْتَمَرِ الدَّوْلِيِّ لِلتَّكْنُولُوجْيَا وَالذَّكَاءِ الاصْطِنَاعِيِّ.',
        'أَكَّدَ الْخُبَرَاءُ فِي خِتَامِ الْجَلَسَاتِ عَلَى أَهَمِّيَّةِ الاسْتِثْمَارِ فِي تَدْرِيبِ الْكِوَادِرِ الشَّابَّةِ عَلَى مَهَارَاتِ الْمُسْتَقْبَلِ.',
        'سَجَّلَتِ الأَسْوَاقُ الْمَالِيَّةُ نُمُوًّا مَلْحُوظًا مَعَ زِيَادَةِ حَجْمِ التَّبَادُلِ التِّجَارِيِّ وَتَدَفُّقِ الاسْتِثْمَارَاتِ الأَجْنَبِيَّةِ.'
      ]
    ),
    totalPages: 12,
    targetText: 'شَهِدَتِ الْعَاصِمَةُ انْطِلاقَ فَعَالِيَّاتِ الْمُؤْتَمَرِ الدَّوْلِيِّ لِلتَّكْنُولُوجْيَا أَكَّدَ الْخُبَرَاءُ أَهَمِّيَّةِ الاسْتِثْمَارِ فِي الشَّبَابِ.',
    estimatedSeconds: 145,
  },
  {
    id: 'l-adv-5',
    courseId: 'course-advanced',
    level: 3,
    order: 28,
    titleAr: 'نصوص من الأدب والشعر العربي (Literary Prose & Poetry)',
    titleEn: 'Literary Prose & Classical Poetry',
    titleBn: 'আরবি সাহিত্য ও ধ্রুপদী কবিতার সংকলন',
    descriptionAr: 'روائع النثر الأدبي وأبيات الشعر العربي الفصيح لإكساب الأنامل رشاقة وتناسقاً استثنائياً.',
    descriptionEn: 'Master eloquent Arabic prose excerpts and classical poetic verses with refined cadence.',
    descriptionBn: 'আরবি সাহিত্যের সেরা নিদর্শন ও ধ্রুপদী কবিতার ছন্দে আঙুলের সাবলীলতা।',
    difficulty: 'hard',
    newKeys: ['ش', 'ع', 'ر', 'أ', 'د', 'ب'],
    focusKeys: ['الأدب', 'الشعر', 'البلاغة'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: ALL_ARABIC_BASE_LETTERS,
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'روائع الأدب والشعر العربي',
      'Literary Prose & Poetry',
      'আরবি সাহিত্য ও ধ্রুপদী কবিতা',
      [
        'إِذَا غَامَرْتَ فِي شَرَفٍ مَرُومٍ * فَلا تَقْنَعْ بِمَا دُونَ النُّجُومِ؛ فَطَعْمُ الْمَوْتِ فِي أَمْرٍ حَقِيرٍ * كَطَعْمِ الْمَوْتِ فِي أَمْرٍ عَظِيمِ.',
        'وَقَفَ التَّارِيخُ إِجْلالاً لِمَنْ بَنَوْا صُرُوحَ الْمَعْرِفَةِ بِمِدَادِ الإِخْلاصِ وَالصَّبْرِ عَلَى الْمَكَارِهِ.',
        'لَيْسَ الْفَتَى مَنْ يَقُولُ كَانَ أَبِي * وَلَكِنَّ الْفَتَى مَنْ يَقُولُ هَا أَنَا ذَا؛ فَكُنْ عِصَامِيًّا تَبْلُغِ الْمَجْدَ.'
      ]
    ),
    totalPages: 12,
    targetText: 'إِذَا غَامَرْتَ فِي شَرَفٍ مَرُومٍ فَلا تَقْنَعْ بِمَا دُونَ النُّجُومِ وَقَفَ التَّارِيخُ إِجْلالاً لِمَنْ بَنَوْا صُرُوحَ الْمَعْرِفَةِ.',
    estimatedSeconds: 150,
  },
  {
    id: 'l-adv-6',
    courseId: 'course-advanced',
    level: 3,
    order: 29,
    titleAr: 'نصوص التراث والفصاحة العربية (Classical Arabic Heritage)',
    titleEn: 'Classical Arabic Heritage & Oratory',
    titleBn: 'ধ্রুপদী ঐতিহ্য ও বাগ্মীতার নিদর্শন',
    descriptionAr: 'نصوص كلاسيكية من عيون التراث العربي الإسلامي وخطب الفصاحة والبلاغة الأصيلة.',
    descriptionEn: 'Immersion in classical Arabic heritage texts, historic orations, and eloquent treatises.',
    descriptionBn: 'ইসলামী ঐতিহ্য ও প্রাচীন বাগ্মীতার ধ্রুপদী পাঠের মাধ্যমে শ্রেষ্ঠত্ব অর্জন।',
    difficulty: 'hard',
    newKeys: ['ت', 'ر', 'ا', 'ث'],
    focusKeys: ['التراث', 'الفصاحة', 'البلاغة'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: ALL_ARABIC_BASE_LETTERS,
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'نصوص التراث والفصاحة العربية',
      'Classical Arabic Heritage',
      'ধ্রুপদী ঐতিহ্য ও বাগ্মীতা',
      [
        'أَيُّهَا النَّاسُ: مَنْ عَاشَ مَاتَ، وَمَنْ مَاتَ فَاتَ، وَكُلُّ مَا هُوَ آتٍ آتٍ؛ لَيْلٌ دَاجٍ، وَنَهَارٌ سَاجٍ، وَسَمَاءٌ ذَاتُ أَبْرَاجٍ.',
        'إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلاقًا، وَإِنَّ خَيْرَ الْكَلَامِ مَا قَلَّ وَدَلَّ وَلَمْ يَطُلْ فَيُمَلَّ.',
        'الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلا أَنْ هَدَانَا اللَّهُ رَبُّ الْعَالَمِينَ.'
      ]
    ),
    totalPages: 12,
    targetText: 'أَيُّهَا النَّاسُ: مَنْ عَاشَ مَاتَ، وَمَنْ مَاتَ فَاتَ، وَكُلُّ مَا هُوَ آتٍ آتٍ؛ إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلاقًا.',
    estimatedSeconds: 150,
  },
  {
    id: 'l-adv-7',
    courseId: 'course-advanced',
    level: 3,
    order: 30,
    titleAr: 'تدريبات السرعة والانسيابية القصوى (High-Velocity Speed)',
    titleEn: 'High-Velocity Speed Cadence',
    titleBn: 'উচ্চ গতি ও রিদম বৃদ্ধির স্প্রিন্ট',
    descriptionAr: 'سبرينت سريع لتخطي حاجز 40 و 50 كلمة في الدقيقة مع الحفاظ على الدقة المطلقة.',
    descriptionEn: 'High-speed sprints breaking the 40+ and 50+ WPM benchmarks while preserving 98%+ accuracy.',
    descriptionBn: '৪০+ ও ৫০+ ডব্লিউপিএম গতিতে নির্ভুল টাইপিং অর্জনের জন্য স্পিড ড্রিল।',
    difficulty: 'advanced',
    newKeys: ['س', 'ر', 'ع', 'ة'],
    focusKeys: ['السرعة', 'الانسيابية', 'التدفق'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: ALL_ARABIC_BASE_LETTERS,
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'تدريبات السرعة والتدفق المتقدم',
      'High-Velocity Speed Cadence',
      'উচ্চ গতি ও রিদমের স্প্রিন্ট',
      [
        'الْسُّرْعَةُ مَعَ الدِّقَّةِ هِيَ جَوْهَرُ الإِتْقَانِ فِي الطِّبَاعَةِ؛ حَرِّكْ أَصَابِعَكَ بِمُرُونَةٍ كَأَنَّهَا فَرَاشَاتٌ تُحَلِّقُ.',
        'ثِقْ بِلَمْسِكَ لِلْمَفَاتِيحِ وَلا تَنْظُرْ إِلَى لَوْحَةِ الْكِتَابَةِ أَبَدًا لِتَبْلُغَ أَقْصَى دَرَجَاتِ التَّدَفُّقِ.',
        'التَّدْرِيبُ الْمُسْتَمِرُّ يَبْنِي مَهَارَةً لا تُقْهَرُ، وَالْعَزِيمَةُ الصَّادِقَةُ تُذَلِّلُ كُلَّ صَعْبٍ فِي مَسَارِ التَّعَلُّمِ.'
      ]
    ),
    totalPages: 12,
    targetText: 'الْسُّرْعَةُ مَعَ الدِّقَّةِ هِيَ جَوْهَرُ الإِتْقَانِ فِي الطِّبَاعَةِ ثِقْ بِلَمْسِكَ لِلْمَفَاتِيحِ وَلا تَنْظُرْ إِلَى لَوْحَةِ الْكِتَابَةِ.',
    estimatedSeconds: 155,
  },
  {
    id: 'l-adv-8',
    courseId: 'course-advanced',
    level: 3,
    order: 31,
    titleAr: 'الماراثون النهائي والإتقان المطلق (Mastery Marathon)',
    titleEn: 'Professional Mastery Marathon',
    titleBn: 'মাস্টারি ম্যারাথন ও চূড়ান্ত প্রস্তুতি',
    descriptionAr: 'المحطة الختامية الكبرى في مسار التعلم الكامل، تجمع كافة المهارات تمهيداً لامتحان الشهادة الاحترافية.',
    descriptionEn: 'The grand finale of the Arabic typing journey, integrating all letter reaches, diacritics, and classical speed.',
    descriptionBn: 'আরবি টাইপিং শিক্ষার গ্র্যান্ড ফিনালে, যা চূড়ান্ত সনদপত্র পরীক্ষার জন্য সম্পূর্ণ প্রস্তুত করে।',
    difficulty: 'advanced',
    newKeys: ['إ', 'ت', 'ق', 'ا', 'ن'],
    focusKeys: ['الماراثون', 'الإتقان', 'الاحتراف'],
    previouslyLearnedKeys: ALL_ARABIC_BASE_LETTERS,
    allowedKeys: ALL_ARABIC_BASE_LETTERS,
    forbiddenKeys: [],
    pages: generateAdvancedLessonPages(
      'الماراثون النهائي والإتقان المطلق',
      'Professional Mastery Marathon',
      'মাস্টারি ম্যারাথন ও চূড়ান্ত প্রস্তুতি',
      [
        'لَقَدْ قَطَعْتَ شَوْطًا عَظِيمًا فِي مَسَارِ تَعَلُّمِ الطِّبَاعَةِ الْعَرَبِيَّةِ بِاللَّمْسِ، وَأَصْبَحَتْ أَنَامِلُكَ تَكْتُبُ بِفَصَاحَةٍ وَإِتْقَانٍ.',
        'الإِتْقَانُ رِحْلَةٌ لا تَنْتَهِي، وَالْمُحْتَرِفُ يَسْعَى دَائِمًا لِتَطْوِيرِ مَهَارَاتِهِ لِيَكُونَ فِي صَدَارَةِ الْمُتَمَيِّزِينَ.',
        'أَنْتَ الآنَ مُؤَهَّلٌ بِجَدَارَةٍ لِخَوْضِ امْتِحَانِ الشَّهَادَةِ الاحْتِرَافِيَّةِ الْكُبْرَى؛ فَتَقَدَّمْ بِثِقَةٍ وَعَزِيمَةٍ صَادِقَةٍ.'
      ]
    ),
    totalPages: 12,
    targetText: 'لَقَدْ قَطَعْتَ شَوْطًا عَظِيمًا فِي تَعَلُّمِ الطِّبَاعَةِ الْعَرَبِيَّةِ وَأَصْبَحَتْ أَنَامِلُكَ تَكْتُبُ بِفَصَاحَةٍ؛ فَتَقَدَّمْ للامْتِحَانِ النِّهَائِيِّ.',
    estimatedSeconds: 160,
  },
];
