import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Api, Remote } from '@lifequest/data-access';
import { RouterLink } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Icon, Logo } from '@lifequest/ui';
import { Preferences } from '@lifequest/utilities';
@Component({
  selector: 'lq-help',
  imports: [RouterLink, TooltipModule, Icon, Logo],
  templateUrl: './help.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPage {
  readonly i18n = inject(Preferences);
  readonly articles = new Remote<
    { id: string; title: string; titleAr: string; body: string; bodyAr: string }[]
  >(inject(Api), 'help');
  constructor() {
    afterNextRender(() => {
      void this.articles.load();
    });
  }
  readonly selected = signal(0);
  readonly beginner = signal(true);
  readonly steps = [
    {
      icon: 'target',
      title: 'Choose a meaningful goal',
      ar: 'اختر هدفاً ذا معنى',
      text: 'Start with an outcome that matters to you. A goal is your direction, not another item on a list.',
      textAr: 'ابدأ بنتيجة تهمك. الهدف هو اتجاهك، وليس مجرد عنصر آخر في قائمة.',
      example: '“Feel stronger and more energetic.”',
      exampleAr: '«أشعر بقوة وطاقة أكبر.»',
      label: 'THE DIRECTION',
      labelAr: 'الاتجاه',
      link: '/goals',
    },
    {
      icon: 'folder',
      title: 'Give it a project',
      ar: 'امنحه مشروعاً',
      text: 'A project is a body of work that moves a goal forward. Break an ambitious outcome into something you can actually build.',
      textAr: 'المشروع مجموعة أعمال تدفع هدفك للأمام. قسّم النتيجة الكبيرة إلى شيء يمكنك تنفيذه.',
      example: '“Build a simple home workout routine.”',
      exampleAr: '«أبني روتين تمارين منزلية بسيطاً.»',
      label: 'THE PLAN',
      labelAr: 'الخطة',
      link: '/projects',
    },
    {
      icon: 'tasks',
      title: 'Find the next clear action',
      ar: 'اعثر على الخطوة التالية الواضحة',
      text: 'Tasks are individual pieces of work. Keep them specific enough that you know exactly what to do next.',
      textAr: 'المهام أجزاء فردية من العمل. اجعلها محددة بما يكفي لتعرف بالضبط ما تفعله بعدها.',
      example: '“Choose three exercises and clear a little space.”',
      exampleAr: '«أختار ثلاثة تمارين وأجهز مساحة صغيرة.»',
      label: 'THE NEXT STEP',
      labelAr: 'الخطوة التالية',
      link: '/tasks',
    },
    {
      icon: 'sprout',
      title: 'Build your daily rhythm',
      ar: 'ابنِ إيقاعك اليومي',
      text: 'Habits are repeated behaviors. Choose a schedule, a target, and a tiny minimum action for busy days.',
      textAr: 'العادات سلوكيات متكررة. اختر جدولاً وهدفاً وخطوة صغيرة للأيام المزدحمة.',
      example: '“Move for 20 minutes. On busy days, just five.”',
      exampleAr: '«أتحرك 20 دقيقة. وفي الأيام المزدحمة، خمس فقط.»',
      label: 'THE RHYTHM',
      labelAr: 'الإيقاع',
      link: '/habits',
    },
    {
      icon: 'sun',
      title: 'Check in with yourself',
      ar: 'تواصل مع نفسك',
      text: 'A daily check-in captures the person behind the progress. Notice your energy, one win, and what might help tomorrow.',
      textAr:
        'التأمل اليومي يهتم بالشخص وراء التقدم. لاحظ طاقتك وانتصاراً واحداً وما قد يساعدك غداً.',
      example: '“The walk helped my mood. Tomorrow, go before lunch.”',
      exampleAr: '«المشي حسّن مزاجي. غداً أمشي قبل الغداء.»',
      label: 'THE REFLECTION',
      labelAr: 'التأمل',
      link: '/today',
    },
    {
      icon: 'flag',
      title: 'Take on a weekly quest',
      ar: 'انطلق في مهمة أسبوعية',
      text: 'A quest gives your week one clear focus. Finish a handful of actions toward something worth doing.',
      textAr: 'المهمة الأسبوعية تمنح أسبوعك تركيزاً واضحاً. أنجز خطوات محدودة نحو شيء يستحق.',
      example: '“A week of movement: plan, practice, and reflect.”',
      exampleAr: '«أسبوع من الحركة: خطط وتمرن وتأمل.»',
      label: 'THE MISSION',
      labelAr: 'المهمة',
      link: '/quests',
    },
    {
      icon: 'zap',
      title: 'Let progress add up',
      ar: 'دع التقدم يتراكم',
      text: 'Completed actions earn XP. It is recorded once, securely, and becomes a reminder of the work you have put in.',
      textAr: 'الخطوات المكتملة تكسبك خبرة. تُسجل مرة واحدة بأمان، وتذكّرك بالجهد الذي بذلته.',
      example: '“A full habit earns 20–40 XP. Tiny versions count, too.”',
      exampleAr: '«العادة الكاملة تكسب 20–40 نقطة. والخطوات الصغيرة تُحسب أيضاً.»',
      label: 'THE PROGRESS',
      labelAr: 'التقدم',
      link: '/achievements',
    },
    {
      icon: 'award',
      title: 'Celebrate a new chapter',
      ar: 'احتفل بفصل جديد',
      text: 'Levels recognize your lifetime progress. Achievements celebrate meaningful milestones along the way.',
      textAr: 'المستويات تعترف بتقدمك عبر الوقت. والإنجازات تحتفي بالمحطات المهمة في الرحلة.',
      example: '“The first step” unlocks after your first habit action.',
      exampleAr: 'يفتح إنجاز «الخطوة الأولى» بعد أول إتمام لعادة.',
      label: 'THE MILESTONE',
      labelAr: 'المحطة',
      link: '/achievements',
    },
    {
      icon: 'gift',
      title: 'Make room for enjoyment',
      ar: 'اصنع مساحة للاستمتاع',
      text: 'Spend available XP on personal rewards. Rest and enjoyment belong in a balanced life. Your level stays yours.',
      textAr:
        'استخدم خبرتك المتاحة لمكافآت شخصية. الراحة والاستمتاع جزء من التوازن. مستواك يبقى لك.',
      example: '“A slow coffee morning. A book. A day just for me.”',
      exampleAr: '«صباح قهوة هادئ. كتاب. يوم لي وحدي.»',
      label: 'THE REWARD',
      labelAr: 'المكافأة',
      link: '/rewards',
    },
    {
      icon: 'users',
      title: 'Grow a little, together',
      ar: 'تطور قليلاً، مع الآخرين',
      text: 'Invite friends to a private challenge. Agree on the rules first, then choose what you share. Cooperation counts.',
      textAr:
        'ادعُ أصدقاءك لتحدٍ خاص. اتفقوا على القواعد أولاً، ثم اختاروا ما تشاركونه. التعاون يُحسب.',
      example: '“Together, let’s show up for seven days.”',
      exampleAr: '«معاً، لنحاول لمدة سبعة أيام.»',
      label: 'THE CONNECTION',
      labelAr: 'التواصل',
      link: '/challenges',
    },
    {
      icon: 'map',
      title: 'See the season you are building',
      ar: 'شاهد الموسم الذي تبنيه',
      text: 'Your monthly journey brings the bigger picture into focus. Review your strongest areas, learning, and next adjustments.',
      textAr: 'رحلتك الشهرية توضح الصورة الأكبر. راجع أقوى مجالاتك وما تعلمته وتعديلاتك القادمة.',
      example: '“Consistency was my win. Next month, protect my evenings.”',
      exampleAr: '«الاستمرارية كانت إنجازي. الشهر القادم، أحمي أمسياتي.»',
      label: 'THE BIGGER PICTURE',
      labelAr: 'الصورة الأكبر',
      link: '/journey',
    },
    {
      icon: 'flask',
      title: 'Turn a hard day into learning',
      ar: 'حوّل اليوم الصعب إلى تعلّم',
      text: 'If a habit is not working, investigate kindly. Change the time, lower the target, try an experiment, or take a pause.',
      textAr: 'إذا لم تنجح عادة، ابحث بلطف. غيّر الوقت أو خفف الهدف أو جرّب تجربة أو توقف قليلاً.',
      example: '“Too tired at night? Try ten minutes after breakfast.”',
      exampleAr: '«متعب ليلاً؟ جرّب عشر دقائق بعد الإفطار.»',
      label: 'THE FRESH START',
      labelAr: 'البداية الجديدة',
      link: '/habit-lab',
    },
  ];
  readonly current = computed(() => this.steps[this.selected()]!);
  readonly visible = computed(() =>
    this.beginner() ? this.steps.filter((_, i) => [0, 3, 4, 11].includes(i)) : this.steps,
  );
  readonly faqs = [
    {
      q: 'Is this just a habit tracker?',
      qa: 'هل هو مجرد متتبع عادات؟',
      a: 'LifeQuest connects outcomes, real work, repeated behavior, reflection, and recovery. Habits are one part of a complete personal operating system.',
      aa: 'رحلة التوازن تربط النتائج والعمل الحقيقي والسلوك المتكرر والتأمل والتعافي. العادات جزء من نظام شخصي متكامل.',
    },
    {
      q: 'What happens if I miss a day?',
      qa: 'ماذا يحدث إذا فاتني يوم؟',
      a: 'Nothing is taken away. Notice what happened, use your minimum action, and try again. Your past progress is still yours.',
      aa: 'لا يُسلب منك شيء. لاحظ ما حدث، واستخدم خطوتك الصغيرة، وحاول مجدداً. تقدمك السابق يظل لك.',
    },
    {
      q: 'Can friends see my journal or habit counts?',
      qa: 'هل يرى الأصدقاء يومياتي أو تفاصيل عاداتي؟',
      a: 'No. Your journal, mood, exact behavioral counts, and private notes stay private. Challenge sharing is limited to the progress, score, or streak you choose.',
      aa: 'لا. يومياتك ومزاجك وأعدادك الدقيقة وملاحظاتك تبقى خاصة. مشاركة التحدي تقتصر على التقدم أو النقاط أو الاستمرارية التي تختارها.',
    },
    {
      q: 'How is my journey score calculated?',
      qa: 'كيف تُحسب درجة رحلتي؟',
      a: 'Habits contribute 30%, quests 20%, goals 15%, check-ins 15%, projects 10%, and recovery 10%. Your Insights page shows every contribution.',
      aa: 'العادات 30٪، المهام الأسبوعية 20٪، الأهداف 15٪، التأملات 15٪، المشروعات 10٪، والتعافي 10٪. صفحة الرؤى توضح كل مساهمة.',
    },
  ];
  choose(step: (typeof this.steps)[number]) {
    this.selected.set(this.steps.indexOf(step));
  }
}
