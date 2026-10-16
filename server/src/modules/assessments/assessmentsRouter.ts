import { Router, Request, Response } from 'express';

export interface AssessmentQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number; // 0-indexed
}

export interface AssessmentDefinition {
  id: string;
  skillId: string;
  title: string;
  version: string;
  questions: AssessmentQuestion[];
}

export interface AssessmentAttempt {
  id: string;
  studentId: string;
  assessmentId: string;
  skillId: string;
  version: string;
  answers: number[]; // chosen indices
  score: number; // 0 - 100
  passed: boolean;
  completedAt: string;
}

export interface ProjectEvaluationRubric {
  id: string;
  projectId: string;
  studentId: string;
  skillIds: string[];
  projectName: string;
  repoUrl?: string;
  reviewer: string;
  criteria: {
    architecture: number; // 0 - 25
    codeQuality: number;  // 0 - 25
    testCoverage: number; // 0 - 25
    skillDemonstration: number; // 0 - 25
  };
  totalScore: number; // 0 - 100
  rationale: string;
  evaluatedAt: string;
}

// Built-in MCQ questions for core skills
export const ASSESSMENT_DEFINITIONS: AssessmentDefinition[] = [
  {
    id: 'assess-react-v1',
    skillId: 'skill-react',
    title: 'React Fundamentals & Component Architecture',
    version: '1.0',
    questions: [
      {
        id: 'q1',
        question: 'What hook is used to run side effects in a function component?',
        options: ['useMemo', 'useEffect', 'useState', 'useRef'],
        correctOptionIndex: 1,
      },
      {
        id: 'q2',
        question: 'What is the primary purpose of keys in React lists?',
        options: [
          'To style DOM elements uniquely',
          'To identify which items have changed, been added, or removed for reconciliation',
          'To pass props between siblings',
          'To bind event handlers automatically',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'q3',
        question: 'How does React handle state batching in React 18+?',
        options: [
          'Only synchronous events inside React handlers are batched',
          'State updates are never batched',
          'Automatic batching applies across promises, setTimeout, and native event handlers',
          'Batching must be manually enabled via unstable_batchedUpdates',
        ],
        correctOptionIndex: 2,
      },
      {
        id: 'q4',
        question: 'Which of the following creates an unmodifiable memoized callback?',
        options: ['useMemo', 'useCallback', 'useReducer', 'useLayoutEffect'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'assess-nodejs-v1',
    skillId: 'skill-nodejs',
    title: 'Node.js Core Architecture & Asynchronous I/O',
    version: '1.0',
    questions: [
      {
        id: 'q1',
        question: 'Which phase of the Node.js event loop executes setImmediate() callbacks?',
        options: ['Timers', 'Pending callbacks', 'Poll', 'Check'],
        correctOptionIndex: 3,
      },
      {
        id: 'q2',
        question: 'What is the main benefit of Node.js Streams?',
        options: [
          'Encrypting data at rest',
          'Processing large chunks of data piece-by-piece without buffering everything in RAM',
          'Enabling multi-threading without worker_threads',
          'Converting callbacks into Promises automatically',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'q3',
        question: 'What happens if an unhandled promise rejection occurs in modern Node.js?',
        options: [
          'It is silently ignored',
          'The process terminates with a non-zero exit code by default',
          'It retries the operation 3 times',
          'It pauses execution indefinitely',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'assess-postgres-v1',
    skillId: 'skill-postgres',
    title: 'PostgreSQL Relational Design & Indexing',
    version: '1.0',
    questions: [
      {
        id: 'q1',
        question: 'Which default index type is created for B-tree in PostgreSQL?',
        options: ['GIN', 'BRIN', 'B-tree', 'Hash'],
        correctOptionIndex: 2,
      },
      {
        id: 'q2',
        question: 'What does the EXPLAIN ANALYZE command do in Postgres?',
        options: [
          'Optimizes indexes automatically',
          'Executes the statement and shows actual runtime statistics alongside the query plan',
          'Dry-runs the statement without executing it',
          'Reindexes the table',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
];

// In-memory store for demo assessment attempts and evaluations
export const assessmentAttemptsStore: AssessmentAttempt[] = [];
export const projectEvaluationsStore: ProjectEvaluationRubric[] = [];

export const assessmentsRouter = Router();

// GET /api/assessments - List available assessments (without exposing correct answer indices)
assessmentsRouter.get('/', (_req: Request, res: Response) => {
  const sanitized = ASSESSMENT_DEFINITIONS.map((def) => ({
    id: def.id,
    skillId: def.skillId,
    title: def.title,
    version: def.version,
    questionCount: def.questions.length,
    questions: def.questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    })),
  }));

  res.json({ success: true, count: sanitized.length, assessments: sanitized });
});

// POST /api/assessments/submit - Submit answers and auto-grade
assessmentsRouter.post('/submit', (req: Request, res: Response) => {
  const { studentId, assessmentId, answers } = req.body;

  if (!studentId || !assessmentId || !Array.isArray(answers)) {
    return res.status(400).json({
      success: false,
      error: 'Required fields: studentId, assessmentId, answers (array of option indices)',
    });
  }

  const def = ASSESSMENT_DEFINITIONS.find((a) => a.id === assessmentId);
  if (!def) {
    return res.status(404).json({ success: false, error: 'Assessment definition not found' });
  }

  let correctCount = 0;
  def.questions.forEach((q, idx) => {
    if (answers[idx] === q.correctOptionIndex) {
      correctCount++;
    }
  });

  const score = Math.round((correctCount / def.questions.length) * 100);
  const passed = score >= 70;

  const attempt: AssessmentAttempt = {
    id: `attempt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    studentId,
    assessmentId: def.id,
    skillId: def.skillId,
    version: def.version,
    answers,
    score,
    passed,
    completedAt: new Date().toISOString(),
  };

  assessmentAttemptsStore.push(attempt);

  return res.json({
    success: true,
    attempt: {
      id: attempt.id,
      studentId: attempt.studentId,
      assessmentId: attempt.assessmentId,
      skillId: attempt.skillId,
      score: attempt.score,
      passed: attempt.passed,
      completedAt: attempt.completedAt,
    },
    message: passed ? 'Assessment Passed! Credited to evidence.' : 'Assessment Completed.',
  });
});

// GET /api/assessments/student/:studentId - Get assessment attempts for a student
assessmentsRouter.get('/student/:studentId', (req: Request, res: Response) => {
  const studentAttempts = assessmentAttemptsStore.filter(
    (a) => a.studentId === req.params.studentId
  );
  res.json({ success: true, count: studentAttempts.length, attempts: studentAttempts });
});

// POST /api/assessments/project-eval - Submit a project evaluation rubric
assessmentsRouter.post('/project-eval', (req: Request, res: Response) => {
  const { studentId, projectId, skillIds, projectName, repoUrl, reviewer, criteria, rationale } = req.body;

  if (!studentId || !projectName || !reviewer || !criteria) {
    return res.status(400).json({
      success: false,
      error: 'Missing required project evaluation fields.',
    });
  }

  const arch = Math.min(25, Math.max(0, criteria.architecture || 0));
  const code = Math.min(25, Math.max(0, criteria.codeQuality || 0));
  const test = Math.min(25, Math.max(0, criteria.testCoverage || 0));
  const demo = Math.min(25, Math.max(0, criteria.skillDemonstration || 0));
  const totalScore = arch + code + test + demo;

  const evalRecord: ProjectEvaluationRubric = {
    id: `eval-${Date.now()}`,
    projectId: projectId || `proj-${Date.now()}`,
    studentId,
    skillIds: Array.isArray(skillIds) ? skillIds : [],
    projectName,
    repoUrl,
    reviewer,
    criteria: {
      architecture: arch,
      codeQuality: code,
      testCoverage: test,
      skillDemonstration: demo,
    },
    totalScore,
    rationale: rationale || 'Comprehensive rubric evaluation completed.',
    evaluatedAt: new Date().toISOString(),
  };

  projectEvaluationsStore.push(evalRecord);

  return res.status(201).json({
    success: true,
    evaluation: evalRecord,
  });
});
