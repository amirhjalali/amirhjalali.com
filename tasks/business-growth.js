#!/usr/bin/env node

/**
 * Business Growth & Conversion Plan
 * =================================
 * 
 * This task plan focuses on converting visitors into leads and clients
 */

const tasks = {
  "1_lead_generation": {
    description: "Optimize for lead generation and conversions",
    subtasks: [
      "Create compelling call-to-action buttons",
      "Add consultation booking system (Calendly integration)",
      "Create downloadable AI strategy templates",
      "Add case study landing pages",
      "Implement progressive form disclosure",
      "Add social proof widgets (testimonials carousel)"
    ],
    status: "pending"
  },

  "2_ai_demos": {
    description: "Create interactive AI demonstrations",
    subtasks: [
      "Build live AI chatbot for portfolio questions",
      "Create AI writing assistant demo",
      "Add data visualization interactive demos",
      "Build ROI calculator for AI implementations",
      "Create AI audit checklist tool",
      "Add AI readiness assessment quiz"
    ],
    status: "pending"
  },

  "3_content_marketing": {
    description: "Establish thought leadership content",
    subtasks: [
      "Create AI industry trend reports",
      "Write guest posts for tech publications",
      "Start AI implementation podcast/video series",
      "Create LinkedIn article series",
      "Add webinar hosting capabilities",
      "Build AI resource library with filtering"
    ],
    status: "pending"
  },

  "4_client_onboarding": {
    description: "Streamline client onboarding process",
    subtasks: [
      "Create client portal with project tracking",
      "Add project proposal generator",
      "Build discovery questionnaire forms",
      "Create NDA and contract signing workflow",
      "Add project timeline visualization",
      "Implement client communication system"
    ],
    status: "pending"
  },

  "5_networking_tools": {
    description: "Build professional networking features",
    subtasks: [
      "Add speaking engagement request form",
      "Create media kit download page",
      "Add collaboration inquiry system",
      "Build partner referral program",
      "Create industry connection tracker",
      "Add professional bio variations for different uses"
    ],
    status: "pending"
  }
};

// Export tasks for taskmaster
module.exports.run = function() {
  console.log("\n💼 Business Growth & Conversion Plan\n");
  console.log("===================================\n");
  
  Object.entries(tasks).forEach(([key, task]) => {
    const emoji = task.status === 'completed' ? '✅' : '💼';
    console.log(`${emoji} ${key}: ${task.description}`);
    console.log(`   Status: ${task.status}`);
    console.log(`   Subtasks:`);
    task.subtasks.forEach(subtask => {
      console.log(`   - ${subtask}`);
    });
    console.log('');
  });
  
  console.log("\n📊 Summary:");
  const completed = Object.values(tasks).filter(t => t.status === 'completed').length;
  const total = Object.keys(tasks).length;
  console.log(`Progress: ${completed}/${total} tasks completed (${Math.round(completed/total*100)}%)`);
  console.log("\n💡 Focus Areas: Lead Gen, AI Demos, Thought Leadership, Client Experience, Networking");
};

module.exports.tasks = tasks;