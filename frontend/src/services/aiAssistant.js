/**
 * AI Assistant Copilot Engine for TaskFlow
 * Expanded natural language understanding & automated workflow execution.
 */

// Helper to determine relative dates
const parseDueDate = (text) => {
  const lower = text.toLowerCase();
  const today = new Date();
  
  if (lower.includes('today')) {
    return today.toISOString().split('T')[0];
  }
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  if (lower.includes('next week') || lower.includes('in a week')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }
  
  const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) return dateMatch[0];

  return null;
};

// Helper to extract priority
const parsePriority = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('high priority') || lower.includes('urgent') || lower.includes('asap') || lower.includes('important') || lower.includes('high')) {
    return 'high';
  }
  if (lower.includes('low priority') || lower.includes('minor') || lower.includes('easy') || lower.includes('low')) {
    return 'low';
  }
  return 'medium';
};

// Helper to extract category
const parseCategory = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('work') || lower.includes('office') || lower.includes('client') || lower.includes('project') || lower.includes('meeting') || lower.includes('presentation') || lower.includes('code') || lower.includes('app')) {
    return 'Work';
  }
  if (lower.includes('personal') || lower.includes('home') || lower.includes('family') || lower.includes('house')) {
    return 'Personal';
  }
  if (lower.includes('health') || lower.includes('gym') || lower.includes('fitness') || lower.includes('doctor') || lower.includes('workout') || lower.includes('run') || lower.includes('diet')) {
    return 'Health';
  }
  if (lower.includes('study') || lower.includes('read') || lower.includes('course') || lower.includes('learn') || lower.includes('exam') || lower.includes('book')) {
    return 'Study';
  }
  if (lower.includes('shop') || lower.includes('buy') || lower.includes('grocery') || lower.includes('store') || lower.includes('market')) {
    return 'Shopping';
  }
  if (lower.includes('finance') || lower.includes('bill') || lower.includes('pay') || lower.includes('tax') || lower.includes('money') || lower.includes('budget')) {
    return 'Finance';
  }
  return 'General';
};

// Generate smart breakdown subtasks based on title
export const generateSmartSubtasks = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('website') || lower.includes('app') || lower.includes('code') || lower.includes('project')) {
    return [
      { id: `sub-${Date.now()}-1`, title: 'Define requirements and user flow', completed: false },
      { id: `sub-${Date.now()}-2`, title: 'Create UI mockups and design assets', completed: false },
      { id: `sub-${Date.now()}-3`, title: 'Implement frontend components & backend API', completed: false },
      { id: `sub-${Date.now()}-4`, title: 'Test thoroughly and deploy to production', completed: false }
    ];
  }
  if (lower.includes('presentation') || lower.includes('deck') || lower.includes('pitch')) {
    return [
      { id: `sub-${Date.now()}-1`, title: 'Draft key slide outline & messaging', completed: false },
      { id: `sub-${Date.now()}-2`, title: 'Gather relevant data metrics and graphics', completed: false },
      { id: `sub-${Date.now()}-3`, title: 'Practice talk track and timing', completed: false }
    ];
  }
  if (lower.includes('trip') || lower.includes('travel') || lower.includes('vacation')) {
    return [
      { id: `sub-${Date.now()}-1`, title: 'Book flights and hotel accommodation', completed: false },
      { id: `sub-${Date.now()}-2`, title: 'Create daily itinerary and activity list', completed: false },
      { id: `sub-${Date.now()}-3`, title: 'Pack clothes, toiletries, and travel documents', completed: false }
    ];
  }
  if (lower.includes('party') || lower.includes('event') || lower.includes('dinner')) {
    return [
      { id: `sub-${Date.now()}-1`, title: 'Send invitations to guest list', completed: false },
      { id: `sub-${Date.now()}-2`, title: 'Order food, drinks, and party supplies', completed: false },
      { id: `sub-${Date.now()}-3`, title: 'Set up venue space & sound playlist', completed: false }
    ];
  }

  return [
    { id: `sub-${Date.now()}-1`, title: 'Initial planning & research', completed: false },
    { id: `sub-${Date.now()}-2`, title: 'Execute main task action items', completed: false },
    { id: `sub-${Date.now()}-3`, title: 'Final review and verification', completed: false }
  ];
};

