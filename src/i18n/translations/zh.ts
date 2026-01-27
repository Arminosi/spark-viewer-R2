import { zhViewerDetails } from './zh-viewer-details';
import { zhPlatformInfo } from './zh-platform-info';

export const zh = {
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    cancel: '取消',
    confirm: '确认',
    close: '关闭',
  },
  header: {
    title: 'Artstyle | Spark Profiler',
    remoteReports: '远程报告',
    openRemoteReports: '打开远程报告库',
    switchLanguage: '切换语言',
  },
  modal: {
    title: '远程报告库',
    startDate: '开始日期',
    endDate: '结束日期',
    clearFilters: '清除筛选',
    loading: '正在加载远程报告...',
    connectionError: '无法连接到远程报告服务器',
    noMatchingReports: '没有符合筛选条件的报告',
    noReports: '暂无可用的远程报告',
    generatedTime: '生成时间',
    fileSize: '文件大小',
    actions: '操作',
    load: '加载',
    showing: '显示',
    of: '/',
    reports: '个报告',
  },
  filePicker: {
    dragDrop: '拖放 profile/heap 文件到此处或点击选择',
    onlyAccepted: '(仅接受',
    or: '或',
    files: '文件)',
  },
  footer: {
    poweredBy: '由',
    and: '和',
    built: '构建',
  },
  viewer: {
    allView: {
      title: '全部视图',
      description: '这是默认的性能分析视图。它以可展开的树形结构显示整个性能分析结果。',
    },
    flatView: {
      title: '扁平视图',
      description: '此视图显示性能分析的扁平化表示，列出了前 250 个方法调用。',
    },
    sourcesView: {
      modsTitle: '模组视图',
      pluginsTitle: '插件视图',
      modsDescription: '此视图显示按模组细分的性能分析过滤表示。',
      pluginsDescription: '此视图显示按插件细分的性能分析过滤表示。',
      other: '其他',
      otherModsDescription: '以下其他模组已安装，但未在此性能分析中出现。太好了！',
      otherPluginsDescription: '以下其他插件已安装，但未在此性能分析中出现。太好了！',
    },
    controls: {
      exportProfile: '导出此性能分析到本地文件',
      toggleWidgets: '点击切换小部件显示',
      toggleMetadata: '点击切换详细元数据显示',
    },
    metadata: {
      networkInterfaces: '网络接口',
      pluginsMods: '插件/模组',
      dataPacks: '数据包',
      gameRuleOverrides: '游戏规则覆盖',
      gameRuleDefaults: '游戏规则默认值',
      memoryAreas: '内存区域',
    },
    graph: {
      refine: '优化',
    },
    ...zhViewerDetails,
  },
  ...zhPlatformInfo,
};
