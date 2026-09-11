# R002a copy parity

> **R002A COMPATIBILITY SCOPE APPROVED — IMPLEMENTATION AUTHORIZED**  
> **R002B PRODUCT EXPANSION — DECISIONS OPEN — IMPLEMENTATION BLOCKED**

Status: proposed bilingual implementation copy for selected R002a presentation only. It must be centralized in the existing localization resources, use Alexandria for display roles and Readex Pro for UI/body roles, and defer to canonical behavior vocabulary.

## Parity rules

- Arabic starts in true RTL; English uses LTR. Names, IDs, numeric values, and task data are isolated for bidirectional safety.
- Meaning is equivalent; strings are not mechanically mirrored or concatenated.
- Dynamic task title, Child name, award, progress, and reward consequences come from selectors.
- EN:S, {{DATA:SCREEN:SCREEN_34}}, {{DATA:SCREEN:SCREEN_51}}, SCREEN labels, rasterized text, and generated placeholder tokens are invalid live copy.
- New safety/privacy wording below is marked HUMAN COPY REVIEW and may not broaden data collection or capability claims.

| Suggested key           | Arabic                                                 | English                                             | Surface / note                                                         |
| ----------------------- | ------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------- |
| parent.home.title       | الرئيسية                                               | Home                                                | Parent Home                                                            |
| parent.home.greeting    | صباح الخير                                             | Good morning                                        | Locale-aware; Child/family name remains data.                          |
| parent.home.reviewTask  | مهمة بانتظار المراجعة                                  | Task awaiting review                                | Parent Home                                                            |
| parent.home.createTask  | إنشاء مهمة                                             | Create a task                                       | Existing builder entry                                                 |
| parent.home.guide       | دليل وليّ الأمر                                        | Parent Guide                                        | Existing bounded guide                                                 |
| parent.tasks.title      | المهام                                                 | Tasks                                               | Parent task list                                                       |
| parent.tasks.emptyTitle | لا توجد مهام الآن                                      | No tasks yet                                        | Conservative empty state                                               |
| parent.tasks.emptyBody  | أنشئ مهمة مناسبة لطفلك عندما تكون مستعدًا.             | Create an appropriate task when you are ready.      | No new outcome                                                         |
| task.builder.choose     | اختر المهمة                                            | Choose a task                                       | Builder step                                                           |
| task.builder.edit       | عدّل تفاصيل المهمة                                     | Edit task details                                   | Builder step                                                           |
| task.builder.review     | راجع المهمة                                            | Review task                                         | Builder step                                                           |
| task.builder.next       | التالي                                                 | Next                                                | 48px minimum                                                           |
| task.builder.approve    | اعتماد المهمة                                          | Approve task                                        | Existing assignment approval                                           |
| task.builder.created    | تم إنشاء المهمة                                        | Task created                                        | Success sheet                                                          |
| child.today.title       | اليوم                                                  | Today                                               | Child root                                                             |
| child.today.ready       | مهمتك جاهزة                                            | Your task is ready                                  | Assigned state                                                         |
| child.task.start        | ابدأ المهمة                                            | Start task                                          | Existing action                                                        |
| child.task.help         | أحتاج مساعدة                                           | I need help                                         | Help stays physical left in Arabic header/action layout.               |
| child.task.progress     | {{completed}} من {{total}}                             | {{completed}} of {{total}}                          | Localized formatter; not literal template at runtime                   |
| child.task.done         | أنهيت المهمة                                           | I finished the task                                 | Enabled only at complete presentation state                            |
| child.task.confirmTitle | هل انتهيت من المهمة؟                                   | Have you finished the task?                         | Confirmation                                                           |
| child.task.submit       | إرسال للمراجعة                                         | Send for review                                     | Submission awards zero                                                 |
| child.task.waiting      | بانتظار مراجعة وليّ الأمر                              | Waiting for Parent review                           | Pending                                                                |
| child.task.waitingBody  | سنخبرك بعد انتهاء المراجعة.                            | We’ll let you know when the review is complete.     | No reward promise                                                      |
| parent.review.title     | مراجعة المهمة                                          | Review task                                         | Pending review                                                         |
| parent.review.approve   | اعتماد الإنجاز                                         | Approve completion                                  | Calls existing approval transaction                                    |
| parent.review.support   | طلب دعم                                                | Support request                                     | Existing retry path                                                    |
| parent.review.sending   | جارٍ الإرسال…                                          | Sending…                                            | Submitting                                                             |
| parent.review.sent      | تم إرسال الدعم                                         | Support sent                                        | Recoverable success                                                    |
| parent.review.approved  | تم اعتماد الإنجاز                                      | Completion approved                                 | Followed by receipt consequences                                       |
| child.followUp.title    | متابعة المهمة                                          | Task follow-up                                      | Existing retry/resume                                                  |
| child.followUp.continue | متابعة المهمة                                          | Continue task                                       | No lost progress                                                       |
| garden.title            | حديقتي                                                 | My Garden                                           | Existing Garden                                                        |
| common.tryAgain         | حاول مرة أخرى                                          | Try again                                           | Recoverable error                                                      |
| common.loading          | جارٍ التحميل…                                          | Loading…                                            | Calm status                                                            |
| common.offline          | أنت غير متصل الآن. بيانات العرض المحلية ما زالت متاحة. | You’re offline. Local demo data is still available. | HUMAN COPY REVIEW: truthful deterministic scope                        |
| common.private          | يظهر هذا داخل عائلتك فقط.                              | Visible only within your family.                    | HUMAN COPY REVIEW: use only where current privacy projection proves it |

## Coverage gaps

All selected exports are Arabic-led and do not constitute approved English visual references. English needs native screenshots at 320, 360, 390, and 430 widths plus a wider viewport, with long-label and 200% text checks. Generated HTML titles are metadata, not user copy. Privacy/safety strings require a named human reviewer before release; untranslated keys must fail tests rather than fall back to EN:S or a SCREEN token.
