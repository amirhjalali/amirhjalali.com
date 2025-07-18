#!/usr/bin/env node

/**
 * Main Task Runner
 * ================
 * 
 * Available tasks for the MR AI portfolio project
 */

module.exports = {
  'ui-modernization': require('./ui-modernization'),
  'content-enhancement': require('./content-enhancement'),
  'business-growth': require('./business-growth'),
  'git-commit': require('./git-commit'),
  'commit': require('./git-commit'), // alias
  
  // Default task
  'default': function() {
    console.log("\n📋 Available Task Categories:\n");
    console.log("============================\n");
    console.log("1. ui-modernization - ✅ COMPLETED: UI modernization with shadcn/ui (10/10 tasks)");
    console.log("2. content-enhancement - 📝 Content, SEO, and engagement improvements");
    console.log("3. business-growth - 💼 Lead generation and business conversion features");
    console.log("4. git-commit (or 'commit') - Git commit reminder and guidelines");
    console.log("\nRun a specific task with: npx task <task-name>");
    console.log("Example: npx task content-enhancement\n");
    
    console.log("🎉 MAJOR MILESTONE ACHIEVED!");
    console.log("============================");
    console.log("✅ Complete UI modernization finished!");
    console.log("✅ All 10 UI tasks completed with shadcn/ui");
    console.log("✅ Modern, accessible, performant website");
    console.log("\n🚀 Ready for next phase: Content & Business Growth\n");
  }
};