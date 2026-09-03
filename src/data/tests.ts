import { TypingTestItem } from '../types';

export const TYPING_TEST_ITEMS: TypingTestItem[] = [
  // General
  {
    id: 'test-gen-1',
    titleAr: 'سحر اللغة العربية وجمالها',
    titleEn: 'The Enchantment of the Arabic Language',
    titleBn: 'আরবি ভাষার সৌন্দর্য ও আবেদন',
    category: 'general',
    difficulty: 'easy',
    text: 'اللغة العربية ليست مجرد وسيلة للتخاطب اليومي، بل هي وعاء فكري وثقافي فريد حمل تراثا إنسانيا عظيما على مدار قرون طويلة، وتتميز بدقة مفرداتها وعمق معانيها التي قلما تجد لها نظيرا في اللغات الأخرى.',
  },
  {
    id: 'test-gen-2',
    titleAr: 'أهمية الرياضة في حياة الإنسان',
    titleEn: 'Importance of Sports in Daily Life',
    titleBn: 'মানব জীবনে খেলাধুলার গুরুত্ব',
    category: 'general',
    difficulty: 'medium',
    text: 'ممارسة التمارين الرياضية بانتظام تنشط الدورة الدموية وتقوي عضلة القلب، كما تسهم في تصفية الذهن وتقليل التوتر العصبي وتمنح الشخص طاقة إيجابية تمكنه من مواجهة تحديات العمل اليومي بكل نشاط وحيوية.',
  },

  // Education
  {
    id: 'test-edu-1',
    titleAr: 'التعليم الذاتي وبناء المستقبل',
    titleEn: 'Self-Directed Learning and Future Building',
    titleBn: 'স্ব-শিক্ষা ও ভবিষ্যৎ নির্মাণ',
    category: 'education',
    difficulty: 'medium',
    text: 'في عصر الانفجار المعرفي والتقني، أصبح التعليم الذاتي هو السلاح الأقوى لكل من يريد مواكبة التطور ومضاعفة مهاراته الشخصية؛ فالشغف بالقراءة والبحث المستمر هو المحرك الحقيقي وراء كل ابتكار ونجاح دائم.',
  },
  {
    id: 'test-edu-2',
    titleAr: 'دور المعلم في نهضة الأمم',
    titleEn: 'The Role of Teachers in Nation Building',
    titleBn: 'জাতি গঠনে শিক্ষকের ভূমিকা',
    category: 'education',
    difficulty: 'hard',
    text: 'يقف المعلم على رأس البناة الحقيقيين للحضارة، فهو الذي يغرس في عقول الناشئة حب المعرفة وقيم الصدق والإخلاص، وبجهده وصبره تخرج الأجيال التي تصنع نهضة الوطن وتقود مسيرته نحو المعالي والرفعة.',
  },

  // Literature
  {
    id: 'test-lit-1',
    titleAr: 'وصف الطبيعة في فصول الربيع',
    titleEn: 'Description of Nature in Spring',
    titleBn: 'বসন্তের প্রকৃতির সৌন্দর্য বর্ণনা',
    category: 'literature',
    difficulty: 'hard',
    text: 'أقبل الربيع فارتدت الأرض حلتها الخضراء الموشاة بألوان الزهور الفواحة، وتهادت الأطيار تشدو بأعذب الألحان بين غصون الأشجار الباسقة، وهب نسيم الصباح العليل حاملا معه شذى الياسمين والريحان إلى كل ركن في الوادي الفسيح.',
  },
  {
    id: 'test-lit-2',
    titleAr: 'مناجاة الليل والنجوم',
    titleEn: 'Solitude of Night and Stars',
    titleBn: 'রাত ও তারার একান্ত নির্জনতা',
    category: 'literature',
    difficulty: 'advanced',
    text: 'سكن الليل وهدأت الأصوات، وانبسطت السماء كبساط من الديباج الأسود المرصع بلآلئ النجوم المتلألئة، وفي هذا السكون البديع يجد الشاعر ملاذه ليرسم بأحرفه لوحات من الشوق والتأمل في ملكوت الخالق العظيم.',
  },

  // News
  {
    id: 'test-news-1',
    titleAr: 'تقرير عن التطورات التقنية والذكاء الاصطناعي',
    titleEn: 'Report on Tech & AI Advances',
    titleBn: 'প্রযুক্তি ও এআই অগ্রগতির প্রতিবেদন',
    category: 'news',
    difficulty: 'medium',
    text: 'أعلنت كبرى الشركات التقنية عن إطلاق نماذج ذكاء اصطناعي جديدة قادرة على معالجة اللغات الطبيعية بدقة فائقة، مما سيحدث نقلة نوعية في قطاعات التعليم والصحة والترجمة الفورية خلال السنوات القليلة القادمة.',
  },
  {
    id: 'test-news-2',
    titleAr: 'مؤتمر الاستدامة وحماية البيئة والمناخ',
    titleEn: 'Summit on Sustainability and Climate',
    titleBn: 'টেকসই উন্নয়ন ও জলবায়ু সম্মেলন',
    category: 'news',
    difficulty: 'hard',
    text: 'اختتمت اليوم أعمال القمة الدولية للمناخ بمشاركة ممثلين عن مئة وخمسين دولة، حيث أكد المشاركون على ضرورة تسريع وتيرة التحول نحو الطاقة النظيفة وتقليل الانبعاثات الكربونية حفاظا على مستقبل الأجيال القادمة.',
  },

  // Heritage
  {
    id: 'test-her-1',
    titleAr: 'بيت الحكمة وحركة الترجمة العلمية',
    titleEn: 'House of Wisdom & Scientific Heritage',
    titleBn: 'বায়তুল হিকমাহ ও বৈজ্ঞানিক অনুবাদ ঐতিহ্য',
    category: 'heritage',
    difficulty: 'advanced',
    text: 'كان بيت الحكمة في بغداد منارة علمية كبرى جمعت جهابذة العلماء والمترجمين في شتى صنوف المعرفة كالطب والفلك والرياضيات والفلسفة، وأسهمت هذه الحركة العلمية في حفظ التراث الإنساني وإثراء الحضارة العالمية.',
  },
  {
    id: 'test-her-2',
    titleAr: 'عمارة المساجد والزخرفة الإسلامية',
    titleEn: 'Mosque Architecture & Islamic Calligraphy',
    titleBn: 'মসজিদ স্থাপত্য ও ক্যালিগ্রাফি শিল্প',
    category: 'heritage',
    difficulty: 'hard',
    text: 'تجلت عبقرية الفن الإسلامي في هندسة القباب والمآذن وزخارف الخط العربي البديع التي تزين جدران المساجد والقصور التاريخية، حيث تتناغم الهندسة الرياضية الدقيقة مع الروحانية والجمال البصري الفريد.',
  },

  // Random Words
  {
    id: 'test-words-1',
    titleAr: 'سلسلة الكلمات السريعة المتنوعة',
    titleEn: 'Diverse Rapid Words Drill',
    titleBn: 'দ্রুত বিভিন্ন আরবি শব্দের ড্রিল',
    category: 'words',
    difficulty: 'beginner',
    text: 'كتاب قلم شمس قمر بحر نهر جبل سماء أرض هواء ورد زهر ربيع شتاء صيف خريف بيت دار باب نافذة شارع مدينة قرية وطن علم عمل نور خير سلام عدل صدق أمانة',
  },

  // Random Sentences
  {
    id: 'test-sent-1',
    titleAr: 'حكم وعبارات قصيرة متفرقة',
    titleEn: 'Selected Short Sentences & Wisdom',
    titleBn: 'বাছাইকৃত আরবি প্রবাদ ও ছোট বাক্য',
    category: 'sentences',
    difficulty: 'easy',
    text: 'الصبر مفتاح الفرج. القناعة كنز لا يفنى. من سار على الدرب وصل. العلم يبني بيوتا لا عماد لها، والجهل يهدم بيوت العز والشرف. لا تؤجل عمل اليوم إلى الغد.',
  },
];

export const TYPING_TESTS = TYPING_TEST_ITEMS;
