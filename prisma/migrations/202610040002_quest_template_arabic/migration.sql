ALTER TABLE "QuestTemplate" ADD COLUMN "descriptionAr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "QuestTemplateItem" ADD COLUMN "titleAr" TEXT NOT NULL DEFAULT '';

UPDATE "QuestTemplate"
SET "descriptionAr" = 'اختر اتجاهاً واحداً، وتقدم فيه قليلاً، ولاحظ ما ساعدك.'
WHERE "id" = 'template-small-wins';

UPDATE "QuestTemplateItem"
SET "titleAr" = CASE "sortOrder"
  WHEN 0 THEN 'اختر أولوية واحدة ذات معنى'
  WHEN 1 THEN 'خصص عشرين دقيقة للخطوة التالية'
  WHEN 2 THEN 'اكتب شيئاً واحداً ساعدك'
  ELSE ''
END
WHERE "templateId" = 'template-small-wins';
