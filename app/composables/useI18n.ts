import { useState } from '#app'

const LOCALES = ['en', 'zh-TW', 'zh-CN'] as const
export type Locale = typeof LOCALES[number]

export const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Header
    home: 'Home',
    hostPanel: 'Host Panel',
    logo: 'Storyteller',

    // Home Index Page
    heroTitle1: 'Create and Share',
    heroTitleAccent: 'Interactive Stories',
    heroDesc: 'Storyteller is a live, "Mad Libs"-style word game. Hosts create stories with hidden blanks, players and viewers watch in real-time as the gaps are filled, and together they reveal the hilarious final story!',
    feature1Title: 'Author Templates',
    feature1Desc: 'Write text stories and configure dynamic blanks with parts of speech and remarks.',
    feature2Title: 'Variable Linking',
    feature2Desc: 'Link placeholders together. Answers prefill automatically for references.',
    feature3Title: 'Live Viewer Sync',
    feature3Desc: 'Viewers watch progress poll in real-time without spoiling the words prematurely.',
    joinTitle: 'Join as Viewer',
    joinDesc: 'Enter a 6-character session code to watch a live storyteller session.',
    joinInputPlaceholder: 'e.g. AB12XY',
    joinButton: 'Join Session',
    joinErrorLength: 'Code must be exactly 6 characters.',
    hostTitle: 'Host a Game',
    hostDesc: 'Want to drive the game and fill in templates for your crowd?',
    hostButton: 'Open Host Panel',

    // Host Dashboard
    hostPanelTitle: 'Host Panel',
    hostPanelDesc: 'Manage your story templates and launch live interactive sessions.',
    createTemplateBtn: '+ Create Template',
    savedTemplatesTitle: 'Saved Story Templates',
    loadingTemplates: 'Loading templates...',
    noTemplatesFound: 'No templates found',
    noTemplatesDesc: 'Start by creating your first story template containing blanks to fill.',
    startSessionBtn: 'Start Session',
    editBtn: 'Edit',
    deleteBtn: 'Delete',
    confirmDeleteText: 'Are you sure you want to delete "{title}"? This cannot be undone.',
    uniqueVariables: '{count} unique variables',
    createdOn: 'Created on {date}',

    // Template Editor
    editTemplateTitle: 'Edit Template',
    newTemplateTitle: 'Create New Template',
    templateTitleLabel: 'Template Title',
    templateTitlePlaceholder: 'Enter a catchy title...',
    templateContentLabel: 'Story Content',
    templateContentDesc: 'Use brackets like 【Noun 1】 or [Verb] to define blanks.',
    templateContentPlaceholder: 'Write your story here. Placeholders like 【Noun 1】 or [Verb] will be detected as variables.',
    variablesHeader: 'Configure Blanks/Variables',
    variablesDesc: 'Configure categories and remarks for each detected placeholder name.',
    noVariablesDetected: 'No placeholders detected yet. Use brackets in the story content above.',
    remarksLabel: 'Remarks/Hints',
    remarksPlaceholder: 'e.g., A funny sound, plural, etc.',
    categoryLabel: 'Category/Part of Speech',
    categoryPlaceholder: 'e.g., Noun, Adjective',
    saveTemplateBtn: 'Save Template',
    backToDashboardBtn: '← Back to Host Panel',
    savingState: 'Saving...',
    loadingTemplate: 'Loading template...',
    cancelBtn: 'Cancel',
    linkedReferenceBadge: 'Linked Reference',

    // Session Page General
    roomNotFound: 'Room Not Found',
    loadingSession: 'Locating storyteller room...',
    returnHomeBtn: 'Return to Home',
    unauthorizedHost: 'Host Authentication Failed',
    returnHostPanelBtn: 'Return to Host Panel',
    joinAsViewerBtn: 'Join as Viewer',

    // Host Session Panel
    activeSessionBadge: 'ACTIVE SESSION',
    sessionCodeLabel: 'Session Code:',
    copyLinkBtn: 'Copy Viewer Link',
    copiedText: 'Copied!',
    wordOfTotal: 'Word {current} of {total}',
    uniqueFieldsFilled: '{filled} / {total} unique fields filled',
    enterWordFor: 'Enter word for: ',
    prevBtn: '← Previous',
    saveNextBtn: 'Save & Next →',
    saveCompleteBtn: 'Save & Complete',
    allBlanksFilled: 'All blanks have been filled!',
    revealStoryBtn: 'Reveal Final Story',
    livePreviewBadge: 'LIVE PREVIEW',
    livePreviewTitle: 'Live Story Preview',
    livePreviewDesc: 'This preview updates in real-time as you fill in blanks. Viewers cannot see this unless you reveal the story.',
    noBlanksFilledYet: 'No blanks filled yet.',
    storyRevealedTitle: 'The Story is Revealed!',
    storyRevealedDesc: 'Viewers can now see the final article on their screens.',
    resetPlayAgainBtn: 'Reset & Play Again',
    exitDashboardBtn: 'Exit to Dashboard',
    interactiveQueueTitle: 'Interactive Queue',
    sidebarInfoDesc: 'Jump directly to any blank in the sequence:',
    hostTyping: 'Host typing...',
    filledStatus: 'Filled',
    waitingStatus: 'Waiting...',
    lockedStatus: 'Locked',
    confirmResetPrompt: 'Are you sure you want to reset this session? All answered words will be cleared.',
    confirmExitPrompt: 'Are you sure you want to end this game and exit? The session code will be deactivated.',
    confirmReplayPrompt: 'Are you sure you want to start a new session? The current session will be ended.',

    // Viewer Session Panel
    liveBroadcastBadge: '● LIVE BROADCAST',
    joinGameWithCode: 'Join the game with code:',
    hostIsTyping: 'Host is typing',
    overallProgress: 'Overall Progress',
    blanksChecklistTitle: 'Blanks Checklist',
    storyReadyBadge: 'THE STORY IS READY'
  },
  'zh-TW': {
    // Header
    home: '首頁',
    hostPanel: '主持面板',
    logo: '故事工坊',

    // Home Index Page
    heroTitle1: '創建與分享',
    heroTitleAccent: '互動填字故事',
    heroDesc: 'Storyteller 是一款實時的「填字遊戲」（Mad Libs）風格的互動遊戲。主機（Host）創建帶有隱藏空白的故事，玩家與觀眾可以實時觀看填字進度，最終共同揭曉令人捧腹的完整故事！',
    feature1Title: '撰寫故事範本',
    feature1Desc: '編寫文字故事並配置包含詞性、備註的動態空白格。',
    feature2Title: '變數連結',
    feature2Desc: '將多個相同的空白格連結在一起，後續的引用會自動預填。',
    feature3Title: '實時觀眾同步',
    feature3Desc: '觀眾可以實時觀看填字進度，且不會提前洩露關鍵詞。',
    joinTitle: '以觀眾身份加入',
    joinDesc: '輸入 6 位數房間代碼以加入並觀看實時故事秀。',
    joinInputPlaceholder: '例如 AB12XY',
    joinButton: '加入遊戲',
    joinErrorLength: '房間代碼必須剛好是 6 個字元。',
    hostTitle: '主持一場遊戲',
    hostDesc: '想要主持遊戲並為你的觀眾填寫故事格嗎？',
    hostButton: '開啟主持面板',

    // Host Dashboard
    hostPanelTitle: '主持控制台',
    hostPanelDesc: '管理您的故事範本並開啟 live 實時互動遊戲。',
    createTemplateBtn: '+ 創建故事範本',
    savedTemplatesTitle: '已儲存的故事範本',
    loadingTemplates: '載入範本中...',
    noTemplatesFound: '未找到任何範本',
    noTemplatesDesc: '從創建第一個包含填空的故事範本開始吧。',
    startSessionBtn: '開始主持',
    editBtn: '編輯',
    deleteBtn: '刪除',
    confirmDeleteText: '您確定要刪除「{title}」嗎？此操作無法復原。',
    uniqueVariables: '{count} 個唯一變數',
    createdOn: '創建於 {date}',

    // Template Editor
    editTemplateTitle: '編輯故事範本',
    newTemplateTitle: '創建故事範本',
    templateTitleLabel: '範本標題',
    templateTitlePlaceholder: '輸入一個吸引人的標題...',
    templateContentLabel: '故事內容',
    templateContentDesc: '使用括號如 【名詞 1】 或 [動詞] 來定義空格。',
    templateContentPlaceholder: '在此處編寫故事。使用括號 【名詞 1】 或 [動詞] 將會自動被偵測為填空變數。',
    variablesHeader: '配置填空變數',
    variablesDesc: '為偵測到的每個填空配置類別與備註提示。',
    noVariablesDetected: '目前尚未偵測到任何填空。請在上方故事內容中使用括號。',
    remarksLabel: '備註提示',
    remarksPlaceholder: '例如：一個滑稽的聲音、複數名詞等',
    categoryLabel: '類別/詞性',
    categoryPlaceholder: '例如：名詞、形容詞',
    saveTemplateBtn: '儲存故事範本',
    backToDashboardBtn: '← 返回主持控制台',
    savingState: '儲存中...',
    loadingTemplate: '載入範本中...',
    cancelBtn: '取消',
    linkedReferenceBadge: '變數連結',

    // Session Page General
    roomNotFound: '找不到房間',
    loadingSession: '正在尋找故事房間...',
    returnHomeBtn: '返回首頁',
    unauthorizedHost: '主持授權失敗',
    returnHostPanelBtn: '返回主持面板',
    joinAsViewerBtn: '以觀眾身份加入',

    // Host Session Panel
    activeSessionBadge: '實時主持會話',
    sessionCodeLabel: '房間代碼：',
    copyLinkBtn: '複製觀眾連結',
    copiedText: '已複製！',
    wordOfTotal: '第 {current} 個字，共 {total} 個',
    uniqueFieldsFilled: '已填寫 {filled} / {total} 個唯一空格',
    enterWordFor: '請輸入：',
    prevBtn: '← 上一個',
    saveNextBtn: '儲存並下一個 →',
    saveCompleteBtn: '儲存並完成',
    allBlanksFilled: '所有空格已填寫完畢！',
    revealStoryBtn: '揭曉完整故事',
    livePreviewBadge: '實時預覽',
    livePreviewTitle: '故事預覽',
    livePreviewDesc: '此預覽會隨著您的輸入實時更新。在您點擊「揭曉完整故事」前，觀眾無法看到此內容。',
    noBlanksFilledYet: '尚未填寫任何空格。',
    storyRevealedTitle: '故事揭曉！',
    storyRevealedDesc: '觀眾現在可以在他們的螢幕上閱讀最終的故事了。',
    resetPlayAgainBtn: '重來並再玩一次',
    exitDashboardBtn: '結束並退出',
    interactiveQueueTitle: '互動進度隊列',
    sidebarInfoDesc: '直接點擊以跳轉到序列中的任何空格：',
    hostTyping: '主持人輸入中...',
    filledStatus: '已填寫',
    waitingStatus: '等待中...',
    lockedStatus: '未解鎖',
    confirmResetPrompt: '您確定要重設此遊戲嗎？所有已填寫的單字都將被清除。',
    confirmExitPrompt: '您確定要結束本局遊戲並退出嗎？此房間代碼將會失效。',
    confirmReplayPrompt: '您確定要開啟一場新的遊戲嗎？當前房間將被關閉。',

    // Viewer Session Panel
    liveBroadcastBadge: '● 實時直播',
    joinGameWithCode: '使用此代碼加入遊戲：',
    hostIsTyping: '主持人正在輸入',
    overallProgress: '總體進度',
    blanksChecklistTitle: '填空檢查清單',
    storyReadyBadge: '故事已準備就緒'
  },
  'zh-CN': {
    // Header
    home: '首页',
    hostPanel: '主持面板',
    logo: '故事工坊',

    // Home Index Page
    heroTitle1: '创建与分享',
    heroTitleAccent: '互动填字故事',
    heroDesc: 'Storyteller 是一款实时的“填字游戏”（Mad Libs）风格的互动游戏。主机（Host）创建带有隐藏空白的故事，玩家与观众可以实时观看填字进度，最终共同揭晓令人捧腹的完整故事！',
    feature1Title: '撰写故事模板',
    feature1Desc: '编写文字故事并配置包含词性、备注的动态空白格。',
    feature2Title: '变量链接',
    feature2Desc: '将多个相同的空白格链接在一起，后续的引用会自动预填。',
    feature3Title: '实时观众同步',
    feature3Desc: '观众可以实时观看填字进度，且不会提前泄露关键词。',
    joinTitle: '以观众身份加入',
    joinDesc: '输入 6 位数房间代码以加入并观看实时故事秀。',
    joinInputPlaceholder: '例如 AB12XY',
    joinButton: '加入游戏',
    joinErrorLength: '房间代码必须刚好是 6 个字符。',
    hostTitle: '主持一场游戏',
    hostDesc: '想要主持游戏并为你的观众填写故事格吗？',
    hostButton: '开启主持面板',

    // Host Dashboard
    hostPanelTitle: '主持控制台',
    hostPanelDesc: '管理您的故事模板并开启 live 实时互动游戏。',
    createTemplateBtn: '+ 创建故事模板',
    savedTemplatesTitle: '已保存的故事模板',
    loadingTemplates: '加载模板中...',
    noTemplatesFound: '未找到任何模板',
    noTemplatesDesc: '从创建第一个包含填空的故事模板开始吧。',
    startSessionBtn: '开始主持',
    editBtn: '编辑',
    deleteBtn: '删除',
    confirmDeleteText: '您确定要删除“{title}”吗？此操作无法恢复。',
    uniqueVariables: '{count} 个唯一变量',
    createdOn: '创建于 {date}',

    // Template Editor
    editTemplateTitle: '编辑故事模板',
    newTemplateTitle: '创建故事模板',
    templateTitleLabel: '模板标题',
    templateTitlePlaceholder: '输入一个吸引人的标题...',
    templateContentLabel: '故事内容',
    templateContentDesc: '使用括号如 【名词 1】 或 [动词] 来定义空格。',
    templateContentPlaceholder: '在此处编写故事。使用括号 【名词 1】 或 [动词] 将会自动被检测为填空变量。',
    variablesHeader: '配置填空变量',
    variablesDesc: '为检测到的每个填空配置类别与备注提示。',
    noVariablesDetected: '目前尚未检测到任何填空。请在上方故事内容中使用括号。',
    remarksLabel: '备注提示',
    remarksPlaceholder: '例如：一个滑稽的声音、复数名词等',
    categoryLabel: '类别/词性',
    categoryPlaceholder: '例如：名词、形容词',
    saveTemplateBtn: '保存故事模板',
    backToDashboardBtn: '← 返回主持控制台',
    savingState: '保存中...',
    loadingTemplate: '加载模板中...',
    cancelBtn: '取消',
    linkedReferenceBadge: '变量链接',

    // Session Page General
    roomNotFound: '找不到房间',
    loadingSession: '正在寻找故事房间...',
    returnHomeBtn: '返回首页',
    unauthorizedHost: '主持授权失败',
    returnHostPanelBtn: '返回主持面板',
    joinAsViewerBtn: '以观众身份加入',

    // Host Session Panel
    activeSessionBadge: '实时主持会话',
    sessionCodeLabel: '房间代码：',
    copyLinkBtn: '复制观众链接',
    copiedText: '已复制！',
    wordOfTotal: '第 {current} 个字，共 {total} 个',
    uniqueFieldsFilled: '已填写 {filled} / {total} 个唯一空格',
    enterWordFor: '请输入：',
    prevBtn: '← 上一个',
    saveNextBtn: '保存并下一个 →',
    saveCompleteBtn: '保存并完成',
    allBlanksFilled: '所有空格已填写完毕！',
    revealStoryBtn: '揭晓完整故事',
    livePreviewBadge: '实时预览',
    livePreviewTitle: '故事预览',
    livePreviewDesc: '此预览会随着您的输入实时更新。在您点击“揭晓完整故事”前，观众无法看到此内容。',
    noBlanksFilledYet: '尚未填写任何空格。',
    storyRevealedTitle: '故事揭晓！',
    storyRevealedDesc: '观众现在可以在他们的屏幕上阅读最终的故事了。',
    resetPlayAgainBtn: '重来并再玩一次',
    exitDashboardBtn: '结束并退出',
    interactiveQueueTitle: '互动进度队列',
    sidebarInfoDesc: '直接点击以跳转到序列中的任何空格：',
    hostTyping: '主持人输入中...',
    filledStatus: '已填写',
    waitingStatus: '等待中...',
    lockedStatus: '未解锁',
    confirmResetPrompt: '您确定要重设此游戏吗？所有已填写的单词都将被清除。',
    confirmExitPrompt: '您确定要结束本局游戏并退出吗？此房间代码将会失效。',
    confirmReplayPrompt: '您确定要开启一场新的游戏吗？当前房间将被关闭。',

    // Viewer Session Panel
    liveBroadcastBadge: '● 实时直播',
    joinGameWithCode: '使用此代码加入游戏：',
    hostIsTyping: '主持人正在输入',
    overallProgress: '总体进度',
    blanksChecklistTitle: '填空检查清单',
    storyReadyBadge: '故事已准备就绪'
  }
}

export const useI18n = () => {
  const locale = useState<Locale>('locale', () => 'en')

  const setLocale = (newLocale: Locale) => {
    if (LOCALES.includes(newLocale)) {
      locale.value = newLocale
      if (process.client) {
        localStorage.setItem('user-locale', newLocale)
        document.documentElement.lang = newLocale.toLowerCase()
      }
    }
  }

  const t = (key: string, variables?: Record<string, string | number>) => {
    const translation = translations[locale.value]?.[key] || translations['en']?.[key] || key
    if (!variables) return translation
    return Object.entries(variables).reduce((acc, [k, v]) => {
      return acc.replace(new RegExp(`{${k}}`, 'g'), String(v))
    }, translation)
  }

  return {
    locale,
    setLocale,
    t,
    locales: LOCALES
  }
}
