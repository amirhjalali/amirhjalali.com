#!/usr/bin/env node

/**
 * Main Task Runner
 * ================
 * 
 * Available tasks for the MR AI portfolio project
 */

module.exports = {
  'ui-modernization': require('./ui-modernization'),
  'git-commit': require('./git-commit-reminder'),
  'commit': require('./git-commit-reminder'), // alias
  
  // Default task
  'default': function() {
    console.log("\n📋 Available Tasks:\n");
    console.log("==================\n");
    console.log("1. ui-modernization - Comprehensive UI modernization plan with shadcn/ui");
    console.log("2. git-commit (or 'commit') - Git commit reminder and guidelines");
    console.log("\nRun a specific task with: npx task <task-name>\n");
  }
};