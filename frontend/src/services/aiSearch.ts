/**
 * TaskFlow AI Natural Language & Semantic Search Engine
 * Intelligent query interpretation, constraint extraction, synonym expansion, and relevance scoring.
 */

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string | null;
  completed: boolean;
  starred?: boolean;
  createdAt: string;
  subtasks?: Subtask[];
}

export interface ScoredTask extends Task {
  aiMatchScore: number;
  aiMatchReason: string;
}

export interface QueryBreakdown {
  detectedCategory: string | null;
  detectedPriority: string | null;
  detectedStatus: string | null;
  detectedTime: string | null;
  semanticTopics: string[];
}

export interface AiSearchResult {
  results: ScoredTask[];
  queryBreakdown: QueryBreakdown;
  matchedCount: number;
}

// Semantic Dictionary for Conceptual Topic Expansion
const SEMANTIC_DICTIONARY: Record<string, string[]> = {
  workout: ['gym', 'fitness', 'exercise', 'health', 'run', 'cardio', 'walk', 'meds', 'doctor', 'diet'],
  health: ['gym', 'fitness', 'exercise', 'workout', 'doctor', 'meds', 'medication', 'run', 'diet', 'water'],
  code: ['app', 'website', 'developer', 'software', 'bug', 'github', 'repo', 'feature', 'api', 'frontend', 'backend', 'tech', 'pr'],
  work: ['office', 'client', 'project', 'presentation', 'deck', 'meeting', 'report', 'boss', 'email', 'doc', 'contract'],
  study: ['book', 'read', 'exam', 'course', 'learn', 'homework', 'test', 'class', 'paper', 'research'],
  finance: ['bill', 'pay', 'money', 'budget', 'tax', 'rent', 'bank', 'cost', 'invoice', 'expense'],
  shopping: ['buy', 'store', 'grocery', 'market', 'purchase', 'cart', 'items', 'supermarket', 'mall']
};

/**
 * Parses natural language query to extract structured intent constraints.
 */
export const parseNaturalQueryConstraints = (query: string): QueryBreakdown => {
  const lower = query.toLowerCase();

  // Priority Extraction
  let detectedPriority: string | null = null;
  if (lower.includes('high priority') || lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('important')) {
    detectedPriority = 'high';
  } else if (lower.includes('low priority') || lower.includes('minor') || lower.includes('whenever') || lower.includes('easy')) {
    detectedPriority = 'low';
  } else if (lower.includes('medium priority')) {
    detectedPriority = 'medium';
  }

  // Category Extraction
  let detectedCategory: string | null = null;
  if (lower.includes('work') || lower.includes('office') || lower.includes('client') || lower.includes('project')) {
    detectedCategory = 'Work';
  } else if (lower.includes('personal') || lower.includes('home') || lower.includes('family')) {
    detectedCategory = 'Personal';
  } else if (lower.includes('health') || lower.includes('gym') || lower.includes('fitness') || lower.includes('doctor') || lower.includes('workout')) {
    detectedCategory = 'Health';
  } else if (lower.includes('study') || lower.includes('read') || lower.includes('exam') || lower.includes('course')) {
    detectedCategory = 'Study';
  } else if (lower.includes('shopping') || lower.includes('buy') || lower.includes('grocery')) {
    detectedCategory = 'Shopping';
  } else if (lower.includes('finance') || lower.includes('bill') || lower.includes('pay') || lower.includes('money')) {
    detectedCategory = 'Finance';
  }

  // Status Extraction
  let detectedStatus: string | null = null;
  if (lower.includes('completed') || lower.includes('done') || lower.includes('finished')) {
    detectedStatus = 'completed';
  } else if (lower.includes('starred') || lower.includes('favorite') || lower.includes('flagged')) {
    detectedStatus = 'starred';
  } else if (lower.includes('active') || lower.includes('pending') || lower.includes('todo') || lower.includes('open')) {
    detectedStatus = 'active';
  }

  // Time Extraction
  let detectedTime: string | null = null;
  if (lower.includes('today')) {
    detectedTime = 'today';
  } else if (lower.includes('tomorrow')) {
    detectedTime = 'tomorrow';
  } else if (lower.includes('this week') || lower.includes('week')) {
    detectedTime = 'this_week';
  } else if (lower.includes('overdue') || lower.includes('late')) {
    detectedTime = 'overdue';
  }

  // Semantic Topic Matching
  const semanticTopics: string[] = [];
  Object.keys(SEMANTIC_DICTIONARY).forEach((topic) => {
    if (lower.includes(topic) || SEMANTIC_DICTIONARY[topic].some((syn) => lower.includes(syn))) {
      semanticTopics.push(topic);
    }
  });

  return {
    detectedCategory,
    detectedPriority,
    detectedStatus,
    detectedTime,
    semanticTopics
  };
};

