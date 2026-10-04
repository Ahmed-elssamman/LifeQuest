export interface CatalogField {
  key: string;
  label: string;
  ar: string;
  kind: 'text' | 'textarea' | 'number' | 'checkbox' | 'select';
  value: string | number | boolean;
  required?: boolean;
  options?: { value: string; label: string; ar: string }[];
}
export interface CatalogDefinition {
  title: string;
  ar: string;
  description: string;
  arDescription: string;
  icon: string;
  fields: CatalogField[];
}
const title: CatalogField = {
  key: 'title',
  label: 'Title',
  ar: 'العنوان',
  kind: 'text',
  value: '',
  required: true,
};
const description: CatalogField = {
  key: 'description',
  label: 'Description',
  ar: 'الوصف',
  kind: 'textarea',
  value: '',
};
const active: CatalogField = {
  key: 'active',
  label: 'Active',
  ar: 'نشط',
  kind: 'checkbox',
  value: true,
};
export const catalogs: Record<string, CatalogDefinition> = {
  rewards: {
    title: 'Rewards worth looking forward to.',
    ar: 'مكافآت تستحق الانتظار.',
    description:
      'Manage the shared reward catalog. Existing redemptions retain their original cost.',
    arDescription: 'أدر كتالوج المكافآت المشترك. تحتفظ المعاملات السابقة بتكلفتها الأصلية.',
    icon: 'gift',
    fields: [
      title,
      {
        key: 'titleAr',
        label: 'Arabic title',
        ar: 'العنوان بالعربية',
        kind: 'text',
        value: '',
        required: true,
      },
      description,
      {
        key: 'descriptionAr',
        label: 'Arabic description',
        ar: 'الوصف بالعربية',
        kind: 'textarea',
        value: '',
        required: true,
      },
      {
        key: 'cost',
        label: 'XP cost',
        ar: 'تكلفة الخبرة',
        kind: 'number',
        value: 150,
        required: true,
      },
      {
        key: 'icon',
        label: 'Icon',
        ar: 'الأيقونة',
        kind: 'select',
        value: 'gift',
        options: [
          { value: 'gift', label: 'Gift', ar: 'هدية' },
          { value: 'coffee', label: 'Coffee', ar: 'قهوة' },
          { value: 'book-open', label: 'Book', ar: 'كتاب' },
          { value: 'clapperboard', label: 'Film', ar: 'فيلم' },
          { value: 'sun', label: 'Sun', ar: 'شمس' },
          { value: 'heart', label: 'Heart', ar: 'قلب' },
        ],
      },
      { key: 'category', label: 'Category', ar: 'الفئة', kind: 'text', value: 'personal' },
      {
        key: 'categoryAr',
        label: 'Arabic category',
        ar: 'الفئة بالعربية',
        kind: 'text',
        value: '',
        required: true,
      },
    ],
  },
  achievements: {
    title: 'Milestones that mean something.',
    ar: 'محطات ذات معنى.',
    description: 'Server-evaluated achievements. Changes never erase existing unlocks.',
    arDescription: 'إنجازات يقيّمها الخادم. التعديلات لا تمحو الإنجازات السابقة.',
    icon: 'award',
    fields: [
      title,
      {
        key: 'titleAr',
        label: 'Arabic title',
        ar: 'العنوان العربي',
        kind: 'text',
        value: '',
        required: true,
      },
      {
        key: 'slug',
        label: 'Unique identifier',
        ar: 'معرّف فريد',
        kind: 'text',
        value: '',
        required: true,
      },
      description,
      {
        key: 'descriptionAr',
        label: 'Arabic description',
        ar: 'الوصف بالعربية',
        kind: 'textarea',
        value: '',
        required: true,
      },
      {
        key: 'icon',
        label: 'Icon',
        ar: 'الأيقونة',
        kind: 'select',
        value: 'award',
        options: [
          { value: 'award', label: 'Award', ar: 'جائزة' },
          { value: 'flame', label: 'Flame', ar: 'شعلة' },
          { value: 'sprout', label: 'Sprout', ar: 'نبتة' },
          { value: 'sun', label: 'Sun', ar: 'شمس' },
          { value: 'users', label: 'People', ar: 'أشخاص' },
          { value: 'flag', label: 'Flag', ar: 'علم' },
        ],
      },
      {
        key: 'condition',
        label: 'Unlock condition',
        ar: 'شرط الاكتساب',
        kind: 'select',
        value: 'HABIT_COUNT',
        options: [
          { value: 'HABIT_COUNT', label: 'Completed habits', ar: 'العادات المكتملة' },
          { value: 'CHECK_IN_COUNT', label: 'Recorded check-ins', ar: 'المراجعات اليومية المسجلة' },
          { value: 'QUEST_COUNT', label: 'Completed quests', ar: 'المهام الأسبوعية المكتملة' },
          { value: 'CHALLENGE_COUNT', label: 'Completed challenges', ar: 'التحديات المكتملة' },
        ],
      },
      {
        key: 'threshold',
        label: 'Required count',
        ar: 'العدد المطلوب',
        kind: 'number',
        value: 10,
        required: true,
      },
      {
        key: 'xpReward',
        label: 'XP reward',
        ar: 'مكافأة الخبرة',
        kind: 'number',
        value: 50,
        required: true,
      },
      {
        key: 'hidden',
        label: 'Hidden until unlocked',
        ar: 'مخفي حتى الاكتساب',
        kind: 'checkbox',
        value: false,
      },
      active,
    ],
  },
  help: {
    title: 'A clearer path for every explorer.',
    ar: 'طريق أوضح لكل مستكشف.',
    description: 'Maintain helpful, bilingual guidance. Content is displayed as safe text.',
    arDescription: 'حافظ على إرشادات مفيدة بلغتين. يُعرض المحتوى كنص آمن.',
    icon: 'help',
    fields: [
      title,
      {
        key: 'titleAr',
        label: 'Arabic title',
        ar: 'العنوان العربي',
        kind: 'text',
        value: '',
        required: true,
      },
      {
        key: 'slug',
        label: 'Article identifier',
        ar: 'معرّف المقال',
        kind: 'text',
        value: '',
        required: true,
      },
      {
        key: 'body',
        label: 'English content',
        ar: 'المحتوى الإنجليزي',
        kind: 'textarea',
        value: '',
        required: true,
      },
      {
        key: 'bodyAr',
        label: 'Arabic content',
        ar: 'المحتوى العربي',
        kind: 'textarea',
        value: '',
        required: true,
      },
      { key: 'published', label: 'Published', ar: 'منشور', kind: 'checkbox', value: true },
    ],
  },
  announcements: {
    title: 'A little news from MIRHAL.',
    ar: 'قليل من أخبار مِرحال.',
    description: 'Share product updates and thoughtful announcements.',
    arDescription: 'شارك تحديثات المنتج والإعلانات المدروسة.',
    icon: 'bell',
    fields: [
      title,
      {
        key: 'titleAr',
        label: 'Arabic title',
        ar: 'العنوان بالعربية',
        kind: 'text',
        value: '',
        required: true,
      },
      {
        key: 'body',
        label: 'Announcement',
        ar: 'الإعلان',
        kind: 'textarea',
        value: '',
        required: true,
      },
      {
        key: 'bodyAr',
        label: 'Arabic announcement',
        ar: 'الإعلان بالعربية',
        kind: 'textarea',
        value: '',
        required: true,
      },
      active,
    ],
  },
};
