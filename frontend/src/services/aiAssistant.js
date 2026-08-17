/**
 * TaskFlow Real-Time AI Agent Engine
 * Autonomous Agent architecture with Intent Analysis, Tool Invocation & Thought Tracing.
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
 * Real-Time AI Agent Processor
 * Performs reasoning traces and executes tool calls against the task graph.
 */
export const processAiPrompt = async (promptText, existingTasks = []) => {
  const text = promptText.trim();
  const lower = text.toLowerCase();

  const thoughts = [
    '🧠 Analyzing prompt intent and NLP context...',
    '⚡ Resolving tool bindings & parameters...'
  ];

  // -------------------------------------------------------------
  // 1. CLEAR CHAT TOOL
  // -------------------------------------------------------------
  if (
    lower === 'clear chat' ||
    lower === 'clear chat history' ||
    lower === 'clear history' ||
    lower === 'clear the chat' ||
    lower === 'reset chat' ||
    lower === 'wipe chat' ||
    lower.includes('clear chat') ||
    lower.includes('reset chat')
  ) {
    thoughts.push('🔧 Invoking Tool: clear_chat_tool()');
    return {
      reply: "Chat history cleared! ✨ How can I assist your real-time workflow today?",
      actionType: 'CLEAR_CHAT',
      executedTool: 'clear_chat_tool()',
      thoughts
    };
  }

  // -------------------------------------------------------------
  // 2. CASUAL GREETINGS & CHIT-CHAT
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
    thoughts.push('💬 Formulating real-time conversational response...');
    return {
      reply: `${greetingTime}! 👋 I am your Real-Time TaskFlow AI Agent 🤖.\n\nI operate asynchronously with tool-calling capabilities! You can command me to:\n• *"Add task design dashboard tomorrow"* -> Create task\n• *"Delete all work tasks"* -> Batch SQL deletion\n• *"Reschedule tasks to next week"* -> Bulk date adjustment\n• *"Clear chat"* -> Wipes transcript`,
      actionType: 'NONE',
      executedTool: 'conversational_agent_node()',
      thoughts
    };
  }

  // -------------------------------------------------------------
  // 3. GRATITUDE / COMPLIMENTS
  // -------------------------------------------------------------
  if (lower.includes('thank') || lower.includes('awesome') || lower.includes('great job') || lower.includes('cool') || lower.includes('nice')) {
    thoughts.push('😊 Processing positive telemetry feedback...');
    return {
      reply: "You're very welcome! 🚀 My real-time agent engine is always ready to automate your productivity workflow.",
      actionType: 'NONE',
      executedTool: 'telemetry_feedback_node()',
      thoughts
    };
  }

  // -------------------------------------------------------------
  // 4. TASK DELETION TOOL (delete_tasks_tool)
  // -------------------------------------------------------------
  if (
    lower.includes('delete') ||
    lower.includes('remove') ||
    lower.includes('trash') ||
    lower.includes('erase') ||
    lower.includes('drop task')
  ) {
    thoughts.push('🔍 Querying active task graph for deletion targets...');

    if (existingTasks.length === 0) {
      return {
        reply: "No tasks found in your workspace database to delete! 📭",
        actionType: 'NONE',
        executedTool: 'delete_tasks_tool(target: null)',
        thoughts
      };
    }

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
      thoughts.push(`⚡ Executing delete_tasks_tool(scope: ALL, count: ${existingTasks.length})`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `Deleted all ${existingTasks.length} task${existingTasks.length > 1 ? 's' : ''} from your workspace! 🗑️`,
        actionType: 'DELETE_TASKS',
        taskIds: existingTasks.map((t) => t.id),
        executedTool: `delete_tasks_tool(scope: ALL, count: ${existingTasks.length})`,
        thoughts
      };
    }

    if (lower.includes('completed') || lower.includes('finished') || lower.includes('done')) {
      const completedTasks = existingTasks.filter((t) => t.completed);
      if (completedTasks.length === 0) {
        return {
          reply: "No completed tasks available for deletion!",
          actionType: 'NONE',
          executedTool: 'delete_tasks_tool(scope: COMPLETED, count: 0)',
          thoughts
        };
      }
      thoughts.push(`⚡ Executing delete_tasks_tool(scope: COMPLETED, count: ${completedTasks.length})`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `Deleted ${completedTasks.length} completed task${completedTasks.length > 1 ? 's' : ''} from your SQL database! 🗑️`,
        actionType: 'DELETE_TASKS',
        taskIds: completedTasks.map((t) => t.id),
        executedTool: `delete_tasks_tool(scope: COMPLETED, count: ${completedTasks.length})`,
        thoughts
      };
    }

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
        thoughts.push(`⚡ Executing delete_tasks_tool(category: "${matchedCategory}", count: ${catTasks.length})`);
        thoughts.push('💾 Mutating SQLite Database records...');
        return {
          reply: `Deleted ${catTasks.length} task${catTasks.length > 1 ? 's' : ''} in **${matchedCategory}** category! 🗑️`,
          actionType: 'DELETE_TASKS',
          taskIds: catTasks.map((t) => t.id),
          executedTool: `delete_tasks_tool(category: "${matchedCategory}")`,
          thoughts
        };
      }
    }

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
      thoughts.push(`⚡ Executing delete_tasks_tool(id: "${targetTask.id}", title: "${targetTask.title}")`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `Deleted task **"${targetTask.title}"** from your list! 🗑️`,
        actionType: 'DELETE_TASKS',
        taskIds: [targetTask.id],
        executedTool: `delete_tasks_tool(title: "${targetTask.title}")`,
        thoughts
      };
    }

    return {
      reply: `Could not locate a task matching "${cleanPromptTitle || promptText}". Please verify the title! 🔍`,
      actionType: 'NONE',
      executedTool: 'delete_tasks_tool(status: NOT_FOUND)',
      thoughts
    };
  }

  // -------------------------------------------------------------
  // 5. FOCUS RECOMMENDATION TOOL (focus_recommendation_tool)
  // -------------------------------------------------------------
  if (
    lower.includes('what should i do') ||
    lower.includes('what next') ||
    lower.includes('focus on next') ||
    lower.includes('feel stuck') ||
    lower.includes('where to start') ||
    lower.includes('recommend')
  ) {
    thoughts.push('📊 Executing focus_recommendation_tool()...');
    thoughts.push('⚡ Scoring task priority weights & due dates...');

    const pendingHigh = existingTasks.filter((t) => !t.completed && t.priority === 'high');
    const pendingAny = existingTasks.filter((t) => !t.completed);

    if (pendingAny.length === 0) {
      return {
        reply: "🎉 Zero pending tasks in database! Your task queue is clear. Take a break or command me to schedule new goals!",
        actionType: 'NONE',
        executedTool: 'focus_recommendation_tool(status: CLEAR)',
        thoughts
      };
    }

    const topTask = pendingHigh.length > 0 ? pendingHigh[0] : pendingAny[0];
    return {
      reply: `🎯 **Agent Recommendation**:\n\nFocus on **"${topTask.title}"** ${topTask.category ? `[${topTask.category}]` : ''} ${topTask.priority === 'high' ? '🔥 High Priority' : ''}.\n\nTip: Start a 25-minute Pomodoro focus timer from the top bar! ⏱️`,
      actionType: 'NONE',
      executedTool: `focus_recommendation_tool(recommended_id: "${topTask.id}")`,
      thoughts
    };
  }

  // -------------------------------------------------------------
  // 6. TASK COMPLETION TOOL (complete_tasks_tool)
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
    thoughts.push('⚡ Resolving task completion tool parameters...');

    if (lower.includes('everything') || lower.includes('all tasks') || lower.includes('complete all')) {
      const activeTasks = existingTasks.filter((t) => !t.completed);
      if (activeTasks.length === 0) {
        return {
          reply: "All tasks are already marked as completed! Excellent work! 🎉",
          actionType: 'NONE',
          executedTool: 'complete_tasks_tool(scope: ALL, count: 0)',
          thoughts
        };
      }
      thoughts.push(`⚡ Executing complete_tasks_tool(scope: ALL, count: ${activeTasks.length})`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `Marked all ${activeTasks.length} pending task${activeTasks.length > 1 ? 's' : ''} as completed! 🎉`,
        actionType: 'COMPLETE_ALL',
        taskIds: activeTasks.map((t) => t.id),
        executedTool: `complete_tasks_tool(scope: ALL, count: ${activeTasks.length})`,
        thoughts
      };
    }

    const targetTask = existingTasks.find((t) => {
      const titleLower = t.title.toLowerCase();
      return lower.includes(titleLower) || titleLower.split(' ').some((word) => word.length > 3 && lower.includes(word));
    });

    if (targetTask) {
      if (targetTask.completed) {
        return {
          reply: `Task **"${targetTask.title}"** is already completed! ✅`,
          actionType: 'NONE',
          executedTool: `complete_tasks_tool(status: ALREADY_COMPLETE)`,
          thoughts
        };
      }
      thoughts.push(`⚡ Executing complete_tasks_tool(id: "${targetTask.id}")`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `Marked task **"${targetTask.title}"** as completed! ✅`,
        actionType: 'COMPLETE_ALL',
        taskIds: [targetTask.id],
        executedTool: `complete_tasks_tool(title: "${targetTask.title}")`,
        thoughts
      };
    }

    const cat = parseNaturalCategory(promptText);
    const categoryTasks = existingTasks.filter((t) => !t.completed && t.category?.toLowerCase() === cat.toLowerCase());
    if (categoryTasks.length > 0) {
      thoughts.push(`⚡ Executing complete_tasks_tool(category: "${cat}", count: ${categoryTasks.length})`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `Marked ${categoryTasks.length} task${categoryTasks.length > 1 ? 's' : ''} in **${cat}** as completed! ✅`,
        actionType: 'COMPLETE_ALL',
        taskIds: categoryTasks.map((t) => t.id),
        executedTool: `complete_tasks_tool(category: "${cat}")`,
        thoughts
      };
    }
  }

  // -------------------------------------------------------------
  // 7. RESCHEDULING TOOL (update_tasks_tool)
  // -------------------------------------------------------------
  if (
    lower.includes('postpone') ||
    lower.includes('reschedule') ||
    lower.includes('push') ||
    lower.includes('delay') ||
    lower.includes('move to')
  ) {
    thoughts.push('📅 Parsing natural temporal target...');
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
      thoughts.push(`⚡ Executing update_tasks_tool(dueDate: "${newDate}", count: ${pendingToReschedule.length})`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `📅 Rescheduled ${pendingToReschedule.length} task${pendingToReschedule.length > 1 ? 's' : ''} to **${newDate}**!`,
        actionType: 'UPDATE_TASKS',
        updatedTasks: pendingToReschedule.map((t) => ({ ...t, dueDate: newDate })),
        executedTool: `update_tasks_tool(dueDate: "${newDate}")`,
        thoughts
      };
    }
  }

  // -------------------------------------------------------------
  // 8. PRIORITY ELEVATION TOOL (update_tasks_tool)
  // -------------------------------------------------------------
  if (
    lower.includes('urgent') ||
    lower.includes('high priority') ||
    lower.includes('top priority') ||
    lower.includes('promote') ||
    lower.includes('make high')
  ) {
    thoughts.push('🔥 Elevating task priority weights in active graph...');
    const cat = parseNaturalCategory(promptText);
    const targetTasks = existingTasks.filter((t) => {
      if (t.completed) return false;
      if (lower.includes('work') || lower.includes('personal') || lower.includes('health')) {
        return t.category?.toLowerCase() === cat.toLowerCase();
      }
      return t.priority !== 'high';
    });

    if (targetTasks.length > 0) {
      thoughts.push(`⚡ Executing update_tasks_tool(priority: "high", count: ${targetTasks.length})`);
      thoughts.push('💾 Mutating SQLite Database records...');
      return {
        reply: `🔥 Elevated ${targetTasks.length} task${targetTasks.length > 1 ? 's' : ''} to **High Priority**!`,
        actionType: 'UPDATE_TASKS',
        updatedTasks: targetTasks.map((t) => ({ ...t, priority: 'high', starred: true })),
        executedTool: `update_tasks_tool(priority: "high")`,
        thoughts
      };
    }
  }

  // -------------------------------------------------------------
  // 9. SUBTASK BREAKDOWN TOOL (add_subtasks_tool)
  // -------------------------------------------------------------
  if (lower.includes('subtask') || lower.includes('break down') || lower.includes('split') || lower.includes('steps')) {
    thoughts.push('📋 Generating automated subtask decomposition graph...');
    const matchedTask = existingTasks.find((t) => lower.includes(t.title.toLowerCase()));
    if (matchedTask) {
      const generated = generateSmartSubtasks(matchedTask.title);
      thoughts.push(`⚡ Executing add_subtasks_tool(taskId: "${matchedTask.id}", count: ${generated.length})`);
      thoughts.push('💾 Mutating SQLite Database subtasks table...');
      return {
        reply: `Generated ${generated.length} checklist steps for **"${matchedTask.title}"**! 📋`,
        actionType: 'ADD_SUBTASKS',
        taskId: matchedTask.id,
        subtasks: generated,
        executedTool: `add_subtasks_tool(title: "${matchedTask.title}")`,
        thoughts
      };
    }
  }

  // -------------------------------------------------------------
  // 10. STATUS & ANALYTICS TOOL (analytics_summary_tool)
  // -------------------------------------------------------------
  if (lower.includes('summary') || lower.includes('status') || lower.includes('overview') || lower.includes('advice') || lower.includes('coach')) {
    thoughts.push('📊 Executing analytics_summary_tool()...');
    const total = existingTasks.length;
    const completed = existingTasks.filter((t) => t.completed).length;
    const highPriority = existingTasks.filter((t) => t.priority === 'high' && !t.completed).length;
    const pending = total - completed;

    return {
      reply: `📊 **Real-Time Analytics Summary**:\n• Total Database Tasks: **${total}**\n• Active Pending: **${pending}**\n• Completed: **${completed}**${highPriority > 0 ? `\n• High Priority Pending: **${highPriority}** ⚡` : ''}`,
      actionType: 'NONE',
      executedTool: 'analytics_summary_tool()',
      thoughts
    };
  }

  // -------------------------------------------------------------
  // 11. EXPLICIT TASK CREATION TOOL (create_task_tool)
  // -------------------------------------------------------------
  const isCreateIntent =
    lower.includes('create') ||
    lower.includes('add') ||
    lower.includes('remind') ||
    lower.includes('schedule') ||
    lower.includes('new task') ||
    lower.includes('set a task') ||
    lower.includes('set task') ||
    lower.includes('i need to') ||
    lower.includes('i have to') ||
    lower.includes('put');

  if (isCreateIntent) {
    thoughts.push('📝 Extracting task entity attributes (title, category, priority, due date)...');

    let cleanedTitle = text
      .replace(/^(create a task to|add a task to|create task|add task|remind me to|schedule a task for|schedule task|set a task to|set task to|i need to|i have to|new task|create|add|schedule|set)\s+/i, '')
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
      notes: `Created automatically by TaskFlow AI Real-Time Agent.`,
      category,
      priority,
      dueDate,
      completed: false,
      starred: priority === 'high',
      createdAt: new Date().toISOString(),
      subtasks: shouldAddSubtasks ? generateSmartSubtasks(cleanedTitle) : []
    };

    thoughts.push(`⚡ Executing create_task_tool(title: "${newTask.title}", priority: "${priority}")`);
    thoughts.push('💾 Inserting record into SQLite tasks table...');

    let summaryReply = `Created task **"${newTask.title}"**`;
    if (category) summaryReply += ` in **${category}**`;
    if (priority === 'high') summaryReply += ` with **High Priority** ⚡`;
    if (dueDate) summaryReply += ` due on **${dueDate}**`;
    if (newTask.subtasks.length > 0) summaryReply += ` with ${newTask.subtasks.length} subtasks`;
    summaryReply += `! ✨`;

    return {
      reply: summaryReply,
      actionType: 'CREATE_TASK',
      task: newTask,
      executedTool: `create_task_tool(title: "${newTask.title}")`,
      thoughts
    };
  }

  // -------------------------------------------------------------
  // 12. UNRECOGNIZED INPUT
  // -------------------------------------------------------------
  thoughts.push('❓ No executable tool matched input string.');
  return {
    reply: `I didn't recognize a specific tool command for "${promptText}". 🤔\n\n• To add a task, use **"create"** or **"add"** (e.g. *"Add task review PR tomorrow"*).\n• To delete tasks, say **"delete task [name]"** or **"delete all tasks"**.\n• To clear chat history, say **"clear chat"**.`,
    actionType: 'NONE',
    executedTool: 'unmatched_intent_node()',
    thoughts
  };
};