/**
 * Executes AI Search across task collection with relevance scoring & reason generation.
 */
export const performAiSearch = (tasks: Task[], query: string): AiSearchResult => {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return {
      results: tasks.map((t) => ({ ...t, aiMatchScore: 100, aiMatchReason: 'Default view' })),
      queryBreakdown: {
        detectedCategory: null,
        detectedPriority: null,
        detectedStatus: null,
        detectedTime: null,
        semanticTopics: []
      },
      matchedCount: tasks.length
    };
  }

  const breakdown = parseNaturalQueryConstraints(query);
  const queryWords = cleanQuery
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  const scoredTasks: ScoredTask[] = tasks.map((task) => {
    let score = 0;
    const reasons: string[] = [];

    const titleLower = task.title.toLowerCase();
    const notesLower = (task.notes || '').toLowerCase();
    const catLower = (task.category || '').toLowerCase();

    // 1. Direct Substring / Word Matches (High Weight)
    if (titleLower === cleanQuery) {
      score += 60;
      reasons.push('Exact title match');
    } else if (titleLower.includes(cleanQuery)) {
      score += 45;
      reasons.push('Matches title query');
    } else {
      let wordMatches = 0;
      queryWords.forEach((word) => {
        if (titleLower.includes(word)) {
          wordMatches++;
        }
      });
      if (wordMatches > 0) {
        score += wordMatches * 15;
        reasons.push(`Title matches ${wordMatches} keyword${wordMatches > 1 ? 's' : ''}`);
      }
    }

    if (notesLower.includes(cleanQuery)) {
      score += 25;
      reasons.push('Matches notes text');
    }

    // Subtask Matches
    const matchingSubtasks = (task.subtasks || []).filter((s) => s.title.toLowerCase().includes(cleanQuery));
    if (matchingSubtasks.length > 0) {
      score += 20;
      reasons.push(`Matches ${matchingSubtasks.length} subtask${matchingSubtasks.length > 1 ? 's' : ''}`);
    }

    // 2. Category Match
    if (breakdown.detectedCategory && catLower === breakdown.detectedCategory.toLowerCase()) {
      score += 30;
      reasons.push(`Category: ${breakdown.detectedCategory}`);
    }

    // 3. Priority Match
    if (breakdown.detectedPriority && task.priority === breakdown.detectedPriority) {
      score += 30;
      reasons.push(`Priority: ${breakdown.detectedPriority.toUpperCase()}`);
    }

    // 4. Status Match
    if (breakdown.detectedStatus === 'completed' && task.completed) {
      score += 25;
      reasons.push('Status: Completed');
    } else if (breakdown.detectedStatus === 'active' && !task.completed) {
      score += 25;
      reasons.push('Status: Active');
    } else if (breakdown.detectedStatus === 'starred' && task.starred) {
      score += 25;
      reasons.push('Starred Task');
    }

    // 5. Time Target Match
    if (breakdown.detectedTime === 'today' && task.dueDate === todayStr) {
      score += 35;
      reasons.push('Due Today');
    } else if (breakdown.detectedTime === 'tomorrow' && task.dueDate === tomorrowStr) {
      score += 35;
      reasons.push('Due Tomorrow');
    } else if (breakdown.detectedTime === 'overdue' && task.dueDate && task.dueDate < todayStr && !task.completed) {
      score += 40;
      reasons.push('Overdue Task');
    }

    // 6. Semantic Topic Synonym Match
    breakdown.semanticTopics.forEach((topic) => {
      const synonyms = SEMANTIC_DICTIONARY[topic] || [];
      const hasTopicMatch =
        titleLower.includes(topic) ||
        notesLower.includes(topic) ||
        synonyms.some((syn) => titleLower.includes(syn) || notesLower.includes(syn));

      if (hasTopicMatch) {
        score += 25;
        reasons.push(`Semantic match for '${topic}'`);
      }
    });

    const finalScore = Math.min(100, score);
    const reasonText = reasons.length > 0 ? reasons.join(' • ') : 'Partial relevance';

    return {
      ...task,
      aiMatchScore: finalScore,
      aiMatchReason: reasonText
    };
  });

  // Filter tasks with score > 0 or matching at least one constraint
  const filtered = scoredTasks
    .filter((t) => t.aiMatchScore > 0)
    .sort((a, b) => b.aiMatchScore - a.aiMatchScore);

  return {
    results: filtered,
    queryBreakdown: breakdown,
    matchedCount: filtered.length
  };
};