/**
 * Main AI Prompt Processor Engine
 */
export const processAiPrompt = async (promptText, existingTasks = []) => {
  const lower = promptText.toLowerCase().trim();

  // -------------------------------------------------------------
  // FEATURE 1: AI PRODUCTIVITY COACH & HABIT INSIGHTS
  // -------------------------------------------------------------
  if (
    lower.includes('advice') ||
    lower.includes('coach') ||
    lower.includes('motivation') ||
    lower.includes('insight') ||
    lower.includes('tip') ||
    lower.includes('habit')
  ) {
    const total = existingTasks.length;
    const completed = existingTasks.filter((t) => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const highPending = existingTasks.filter((t) => !t.completed && t.priority === 'high').length;

    let coachTip = `💡 **TaskFlow AI Productivity Coach**:\n\nYour completion rate is **${rate}%** (${completed}/${total} tasks completed).\n`;
    if (highPending > 0) {
      coachTip += `⚠️ You have **${highPending} High Priority** task${highPending > 1 ? 's' : ''} pending. Focus on tackling your highest impact item first using the 25-minute Pomodoro timer! ⏱️`;
    } else if (rate >= 80) {
      coachTip += `🌟 Outstanding momentum! You are crushing your goals today. Keep up the great focus! 🚀`;
    } else {
      coachTip += `🎯 Try breaking complex goals down into subtasks with step-by-step checklist items to build momentum!`;
    }

    return {
      reply: coachTip,
      actionType: 'NONE'
    };
  }

  // -------------------------------------------------------------
  // FEATURE 2: AI RESCHEDULER / POSTPONE DUE DATES
  // -------------------------------------------------------------
  if (
    lower.includes('reschedule') ||
    lower.includes('postpone') ||
    lower.includes('move date') ||
    lower.includes('delay') ||
    lower.includes('due tomorrow') ||
    lower.includes('due next week')
  ) {
    const newDate = parseDueDate(promptText) || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const categoryTarget = parseCategory(promptText);

    // Filter target pending tasks
    const pendingToReschedule = existingTasks.filter((t) => {
      if (t.completed) return false;
      if (lower.includes('work') || lower.includes('personal') || lower.includes('health') || lower.includes('study')) {
        return t.category?.toLowerCase() === categoryTarget.toLowerCase();
      }
      return true;
    });

    if (pendingToReschedule.length === 0) {
      return {
        reply: "No matching pending tasks found to reschedule!",
        actionType: 'NONE'
      };
    }

    return {
      reply: `📅 Rescheduled ${pendingToReschedule.length} task${pendingToReschedule.length > 1 ? 's' : ''} to **${newDate}**!`,
      actionType: 'UPDATE_TASKS',
      updatedTasks: pendingToReschedule.map((t) => ({ ...t, dueDate: newDate }))
    };
  }

  // -------------------------------------------------------------
  // FEATURE 3: AI PRIORITY BOOSTER
  // -------------------------------------------------------------
  if (
    lower.includes('make high priority') ||
    lower.includes('promote') ||
    lower.includes('set priority to high') ||
    lower.includes('urgent') ||
    lower.includes('boost priority')
  ) {
    const matchedCategory = parseCategory(promptText);
    const targetTasks = existingTasks.filter((t) => {
      if (t.completed) return false;
      if (lower.includes('work') || lower.includes('personal') || lower.includes('health')) {
        return t.category?.toLowerCase() === matchedCategory.toLowerCase();
      }
      return t.priority !== 'high';
    });

    if (targetTasks.length === 0) {
      return {
        reply: "No pending tasks required priority promotion!",
        actionType: 'NONE'
      };
    }

    return {
      reply: `🔥 Promoted ${targetTasks.length} task${targetTasks.length > 1 ? 's' : ''} to **High Priority**!`,
      actionType: 'UPDATE_TASKS',
      updatedTasks: targetTasks.map((t) => ({ ...t, priority: 'high', starred: true }))
    };
  }

  // -------------------------------------------------------------
  // FEATURE 4: AI AUTO-CATEGORIZATION OF UNORGANIZED TASKS
  // -------------------------------------------------------------
  if (
    lower.includes('categorize') ||
    lower.includes('auto tag') ||
    lower.includes('organize categories') ||
    lower.includes('fix categories')
  ) {
    const unorganized = existingTasks.filter((t) => !t.category || t.category === 'General');
    if (unorganized.length === 0) {
      return {
        reply: "All your tasks already have proper categories assigned! 📁",
        actionType: 'NONE'
      };
    }

    const updated = unorganized.map((t) => ({
      ...t,
      category: parseCategory(t.title)
    }));

    return {
      reply: `🏷️ Automatically categorized ${updated.length} task${updated.length > 1 ? 's' : ''} based on title keywords!`,
      actionType: 'UPDATE_TASKS',
      updatedTasks: updated
    };
  }

  // -------------------------------------------------------------
  // FEATURE 5: AI MARK TASKS AS COMPLETED
  // -------------------------------------------------------------
  if (
    lower.includes('complete') ||
    lower.includes('mark done') ||
    lower.includes('finish') ||
    lower.includes('check off') ||
    lower.includes('done')
  ) {
    if (lower.includes('complete all') || lower.includes('finish all') || lower.includes('mark all')) {
      const activeTasks = existingTasks.filter((t) => !t.completed);
      if (activeTasks.length === 0) {
        return {
          reply: "All your tasks are already marked as completed! Great job! 🎉",
          actionType: 'NONE'
        };
      }
      return {
        reply: `Marked all ${activeTasks.length} pending task${activeTasks.length > 1 ? 's' : ''} as completed! 🎉`,
        actionType: 'COMPLETE_ALL',
        taskIds: activeTasks.map((t) => t.id)
      };
    }

    const targetTask = existingTasks.find((t) => {
      const titleLower = t.title.toLowerCase();
      return lower.includes(titleLower) || titleLower.split(' ').some((word) => word.length > 3 && lower.includes(word));
    });

    if (targetTask) {
      if (targetTask.completed) {
        return {
          reply: `Task **"${targetTask.title}"** is already marked as completed! ✅`,
          actionType: 'NONE'
        };
      }
      return {
        reply: `Marked task **"${targetTask.title}"** as completed! ✅`,
        actionType: 'COMPLETE_ALL',
        taskIds: [targetTask.id]
      };
    }

    const matchedCategory = parseCategory(promptText);
    const categoryTasks = existingTasks.filter(
      (t) => !t.completed && t.category?.toLowerCase() === matchedCategory.toLowerCase()
    );
    if (categoryTasks.length > 0) {
      return {
        reply: `Marked ${categoryTasks.length} task${categoryTasks.length > 1 ? 's' : ''} in **${matchedCategory}** as completed! ✅`,
        actionType: 'COMPLETE_ALL',
        taskIds: categoryTasks.map((t) => t.id)
      };
    }
  }

  // -------------------------------------------------------------
  // FEATURE 6: CLEAR / DELETE COMPLETED TASKS
  // -------------------------------------------------------------
  if (lower.includes('clear completed') || lower.includes('delete completed') || lower.includes('remove finished') || lower.includes('delete finished')) {
    const completedTasks = existingTasks.filter((t) => t.completed);
    if (completedTasks.length === 0) {
      return {
        reply: "You don't have any completed tasks to clear right now!",
        actionType: 'NONE'
      };
    }
    return {
      reply: `Cleared ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''} from your task list! 🧹`,
      actionType: 'DELETE_COMPLETED',
      taskIds: completedTasks.map((t) => t.id)
    };
  }

  // -------------------------------------------------------------
  // FEATURE 7: GENERATE SUBTASKS FOR EXISTING TASK
  // -------------------------------------------------------------
  if (lower.includes('subtask') || lower.includes('break down') || lower.includes('split task')) {
    const matchedTask = existingTasks.find((t) => lower.includes(t.title.toLowerCase()));
    if (matchedTask) {
      const generated = generateSmartSubtasks(matchedTask.title);
      return {
        reply: `Generated ${generated.length} actionable subtasks for "${matchedTask.title}"! 📋`,
        actionType: 'ADD_SUBTASKS',
        taskId: matchedTask.id,
        subtasks: generated
      };
    }
  }

  // -------------------------------------------------------------
  // FEATURE 8: TASK SUMMARIZATION & OVERVIEW
  // -------------------------------------------------------------
  if (lower.includes('summary') || lower.includes('status') || lower.includes('what do i have') || lower.includes('show my tasks') || lower.includes('overview')) {
    const total = existingTasks.length;
    const completed = existingTasks.filter((t) => t.completed).length;
    const highPriority = existingTasks.filter((t) => t.priority === 'high' && !t.completed).length;
    const pending = total - completed;

    let response = `Here is your productivity overview:\n• Total Tasks: **${total}**\n• Pending: **${pending}**\n• Completed: **${completed}**`;
    if (highPriority > 0) {
      response += `\n• High Priority Pending: **${highPriority}** ⚠️`;
    }
    return {
      reply: response,
      actionType: 'NONE'
    };
  }

  // -------------------------------------------------------------
  // FEATURE 9: CREATE NEW TASK
  // -------------------------------------------------------------
  let cleanedTitle = promptText
    .replace(/^(add task|create task|add|create|remind me to|schedule|make a task to|set a task to)\s+/i, '')
    .trim();

  if (cleanedTitle.length < 3 && (lower.includes('hi') || lower.includes('hello') || lower.includes('help'))) {
    return {
      reply: "Hello! I'm your TaskFlow AI Assistant 🤖. Here are all the powerful features I can handle:\n\n• **Mark Tasks Completed**: *'Mark work tasks as completed'*\n• **Priority Booster**: *'Promote work tasks to high priority'*\n• **Task Rescheduler**: *'Postpone work tasks to tomorrow'*\n• **Auto Categorize**: *'Categorize my tasks'*\n• **Subtask Breakdown**: *'Break down task Build App into subtasks'*\n• **Productivity Advice**: *'Give me productivity coach advice'*\n• **Create Tasks**: *'Add a high priority work task due tomorrow'*",
      actionType: 'NONE'
    };
  }

  if (!cleanedTitle) {
    cleanedTitle = promptText;
  }

  const priority = parsePriority(promptText);
  const category = parseCategory(promptText);
  const dueDate = parseDueDate(promptText);
  const shouldAddSubtasks = lower.includes('subtask') || lower.includes('breakdown') || lower.includes('with steps');

  const newTask = {
    id: `task-${Date.now()}`,
    title: cleanedTitle.charAt(0).toUpperCase() + cleanedTitle.slice(1),
    notes: `Created automatically by TaskFlow AI Assistant.`,
    category,
    priority,
    dueDate,
    completed: false,
    starred: priority === 'high',
    createdAt: new Date().toISOString(),
    subtasks: shouldAddSubtasks ? generateSmartSubtasks(cleanedTitle) : []
  };

  let summaryReply = `Created task **"${newTask.title}"**`;
  if (category) summaryReply += ` in **${category}**`;
  if (priority === 'high') summaryReply += ` with **High Priority** ⚡`;
  if (dueDate) summaryReply += ` due on **${dueDate}**`;
  if (newTask.subtasks.length > 0) summaryReply += ` with ${newTask.subtasks.length} subtasks`;
  summaryReply += `! ✨`;

  return {
    reply: summaryReply,
    actionType: 'CREATE_TASK',
    task: newTask
  };
};
