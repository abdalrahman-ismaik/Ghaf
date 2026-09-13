import type { ParentAccountErrorCode } from '../models/parentAccount';

const errorsAr: Record<ParentAccountErrorCode, string> = {
  configuration_unavailable:
    'تسجيل الدخول غير متاح في هذه النسخة. اطلب من منظّم التجربة رابطاً أو نسخة محدّثة.',
  storage_unavailable:
    'تعذّر حفظ جلسة الدخول أو قراءتها على هذا الجهاز. حاول مجدداً أو سجّل الخروج.',
  network_unavailable: 'تعذّر الاتصال بخدمة الحسابات. تحقّق من اتصالك ثم حاول مجدداً.',
  invalid_credentials: 'تحقّق من البريد الإلكتروني وكلمة المرور ثم حاول مجدداً.',
  email_not_verified: 'أكّد بريدك الإلكتروني قبل تسجيل الدخول.',
  invalid_code: 'الرمز غير صالح أو انتهت صلاحيته. استخدم أحدث رمز أُرسل إليك.',
  weak_password: 'استخدم كلمة مرور جديدة من 12 إلى 256 حرفاً.',
  rate_limited: 'جرت محاولات كثيرة خلال وقت قصير. انتظر قليلاً ثم حاول مجدداً.',
  account_unavailable: 'تعذّر إكمال الطلب لهذا الحساب. تحقّق من بياناتك أو حاول مجدداً لاحقاً.',
  access_unavailable:
    'تعذّر التحقّق من الموافقة على الحساب. تبقى العائلة التجريبية مغلقة حتى يكتمل التحقّق.',
  recovery_required: 'أكمل تعيين كلمة المرور الجديدة للعودة إلى تسجيل الدخول.',
  session_expired: 'انتهت جلسة الدخول. سجّل الدخول مجدداً.',
  operation_cancelled: 'توقّفت المحاولة. يمكنك البدء مجدداً.',
  provider_unavailable: 'تعذّر إكمال الطلب الآن. حاول مجدداً.',
};

const errorsEn: Record<ParentAccountErrorCode, string> = {
  configuration_unavailable:
    'Login is unavailable in this build. Ask the pilot organizer for an updated link or build.',
  storage_unavailable:
    'Your login session could not be saved or read on this device. Retry or sign out.',
  network_unavailable: 'The account service could not be reached. Check your connection and retry.',
  invalid_credentials: 'Check your email and password, then try again.',
  email_not_verified: 'Verify your email before signing in.',
  invalid_code: 'This code is invalid or expired. Use the most recent code sent to you.',
  weak_password: 'Use a new password between 12 and 256 characters.',
  rate_limited: 'There have been too many attempts. Wait a little before trying again.',
  account_unavailable:
    'This account request could not be completed. Check your details or try again later.',
  access_unavailable:
    'Account approval could not be checked. The sample family stays closed until verification succeeds.',
  recovery_required: 'Finish setting a new password to return to sign in.',
  session_expired: 'Your session has expired. Sign in again.',
  operation_cancelled: 'The attempt was interrupted. You can start again.',
  provider_unavailable: 'The request could not be completed now. Please retry.',
};

