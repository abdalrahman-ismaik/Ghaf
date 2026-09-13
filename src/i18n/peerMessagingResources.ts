export const peerMessagingAr = {
  entry: 'رسائل الأسرة',
  entryBody: 'تواصل مع وليّ الأمر، ومع الإخوة عند السماح بالمحادثة وربط الأجهزة بخدمة الرسائل.',
  title: 'محادثات الإخوة',
  boundary:
    'يمكنك السماح بمحادثة بين طفلين مسجّلين في أسرتك. يقرأ الرسائل ويرسلها المشاركان فقط؛ إدارة الإذن لا تتيح لك قراءة المحادثة.',
  childBoundary:
    'هذه محادثة بينكما بإذن وليّ الأمر. يقرأ الرسائل ويرسلها المشاركان فقط. يمكنك إيقافها في أي وقت، وطلب مساعدة وليّ الأمر في محادثته المنفصلة.',
  pair: '{{first}} و{{second}}',
  enabled: 'المحادثة مسموحة',
  disabled: 'المحادثة متوقفة',
  enable: 'السماح لهذه المحادثة',
  revoke: 'إيقاف هذه المحادثة',
  enableBody:
    'اسمح بمحادثة نصية بين هذين الطفلين. يستطيع أي منهما إيقافها، ويلزم إذن جديد منك لاستئنافها.',
  revokeBody: 'سيتوقف الوصول إلى المحادثة لكلا الطفلين. تبقى محادثة كل طفل معك متاحة.',
  confirmEnable: 'تأكيد السماح',
  confirmRevoke: 'تأكيد الإيقاف',
  empty: 'أضف طفلين من أسرتك، ثم وصّل جهاز كل منهما لإتاحة محادثة بينهما.',
  enrollFirst: 'يلزم وجود جهاز متصل لكل طفل قبل السماح بالمحادثة.',
  unavailable: 'تعذّر تحميل أذونات محادثات الإخوة. يمكنك متابعة محادثات وليّ الأمر المتاحة.',
  retry: 'إعادة تحميل الأذونات',
  leave: 'إيقاف هذه المحادثة',
  leaveBody:
    'ستتوقف المحادثة لكليكما. يلزم إذن جديد من وليّ الأمر لاستئنافها. يمكنك مواصلة محادثتك مع وليّ الأمر.',
  confirmLeave: 'تأكيد إيقاف المحادثة',
  removed: 'هذه المحادثة غير متاحة الآن. يمكنك اختيار محادثة أخرى أو التواصل مع وليّ الأمر.',
  participant: 'محادثة بين الإخوة',
} as const;

export const peerMessagingEn = {
  entry: 'Family messages',
  entryBody:
    'Message your Parent and approved siblings after their devices are connected to the messaging service.',
  title: 'Sibling conversations',
  boundary:
    'You can allow a conversation between two enrolled Children in your family. Only its participants read and send messages; managing permission does not give you access to the conversation.',
  childBoundary:
    'This conversation is between you two with Parent permission. Only its participants read and send messages. You can stop it at any time and ask your Parent for help in their separate conversation.',
  pair: '{{first}} and {{second}}',
  enabled: 'Conversation allowed',
  disabled: 'Conversation stopped',
  enable: 'Allow this conversation',
  revoke: 'Stop this conversation',
  enableBody:
    'Allow text messages between these two Children. Either may stop the conversation, and it needs your fresh permission to resume.',
  revokeBody:
    'Both Children will lose access to this conversation. Each Child can still use their separate conversation with you.',
  confirmEnable: 'Confirm permission',
  confirmRevoke: 'Confirm stop',
  empty:
    'Add two Children in your family and connect each device to make a conversation available.',
  enrollFirst: 'Each Child needs a connected device before this conversation can be allowed.',
  unavailable:
    'Sibling permissions could not be loaded. Available Parent conversations can still be used.',
  retry: 'Reload permissions',
  leave: 'Stop this conversation',
  leaveBody:
    'The conversation will stop for both of you. Your Parent must give fresh permission to resume it. You can still message your Parent.',
  confirmLeave: 'Confirm stop conversation',
  removed:
    'This conversation is unavailable now. Choose another conversation or contact your Parent.',
  participant: 'Sibling conversation',
} as const;
