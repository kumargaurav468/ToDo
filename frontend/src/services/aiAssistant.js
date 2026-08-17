/**
 * TaskFlow AI Natural Language Copilot Engine
 * Advanced conversational understanding, intent extraction, and automated task execution.
 */

// Helper to extract relative dates from natural language phrasing
const parseNaturalDate = (text) => {
  const lower = text.toLowerCase();
  const today = new Date();
  
  if (lower.includes('today') || lower.includes('this evening') || lower.includes('tonight')) {
    return today.toISOString().split('T')[0];
  }
  if (lower.includes('tomorrow') || lower.includes('next day')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  if (lower.includes('next week') || lower.includes('in a week') || lower.includes('7 days')) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  }
  if (lower.includes('this weekend') || lower.includes('on weekend')) {
    const day = today.getDay();
    const diff = today.getDate() + (6 - day);
    const saturday = new Date(today.setDate(diff));
    return saturday.toISOString().split('T')[0];
  }
  
  const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) return dateMatch[0];

  return null;
};

// Helper to detect priority level from conversational tone
const parseNaturalPriority = (text) => {
  const lower = text.toLowerCase();
  if (
    lower.includes('high priority') ||
    lower.includes('urgent') ||
    lower.includes('asap') ||
    lower.includes('important') ||
    lower.includes('critical') ||
    lower.includes('top priority') ||
    lower.includes('fire') ||
    lower.includes('crucial')
  ) {
    return 'high';
  }
  if (
    lower.includes('low priority') ||
    lower.includes('minor') ||
    lower.includes('whenever') ||
    lower.includes('eventually') ||
    lower.includes('easy') ||
    lower.includes('low')
  ) {
    return 'low';
  }
  return 'medium';
};

// Helper to extract category from natural context
const parseNaturalCategory = (text) => {
  const lower = text.toLowerCase();
  if (
    lower.includes('work') ||
    lower.includes('office') ||
    lower.includes('client') ||
    lower.includes('project') ||
    lower.includes('meeting') ||
    lower.includes('presentation') ||
    lower.includes('code') ||
    lower.includes('app') ||
    lower.includes('report') ||
    lower.includes('boss') ||
    lower.includes('email')
  ) {
    return 'Work';
  }
  if (lower.includes('personal') || lower.includes('home') || lower.includes('family') || lower.includes('house') || lower.includes('mom') || lower.includes('dad')) {
    return 'Personal';
  }
  if (lower.includes('health') || lower.includes('gym') || lower.includes('fitness') || lower.includes('doctor') || lower.includes('workout') || lower.includes('run') || lower.includes('diet') || lower.includes('meds')) {
    return 'Health';
  }
  if (lower.includes('study') || lower.includes('read') || lower.includes('course') || lower.includes('learn') || lower.includes('exam') || lower.includes('book') || lower.includes('homework')) {
    return 'Study';
  }
  if (lower.includes('shop') || lower.includes('buy') || lower.includes('grocery') || lower.includes('store') || lower.includes('market') || lower.includes('purchase')) {
    return 'Shopping';
  }
  if (lower.includes('finance') || lower.includes('bill') || lower.includes('pay') || lower.includes('tax') || lower.includes('money') || lower.includes('budget') || lower.includes('rent')) {
    return 'Finance';
  }
  return 'General';
};

// Subtask breakdown generator
export const generateSmartSubtasks = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('website') || lower.includes('app') || lower.includes('code') || lower.includes('project') || lower.includes('software')) {
    return [
      { id: `sub-${Date.now()}-1`, title: 'Define scope, requirements & architecture', completed: false },
      { id: `sub-${Date.now()}-2`, title: 'Design UI mockups & UX components', completed: false },
      { id: `sub-${Date.now()}-3`, title: 'Implement frontend logic & API endpoints', completed: false },
      { id: `sub-${Date.now()}-4`, title: 'Perform QA testing & launch to production', completed: false }
    ];
  }
  if (lower.includes('presentation') || lower.includes('deck') || lower.includes('pitch') || lower.includes('meeting')) {
    return [
      { id: `sub-${Date.now()}-1`, title: 'Draft key narrative outline & agenda', completed: false },
      { id: `sub-${Date.now()}-2`, title: 'Gather supporting charts, statistics & visual assets', completed: false },
      { id: `sub-${Date.now()}-3`, title: 'Rehearse delivery and timing', completed: false }
    ];
  }
  if (lower.includes('trip') || lower.includes('travel') || lower.includes('vacation') || lower.includes('flight')) {
    return [
      { id: `sub-${Date.now()}-1`, title: 'Book transport, flights & hotel stay', completed: false },
      { id: `sub-${Date.now()}-2`, title: 'Prepare day-by-day itinerary & reservations', completed: false },
      { id: `sub-${Date.now()}-3`, title: 'Pack clothes, electronics & travel documents', completed: false }
    ];
  }

  return [
    { id: `sub-${Date.now()}-1`, title: 'Initial setup & goal definition', completed: false },
    { id: `sub-${Date.now()}-2`, title: 'Execute main task deliverables', completed: false },
    { id: `sub-${Date.now()}-3`, title: 'Review output & confirm completion', completed: false }
  ];
};