export const pilotResources = {
  ar: {
    label: 'تجربة غاف للبالغين',
    account: 'حساب التجربة',
    accountTitle: 'حسابك وعائلتك التجريبية',
    accountBody: 'تسجيل دخولك حقيقي. العائلة والمهام والنمو بيانات تجريبية مؤقتة.',
    sampleLabel: 'عائلة تجريبية · دخول الطفل والاقتران محاكاة',
    samplePrivacy: 'لا تُدخل معلومات طفل حقيقي. لا تُحفظ العائلة أو المهام أو النمو في حسابك.',
    sampleTemporary: 'يُمسح تقدّم العائلة التجريبية عند إعادة تشغيل التطبيق أو إعادة العائلة.',
    adultOnly: 'هذه التجربة للبالغين بعمر 18 عاماً فأكثر. بإنشاء الحساب تؤكّد أنك بالغ.',
    email: 'البريد الإلكتروني',
    emailPlaceholder: 'you@example.com',
    password: 'كلمة المرور',
    newPassword: 'كلمة المرور الجديدة',
    passwordHint: 'من 12 إلى 256 حرفاً. لا تستخدم كلمة مرور تستعملها لحساب آخر.',
    code: 'الرمز المرسل بالبريد الإلكتروني',
    codeHint: 'أدخل الرمز المكوّن من 6 أو 8 أرقام من أحدث رسالة.',
    working: 'جارٍ المتابعة…',
    signIn: 'تسجيل الدخول',
    register: 'إنشاء حساب للبالغين',
    forgot: 'نسيت كلمة المرور',
    sendRecovery: 'إرسال رمز الاستعادة',
    verify: 'تأكيد البريد الإلكتروني',
    verifyRecovery: 'تأكيد رمز الاستعادة',
    resend: 'إرسال رمز جديد',
    updatePassword: 'حفظ كلمة المرور الجديدة',
    returnToSignIn: 'العودة إلى تسجيل الدخول',
    refresh: 'التحقّق مجدداً',
    retry: 'إعادة المحاولة',
    signOut: 'تسجيل الخروج من الحساب',
    explore: 'استكشاف العائلة التجريبية',
    continueSample: 'متابعة العائلة التجريبية',
    restart: 'إعادة العائلة التجريبية',
    restartHint: 'يمسح التقدّم التجريبي ويُبقي حسابك مسجّلاً للدخول.',
    codeSent:
      'إذا كان الطلب متاحاً لهذا البريد، فستصلك رسالة برمز. تحقّق أيضاً من البريد غير المرغوب فيه.',
    passwordUpdated: 'حُفظت كلمة المرور الجديدة. سجّل الدخول بها الآن.',
    status: {
      restoring: {
        title: 'جارٍ التحقّق من حسابك',
        body: 'نتحقّق من جلسة الدخول والموافقة قبل فتح العائلة التجريبية.',
      },
      signin: {
        title: 'مرحباً بك في تجربة غاف',
        body: 'سجّل الدخول بحسابك للبالغين لاستكشاف العائلة التجريبية.',
      },
      register: {
        title: 'ابدأ بحسابك',
        body: 'أنشئ حساباً، وأكّد بريدك، ثم انتظر موافقة منظّم التجربة.',
      },
      verify: {
        title: 'أكّد بريدك الإلكتروني',
        body: 'أدخل الرمز من بريدك. يمكنك فتح الرسالة على جهاز آخر.',
      },
      forgot: {
        title: 'استعادة الدخول',
        body: 'أدخل بريد حسابك لطلب رمز يساعدك على تعيين كلمة مرور جديدة.',
      },
      'recovery-code': {
        title: 'أدخل رمز الاستعادة',
        body: 'استخدم الرمز من رسالة استعادة كلمة المرور، ثم اختر كلمة مرور جديدة.',
      },
      'new-password': {
        title: 'اختر كلمة مرور جديدة',
        body: 'بعد حفظها، ستعود إلى تسجيل الدخول. تبقى العائلة التجريبية مغلقة أثناء الاستعادة.',
      },
      pending: {
        title: 'حسابك بانتظار الموافقة',
        body: 'تم تأكيد بريدك. سيراجع منظّم التجربة طلبك. تحقّق مجدداً بعد الموافقة.',
      },
      suspended: {
        title: 'الدخول متوقّف حالياً',
        body: 'أوقف منظّم التجربة دخول هذا الحساب. تواصل معه للاستفسار، أو سجّل الخروج.',
      },
      ready: {
        title: 'عائلتك التجريبية جاهزة',
        body: 'استكشف يوماً مع سالم وعلياء: مهمة يوافق عليها وليّ الأمر، وفعل صغير، ونمو رمزي في الحديقة.',
      },
      error: {
        title: 'تعذّر فتح التجربة',
        body: 'سنفتح العائلة التجريبية بعد نجاح التحقّق من حسابك والموافقة عليه.',
      },
      configuration: {
        title: 'الدخول غير متاح بعد',
        body: 'هذه النسخة ليست جاهزة لتسجيل حسابات التجربة.',
      },
    },
    errors: errorsAr,
  },
  en: {
    label: 'Ghaf adult pilot',
    account: 'Pilot account',
    accountTitle: 'Your account and sample family',
    accountBody: 'Your login is real. The family, tasks and growth are temporary sample data.',
    sampleLabel: 'Sample family · Child access and pairing are simulated',
    samplePrivacy:
      'Do not enter real child information. Your account does not save family profiles, tasks or growth.',
    sampleTemporary: 'Sample progress clears when you restart the app or reset the sample.',
    adultOnly:
      'This pilot is for adults aged 18 or older. By creating an account, you confirm you are an adult.',
    email: 'Email address',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    newPassword: 'New password',
    passwordHint: '12 to 256 characters. Use a password you do not use for another account.',
    code: 'Email verification code',
    codeHint: 'Enter the 6- or 8-digit code from the most recent email.',
    working: 'Working…',
    signIn: 'Sign in',
    register: 'Create an adult account',
    forgot: 'Forgot password',
    sendRecovery: 'Send recovery code',
    verify: 'Verify email',
    verifyRecovery: 'Verify recovery code',
    resend: 'Send a new code',
    updatePassword: 'Save new password',
    returnToSignIn: 'Return to sign in',
    refresh: 'Check again',
    retry: 'Retry',
    signOut: 'Sign out of account',
    explore: 'Explore the sample family',
    continueSample: 'Continue sample family',
    restart: 'Restart sample',
    restartHint: 'Clears sample progress and keeps your account signed in.',
    codeSent:
      'If this request is available for the address, an email with a code will arrive. Check your spam folder too.',
    passwordUpdated: 'Your new password is saved. Sign in with it now.',
    status: {
      restoring: {
        title: 'Checking your account',
        body: 'We are checking your session and approval before opening the sample family.',
      },
      signin: {
        title: 'Welcome to the Ghaf pilot',
        body: 'Sign in with your adult account to explore the sample family.',
      },
      register: {
        title: 'Start with your account',
        body: 'Create an account, verify your email, then wait for the pilot organizer to approve access.',
      },
      verify: {
        title: 'Verify your email',
        body: 'Enter the code from your email. You can open the message on another device.',
      },
      forgot: {
        title: 'Recover your login',
        body: 'Enter your account email to request a code for setting a new password.',
      },
      'recovery-code': {
        title: 'Enter your recovery code',
        body: 'Use the code from the password recovery email, then choose a new password.',
      },
      'new-password': {
        title: 'Choose a new password',
        body: 'After saving, return to sign in. The sample family stays closed during recovery.',
      },
      pending: {
        title: 'Waiting for approval',
        body: 'Your email is verified. The pilot organizer will review your request. Check again after approval.',
      },
      suspended: {
        title: 'Access is currently paused',
        body: 'The pilot organizer has paused this account. Contact them for details, or sign out.',
      },
      ready: {
        title: 'Your sample family is ready',
        body: 'Explore a day with Salem and Alya: a Parent-approved task, a small action and symbolic garden growth.',
      },
      error: {
        title: 'The pilot could not open',
        body: 'The sample family will open after your account and approval are successfully checked.',
      },
      configuration: {
        title: 'Login is not available yet',
        body: 'This build is not ready for pilot accounts.',
      },
    },
    errors: errorsEn,
  },
} as const;
