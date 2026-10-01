export interface CatalogField {
  key: string;
  label: string;
  ar: string;
  kind: 'text' | 'textarea' | 'number' | 'checkbox' | 'select';
  value: string | number | boolean;
  required?: boolean;
  options?: string[];
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
      description,
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
        options: ['gift', 'coffee', 'book-open', 'clapperboard', 'sun', 'heart'],
      },
      { key: 'category', label: 'Category', ar: 'الفئة', kind: 'text', value: 'personal' },
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
        key: 'icon',
        label: 'Icon',
        ar: 'الأيقونة',
        kind: 'select',
        value: 'award',
        options: ['award', 'flame', 'sprout', 'sun', 'users', 'flag'],
      },
      {
        key: 'condition',
        label: 'Unlock condition',
        ar: 'شرط الاكتساب',
        kind: 'select',
        value: 'HABIT_COUNT',
        options: ['HABIT_COUNT', 'CHECK_IN_COUNT', 'QUEST_COUNT', 'CHALLENGE_COUNT'],
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
    title: 'A little news from LifeQuest.',
    ar: 'قليل من أخبار رحلة التوازن.',
    description: 'Share product updates and thoughtful announcements.',
    arDescription: 'شارك تحديثات المنتج والإعلانات المدروسة.',
    icon: 'bell',
    fields: [
      title,
      {
        key: 'body',
        label: 'Announcement',
        ar: 'الإعلان',
        kind: 'textarea',
        value: '',
        required: true,
      },
      active,
    ],
  },
};
