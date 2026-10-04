ALTER TABLE "Achievement" ADD COLUMN "descriptionAr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "SeasonPhase" ADD COLUMN "descriptionAr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Announcement" ADD COLUMN "titleAr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Announcement" ADD COLUMN "bodyAr" TEXT NOT NULL DEFAULT '';

UPDATE "Achievement" SET "descriptionAr" = CASE "id"
  WHEN 'achievement-streak' THEN 'مارس عادة يومية سبعة أيام متتالية. تُحسب الخطوات الصغيرة أيضاً.'
  WHEN 'achievement-first' THEN 'أكمل عادتك الأولى. هنا تبدأ رحلتك نحو التغيير.'
  WHEN 'achievement-rhythm' THEN 'أكمل ٢٥ خطوة في عاداتك.'
  WHEN 'achievement-steady' THEN 'اتخذ ١٠٠ خطوة صغيرة نحو حياة أفضل.'
  WHEN 'achievement-reflect' THEN 'أكمل سبعة تأملات يومية.'
  WHEN 'achievement-quest' THEN 'أكمل مهمتك الأسبوعية الأولى.'
  WHEN 'achievement-together' THEN 'أكمل تحدياً مع صديق.'
  ELSE "descriptionAr"
END
WHERE "id" IN (
  'achievement-streak', 'achievement-first', 'achievement-rhythm',
  'achievement-steady', 'achievement-reflect', 'achievement-quest',
  'achievement-together'
);

UPDATE "SeasonPhase" AS phase SET "descriptionAr" = CASE phase."month"
  WHEN 8 THEN 'افسح مجالاً لبداية جديدة.'
  WHEN 9 THEN 'ابحث عن إيقاع يناسبك.'
  WHEN 10 THEN 'تعمق قليلاً وتعلم شيئاً جديداً.'
  WHEN 11 THEN 'اكتشف ما يمكنك إنجازه مع الآخرين.'
  WHEN 12 THEN 'تأمل رحلتك، واحتفل، واحمل ما تعلمته إلى الأمام.'
  ELSE phase."descriptionAr"
END
FROM "Season" AS season
WHERE phase."seasonId" = season."id"
  AND season."title" = 'Your season of growth'
  AND phase."year" = 2026
  AND phase."month" BETWEEN 8 AND 12;
