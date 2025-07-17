#!/usr/bin/env node

/**
 * Git Commit Reminder
 * ===================
 * 
 * Important reminders for committing and pushing changes
 */

// No chalk dependency needed for simple console output

module.exports.run = function() {
  console.log("\n🚨 GIT COMMIT REMINDER 🚨\n");
  console.log("========================\n");
  
  console.log("📋 COMMIT CHECKLIST:");
  console.log("-------------------");
  console.log("✓ Stage all changes: git add .");
  console.log("✓ Commit with descriptive message: git commit -m \"Your message\"");
  console.log("✓ Push to remote: git push origin main");
  console.log("");
  
  console.log("⚠️  IMPORTANT RULES:");
  console.log("------------------");
  console.log("1. ALWAYS commit AND push after making changes");
  console.log("2. NEVER mention Claude, AI, or any AI assistance in commit messages");
  console.log("3. Use professional, descriptive commit messages");
  console.log("4. Focus on WHAT changed, not HOW it was changed");
  console.log("");
  
  console.log("❌ BAD Commit Messages:");
  console.log("----------------------");
  console.log('- "Updated with Claude AI assistance"');
  console.log('- "AI-generated improvements"');
  console.log('- "Changes made by Claude Code"');
  console.log("");
  
  console.log("✅ GOOD Commit Messages:");
  console.log("-----------------------");
  console.log('- "Add taskmaster for project task management"');
  console.log('- "Implement UI modernization plan with shadcn components"');
  console.log('- "Fix TypeScript errors and update build configuration"');
  console.log('- "Create comprehensive task planning system"');
  console.log("");
  
  console.log("🔧 Quick Commands:");
  console.log("-----------------");
  console.log("Check status:  git status");
  console.log("View diff:     git diff");
  console.log("Last commit:   git log -1");
  console.log("");
  
  console.log("💡 Remember: Every change should be committed and pushed!");
  console.log("   Your git config is set to: amirhjalali <amirhjalali@gmail.com>\n");
};