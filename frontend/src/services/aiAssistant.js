/**
 * AI Assistant Engine for TaskFlow
 * Parses natural language input and executes automated task actions.
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
  
  // Check for explicit YYYY-MM-DD
  const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/);
  if (dateMatch) return dateMatch[0];

  return null;
};

// Helper to extract priority
const parsePriority = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('high priority') || lower.includes('urgent') || lower.includes('asap') || lower.includes('important')) {
    return 'high';
  }
  if (lower.includes('low priority') || lower.includes('minor') || lower.includes('easy')) {
    return 'low';
  }
  return 'medium';
};

// Helper to extract category
const parseCategory = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('work') || lower.includes('office') || lower.includes('client') || lower.includes('project') || lower.includes('meeting')) {
    return 'Work';
  }
  if (lower.includes('personal') || lower.includes('home') || lower.includes('family')) {
    return 'Personal';
  }
  if (lower.includes('health') || lower.includes('gym') || lower.includes('fitness') || lower.includes('doctor') || lower.includes('workout')) {
    return 'Health';
  }
  if (lower.includes('study') || lower.includes('read') || lower.includes('course') || lower.includes('learn') || lower.includes('exam')) {
    return 'Study';
  }
  if (lower.includes('shop') || lower.includes('buy') || lower.includes('grocery') || lower.includes('store')) {
    return 'Shopping';
  }
  if (lower.includes('finance') || lower.includes('bill') || lower.includes('pay') || lower.includes('tax') || lower.includes('money')) {
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
 * Processes user prompt natural language input against current task list context
 */
export const processAiPrompt = async (promptText, existingTasks = []) => {
  const lower = promptText.toLowerCase().trim();

  // 1. MARK TASKS AS COMPLETED
  if (
    lower.includes('complete') ||
    lower.includes('mark done') ||
    lower.includes('finish') ||
    lower.includes('check off') ||
    lower.includes('done')
  ) {
    // 1a. Complete all tasks
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

    // 1b. Complete specific task matching title keyword
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

    // 1c. Complete tasks by category or priority
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

  // 2. CLEAR / DELETE COMPLETED TASKS
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

  // 3. GENERATE SUBTASKS FOR EXISTING TASK
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

  // 4. TASK SUMMARIZATION / STATUS INQUIRY
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

  // 5. CREATE NEW TASK
  let cleanedTitle = promptText
    .replace(/^(add task|create task|add|create|remind me to|schedule|make a task to|set a task to)\s+/i, '')
    .trim();

  if (cleanedTitle.length < 3 && (lower.includes('hi') || lower.includes('hello') || lower.includes('help'))) {
    return {
      reply: "Hello! I'm your TaskFlow AI Assistant 🤖. How can I assist you?\n\nCommands you can try:\n• *'Mark task [name] as completed'*\n• *'Complete all work tasks'*\n• *'Add a high priority task due tomorrow'*\n• *'Break down task Launch App into subtasks'*\n• *'Clear completed tasks'*",
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
