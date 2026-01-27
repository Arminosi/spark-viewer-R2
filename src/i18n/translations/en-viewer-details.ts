export const enViewerDetails = {
  sampler: {
    labelMode: {
      percentage: 'Percentage',
      percentageDescription: 'The value displayed against each frame is the time divided by the total time as a percentage.',
      time: 'Time',
      timeDescription: 'The value displayed against each frame is the time in milliseconds.',
    },
    displayMode: {
      topDown: 'Top Down',
      topDownDescription: 'The call tree is \'normal\' - expanding a node reveals the sub-methods that it calls.',
      bottomUp: 'Bottom Up',
      bottomUpDescription: 'The call tree is \'inverted\' - expanding a node reveals the parent methods that call it.',
    },
    sortMode: {
      totalTime: 'Total Time',
      totalTimeDescription: 'Methods are sorted according to their \'total time\' (the time spent executing code within the method and the time spent executing sub-calls)',
      selfTime: 'Self Time',
      selfTimeDescription: 'Methods are sorted according to their \'self time\' (the time spent executing code within the method only, excluding sub-calls)',
    },
    refine: {
      title: 'Refine',
      description: 'The graph below shows some key metrics over the course of the profile. You can drag + select with your cursor to refine the profile to a specific time period.',
    },
    mappings: {
      title: 'Mappings:',
      autoDetect: 'Auto Detect',
      description: 'Select which deobfuscation mappings the viewer should use when displaying profiler frames.',
    },
    infoPoints: {
      title: 'Info Points:',
      description: 'Select whether info points should be shown.',
    },
  },
  metadata: {
    tabs: {
      platform: 'Platform',
      memory: 'Memory',
      jvmFlags: 'JVM Flags',
      configurations: 'Configurations',
      world: 'World',
      misc: 'Misc',
      pluginsMods: 'Plugins/Mods',
    },
  },
};
