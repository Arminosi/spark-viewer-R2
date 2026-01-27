export const zhViewerDetails = {
  sampler: {
    labelMode: {
      percentage: '百分比',
      percentageDescription: '显示的值是时间除以总时间的百分比。',
      time: '时间',
      timeDescription: '显示的值是以毫秒为单位的时间。',
    },
    displayMode: {
      topDown: '自顶向下',
      topDownDescription: '调用树是"正常"的 - 展开节点会显示它调用的子方法。',
      bottomUp: '自底向上',
      bottomUpDescription: '调用树是"反向"的 - 展开节点会显示调用它的父方法。',
    },
    sortMode: {
      totalTime: '总时间',
      totalTimeDescription: '方法按其"总时间"排序（执行方法内代码的时间加上执行子调用的时间）',
      selfTime: '自身时间',
      selfTimeDescription: '方法按其"自身时间"排序（仅执行方法内代码的时间，不包括子调用）',
    },
    refine: {
      title: '优化',
      description: '下图显示了性能分析过程中的一些关键指标。您可以用光标拖动选择以将性能分析优化到特定时间段。',
    },
    mappings: {
      title: '映射：',
      autoDetect: '自动检测',
      description: '选择查看器在显示性能分析帧时应使用的反混淆映射。',
    },
    infoPoints: {
      title: '信息点：',
      description: '选择是否显示信息点。',
    },
  },
  metadata: {
    tabs: {
      platform: '平台',
      memory: '内存',
      jvmFlags: 'JVM 标志',
      configurations: '配置',
      world: '世界',
      misc: '其他',
      pluginsMods: '插件/模组',
    },
  },
};