/**
 * Natural Language Processor Engine
 */
export const processAiPrompt = async (promptText, existingTasks = []) => {
  const text = promptText.trim();
  const lower = text.toLowerCase();

  // -------------------------------------------------------------
  // 1. CASUAL GREETINGS & CHIT-CHAT
  // -------------------------------------------------------------
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower.startsWith('good morning') ||
    lower.startsWith('good afternoon') ||
    lower.startsWith('good evening') ||
    lower.includes('how are you') ||
    lower.includes('who are you')
  ) {
    const greetingTime = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
    return {
      reply: `${greetingTime}! 👋 I'm your TaskFlow AI Copilot. You can talk to me naturally like a human assistant!\n\nFor example, say:\n• *"Delete all tasks"* -> Clears entire task list\n• *"Delete task prepare presentation"* -> Deletes specific task\n• *"I finished writing the report"* -> Marks task complete\n• *"Remind me to call doctor tomorrow"* -> Creates task`,
      actionType: 'NONE'
    };
  }

  // -------------------------------------------------------------
  // 2. GRATITUDE / COMPLIMENTS
  // -------------------------------------------------------------
  if (lower.includes('thank') || lower.includes('awesome') || lower.includes('great job') || lower.includes('cool') || lower.includes('nice')) {
    return {
      reply: "You're very welcome! 😊 I'm always here to help keep your productivity flow smooth and organized. Let me know if you need anything else!",
      actionType: 'NONE'
    };
  }

  // -------------------------------------------------------------
  // 3. TASK DELETION INTENT (Ensures delete commands never fall through!)
  // -------------------------------------------------------------
  if (
    lower.includes('delete') ||
    lower.includes('remove') ||
    lower.includes('trash') ||
    lower.includes('erase') ||
    lower.includes('drop task')
  ) {
    if (existingTasks.length === 0) {
      return {
        reply: "You don't have any tasks in your list to delete right now! 📭",
        actionType: 'NONE'
      };
    }

    // 3a. Delete all tasks (e.g. "delete tasks", "delete all tasks", "remove all tasks", "delete all", "delete task")
    const isGeneralDeleteAll =
      lower === 'delete tasks' ||
      lower === 'delete task' ||
      lower === 'delete all tasks' ||
      lower === 'delete all task' ||
      lower === 'delete all' ||
      lower === 'remove all tasks' ||
      lower === 'remove tasks' ||
      lower === 'clear all tasks' ||
      lower === 'clear tasks';

    if (isGeneralDeleteAll) {
      return {
        reply: `Deleted all ${existingTasks.length} task${existingTasks.length > 1 ? 's' : ''} from your workspace! 🗑️`,
        actionType: 'DELETE_TASKS',
        taskIds: existingTasks.map((t) => t.id)
      };
    }

    // 3b. Delete completed tasks
    if (lower.includes('completed') || lower.includes('finished') || lower.includes('done')) {
      const completedTasks = existingTasks.filter((t) => t.completed);
      if (completedTasks.length === 0) {
        return {
          reply: "You don't have any completed tasks to delete right now!",
          actionType: 'NONE'
        };
      }
      return {
        reply: `Deleted ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''} from your database! 🗑️`,
        actionType: 'DELETE_TASKS',
        taskIds: completedTasks.map((t) => t.id)
      };
    }

    // 3c. Delete category tasks (e.g. "delete all work tasks", "remove personal tasks")
    const matchedCategory = parseNaturalCategory(promptText);
    if (
      lower.includes('work') ||
      lower.includes('personal') ||
      lower.includes('health') ||
      lower.includes('study') ||
      lower.includes('shopping') ||
      lower.includes('finance')
    ) {
      const catTasks = existingTasks.filter((t) => t.category?.toLowerCase() === matchedCategory.toLowerCase());
      if (catTasks.length > 0) {
        return {
          reply: `Deleted ${catTasks.length} task${catTasks.length > 1 ? 's' : ''} in **${matchedCategory}** category! 🗑️`,
          actionType: 'DELETE_TASKS',
          taskIds: catTasks.map((t) => t.id)
        };
      }
    }

    // 3d. Delete specific task matching title
    const cleanPromptTitle = lower
      .replace(/^(delete task|remove task|delete the task|remove the task|delete|remove|trash|erase)\s+/i, '')
      .trim();

    const targetTask = existingTasks.find((t) => {
      const titleLower = t.title.toLowerCase();
      return (
        titleLower === cleanPromptTitle ||
        titleLower.includes(cleanPromptTitle) ||
        cleanPromptTitle.includes(titleLower) ||
        titleLower.split(' ').some((word) => word.length > 3 && cleanPromptTitle.includes(word))
      );
    });

    if (targetTask) {
      return {
        reply: `Deleted task **"${targetTask.title}"** from your list! 🗑️`,
        actionType: 'DELETE_TASKS',
        taskIds: [targetTask.id]
      };
    }

    // If no matching title found, respond with clear error message instead of creating a task
    return {
      reply: `Could not find a task matching "${cleanPromptTitle || promptText}". Please check the task title and try again! 🔍`,
      actionType: 'NONE'
    };
  }

  // -------------------------------------------------------------
  // 4. "WHAT SHOULD I WORK ON NEXT?" / RECOMMENDATION
  // -------------------------------------------------------------
  if (
    lower.includes('what should i do') ||
    lower.includes('what next') ||
    lower.includes('focus on next') ||
    lower.includes('feel stuck') ||
    lower.includes('where to start') ||
    lower.includes('recommend')
  ) {
    const pendingHigh = existingTasks.filter((t) => !t.completed && t.priority === 'high');
    const pendingAny = existingTasks.filter((t) => !t.completed);

    if (pendingAny.length === 0) {
      return {
        reply: "🎉 You have zero pending tasks! Your task list is totally clear. Take a well-deserved break or ask me to add new goals!",
        actionType: 'NONE'
      };
    }

    const topTask = pendingHigh.length > 0 ? pendingHigh[0] : pendingAny[0];
    return {
      reply: `🎯 **Recommended Focus**:\n\nI suggest starting with **"${topTask.title}"** ${topTask.category ? `(${topTask.category})` : ''} ${topTask.priority === 'high' ? '🔥 High Priority' : ''}.\n\nTip: Use the Pomodoro timer tool at the top to tackle it in a 25-minute focus session! ⏱️`,
      actionType: 'NONE'
    };
  }

  // -------------------------------------------------------------
  // 5. TASK COMPLETION
  // -------------------------------------------------------------
  if (
    lower.includes('finished') ||
    lower.includes('completed') ||
    lower.includes('done with') ||
    lower.includes('check off') ||
    lower.includes('mark done') ||
    lower.includes('mark complete') ||
    lower.includes('wrap up')
  ) {
    if (lower.includes('everything') || lower.includes('all tasks') || lower.includes('complete all')) {
      const activeTasks = existingTasks.filter((t) => !t.completed);
      if (activeTasks.length === 0) {
        return {
          reply: "All your tasks are already marked as completed! Outstanding work! 🎉",
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
        reply: `Awesome! Marked task **"${targetTask.title}"** as completed! ✅`,
        actionType: 'COMPLETE_ALL',
        taskIds: [targetTask.id]
      };
    }

    const cat = parseNaturalCategory(promptText);
    const categoryTasks = existingTasks.filter((t) => !t.completed && t.category?.toLowerCase() === cat.toLowerCase());
    if (categoryTasks.length > 0) {
      return {
        reply: `Marked ${categoryTasks.length} task${categoryTasks.length > 1 ? 's' : ''} in **${cat}** as completed! ✅`,
        actionType: 'COMPLETE_ALL',
        taskIds: categoryTasks.map((t) => t.id)
      };
    }
  }

  // -------------------------------------------------------------
  // 6. RESCHEDULING / POSTPONING
  // -------------------------------------------------------------
  if (
    lower.includes('postpone') ||
    lower.includes('reschedule') ||
    lower.includes('push') ||
    lower.includes('delay') ||
    lower.includes('move to')
  ) {
    const newDate = parseNaturalDate(promptText) || new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const cat = parseNaturalCategory(promptText);

    const pendingToReschedule = existingTasks.filter((t) => {
      if (t.completed) return false;
      if (lower.includes('work') || lower.includes('personal') || lower.includes('health') || lower.includes('study')) {
        return t.category?.toLowerCase() === cat.toLowerCase();
      }
      return true;
    });

    if (pendingToReschedule.length > 0) {
      return {
        reply: `📅 Rescheduled ${pendingToReschedule.length} task${pendingToReschedule.length > 1 ? 's' : ''} to **${newDate}**!`,
        actionType: 'UPDATE_TASKS',
        updatedTasks: pendingToReschedule.map((t) => ({ ...t, dueDate: newDate }))
      };
    }
  }

  // -------------------------------------------------------------
  // 7. PRIORITY ELEVATION
  // -------------------------------------------------------------
  if (
    lower.includes('urgent') ||
    lower.includes('high priority') ||
    lower.includes('top priority') ||
    lower.includes('promote') ||
    lower.includes('make high')
  ) {
    const cat = parseNaturalCategory(promptText);
    const targetTasks = existingTasks.filter((t) => {
      if (t.completed) return false;
      if (lower.includes('work') || lower.includes('personal') || lower.includes('health')) {
        return t.category?.toLowerCase() === cat.toLowerCase();
      }
      return t.priority !== 'high';
    });

    if (targetTasks.length > 0) {
      return {
        reply: `🔥 Elevated ${targetTasks.length} task${targetTasks.length > 1 ? 's' : ''} to **High Priority**!`,
        actionType: 'UPDATE_TASKS',
        updatedTasks: targetTasks.map((t) => ({ ...t, priority: 'high', starred: true }))
      };
    }
  }

  // -------------------------------------------------------------
  // 8. SUBTASK BREAKDOWN
  // -------------------------------------------------------------
  if (lower.includes('subtask') || lower.includes('break down') || lower.includes('split') || lower.includes('steps')) {
    const matchedTask = existingTasks.find((t) => lower.includes(t.title.toLowerCase()));
    if (matchedTask) {
      const generated = generateSmartSubtasks(matchedTask.title);
      return {
        reply: `Generated ${generated.length} checklist steps for **"${matchedTask.title}"**! 📋`,
        actionType: 'ADD_SUBTASKS',
        taskId: matchedTask.id,
        subtasks: generated
      };
    }
  }

  // -------------------------------------------------------------
  // 9. STATUS / PRODUCTIVITY ADVICE & SUMMARIES
  // -------------------------------------------------------------
  if (lower.includes('summary') || lower.includes('status') || lower.includes('overview') || lower.includes('advice') || lower.includes('coach')) {
    const total = existingTasks.length;
    const completed = existingTasks.filter((t) => t.completed).length;
    const highPriority = existingTasks.filter((t) => t.priority === 'high' && !t.completed).length;
    const pending = total - completed;

    return {
      reply: `📊 **Productivity Summary**:\n• Total Tasks: **${total}**\n• Active Pending: **${pending}**\n• Completed: **${completed}**${highPriority > 0 ? `\n• High Priority Pending: **${highPriority}** ⚡` : ''}`,
      actionType: 'NONE'
    };
  }

  // -------------------------------------------------------------
  // 10. NATURAL LANGUAGE TASK CREATION (Fallback for creative prompts)
  // -------------------------------------------------------------
  let cleanedTitle = text
    .replace(/^(i need to|i have to|remind me to|add a task to|create a task to|add task|create task|add|create|schedule|set a task to)\s+/i, '')
    .trim();

  if (!cleanedTitle) {
    cleanedTitle = text;
  }

  const priority = parseNaturalPriority(text);
  const category = parseNaturalCategory(text);
  const dueDate = parseNaturalDate(text);
  const shouldAddSubtasks = lower.includes('subtask') || lower.includes('breakdown') || lower.includes('steps');

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
