ALTER TABLE "Reward" ADD COLUMN "titleAr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Reward" ADD COLUMN "descriptionAr" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Reward" ADD COLUMN "categoryAr" TEXT NOT NULL DEFAULT '';

UPDATE "Reward" SET
  "titleAr" = CASE "id"
    WHEN 'reward-coffee' THEN 'صباح قهوة هادئ'
    WHEN 'reward-movie' THEN 'ليلة فيلم بلا شعور بالذنب'
    WHEN 'reward-book' THEN 'ذلك الكتاب في قائمتك'
    WHEN 'reward-day' THEN 'يوم لك وحدك'
    ELSE "titleAr"
  END,
  "descriptionAr" = CASE "id"
    WHEN 'reward-coffee' THEN 'مقهاك المفضل، وكتاب جيد، ووقت بلا عجلة.'
    WHEN 'reward-movie' THEN 'اختر ما تحب، واستمتع بوقت هادئ.'
    WHEN 'reward-book' THEN 'عالم جديد ينتظرك على رف كتبك.'
    WHEN 'reward-day' THEN 'اترك جدولك خالياً واتبع فضولك.'
    ELSE "descriptionAr"
  END,
  "categoryAr" = CASE "id"
    WHEN 'reward-coffee' THEN 'متع صغيرة'
    WHEN 'reward-movie' THEN 'استراحة'
    WHEN 'reward-book' THEN 'نمو'
    WHEN 'reward-day' THEN 'تجارب'
    ELSE "categoryAr"
  END
WHERE "id" IN ('reward-coffee', 'reward-movie', 'reward-book', 'reward-day');
