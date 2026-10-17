import { skillNormalizer, ParsedJobSkills } from './skillNormalizer';

export interface LLMJobParsingResult {
  requiredSkills: string[];
  preferredSkills: string[];
}

export interface EnrichedParsedJobSkills extends ParsedJobSkills {
  isLLM: boolean;
  rawResult?: LLMJobParsingResult;
}

export class LLMAssistService {
  private endpoint = 'https://openrouter.ai/api/v1/chat/completions';

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && !key.startsWith('placeholder'));
  }

  private getApiKey(): string {
    return (
      import.meta.env.VITE_OPENROUTER_API_KEY ||
      ''
    );
  }

  public async parseJobDescriptionWithLLM(
    jdText: string,
    jobId?: string
  ): Promise<EnrichedParsedJobSkills> {
    const key = this.getApiKey();

    if (!key || key.startsWith('placeholder')) {
      const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      return { ...fallback, isLLM: false };
    }

    try {
      const prompt = `You are a technical recruiter assisting an evidence-based placement hub.
Analyze the following Job Description (JD) and extract the required and preferred technical skills.
Output ONLY valid JSON with this exact schema (no markdown, no backticks):
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill3"]
}

Job Description:
${jdText}`;

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': origin,
          'X-Title': 'ProofHire Placement Hub',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
        return { ...fallback, isLLM: false };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
        return { ...fallback, isLLM: false };
      }

      const parsed: LLMJobParsingResult = JSON.parse(content);
      const normalized = skillNormalizer.parseJobSkills({
        jobId,
        requiredList: parsed.requiredSkills || [],
        preferredList: parsed.preferredSkills || [],
        requiredText: jdText,
      });

      return {
        ...normalized,
        isLLM: true,
        rawResult: parsed,
      };
    } catch {
      const fallback = skillNormalizer.parseJobSkills({ jobId, requiredText: jdText });
      return { ...fallback, isLLM: false };
    }
  }

  public async tailorResumeSummaryWithLLM(
    jobTitle: string,
    company: string,
    skills: string[],
    studentName: string = 'Alex Morgan'
  ): Promise<string> {
    const key = this.getApiKey();
    const skillsListStr = skills.length > 0 ? skills.join(', ') : 'modern software engineering principles';

    if (!key || key.startsWith('placeholder')) {
      return `Final-year Computer Science undergraduate with verified practical competencies in ${skillsListStr}. Seeking to contribute to ${company}'s ${jobTitle} initiatives with demonstrated software engineering benchmarks.`;
    }

    try {
      const prompt = `You are a professional technical career advisor for an evidence-based placement portal.
Write a concise, high-impact ATS professional summary (2 to 3 sentences maximum, under 65 words) for student "${studentName}".
Target Role: ${jobTitle} at ${company}.
Verified technical skills demonstrated in coursework and proctored projects: ${skillsListStr}.
Tone: Professional, confident, factual, and strictly focused on demonstrated competence.
Do not use hyperbolic fluff. Return ONLY the plain text summary, no quotes, no conversational filler.`;

      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': origin,
          'X-Title': 'ProofHire Placement Hub',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter returned status ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
      throw new Error('Empty response from model');
    } catch (err) {
      console.warn('Fallback to standard summary:', err);
      return `Final-year Computer Science undergraduate with verified practical competencies in ${skillsListStr}. Seeking to contribute to ${company}'s ${jobTitle} initiatives with demonstrated software engineering benchmarks.`;
    }
  }

  public async generateSkillAssessmentWithLLM(skillName: string): Promise<{
    title: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
    }>;
  }> {
    const key = this.getApiKey();
    if (key && !key.startsWith('placeholder')) {
      try {
        const prompt = `You are a technical benchmark architect for an engineering placement assessment platform.
Generate 4 rigorous multiple-choice questions (MCQs) for the technical skill: "${skillName}".
Each question must test practical engineering understanding, have 4 realistic options, and a correctIndex (0, 1, 2, or 3).
Output ONLY valid raw JSON with this exact schema (no markdown, no backticks, no comments):
{
  "title": "${skillName} Core Competency & Architectural Benchmark",
  "questions": [
    {
      "id": "q1",
      "question": "Clear technical question text",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctIndex": 0
    }
  ]
}`;

        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': origin,
            'X-Title': 'ProofHire Placement Hub',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const raw = data.choices?.[0]?.message?.content?.trim();
          if (raw) {
            const cleanJson = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (Array.isArray(parsed.questions) && parsed.questions.length >= 3) {
              return {
                title: parsed.title || `${skillName} Core Competency & Architectural Benchmark`,
                questions: parsed.questions,
              };
            }
          }
        }
      } catch (e) {
        // Fallback gracefully on timeout or network error
      }
    }

    // High quality deterministic fallback generator for any skill
    return this.getFallbackAssessmentForSkill(skillName);
  }

  private getFallbackAssessmentForSkill(skillName: string): {
    title: string;
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctIndex: number;
    }>;
  } {
    const s = skillName.toLowerCase();

    if (s.includes('react')) {
      return {
        title: 'React Fundamentals & Component Architecture',
        questions: [
          {
            id: 'q1',
            question: 'What React hook is recommended to run synchronous side-effects before the browser paints?',
            options: ['useMemo', 'useLayoutEffect', 'useEffect', 'useCallback'],
            correctIndex: 1,
          },
          {
            id: 'q2',
            question: 'What is the primary role of keys during the reconciliation algorithm in React lists?',
            options: [
              'To bind CSS styles dynamically',
              'To identify which elements were added, removed, or modified across renders',
              'To serialize DOM state to local storage',
              'To trigger child re-renders unconditionally',
            ],
            correctIndex: 1,
          },
          {
            id: 'q3',
            question: 'How does React 18 manage state batching across asynchronous boundaries?',
            options: [
              'Automatic batching executes across timeouts, promises, and native event handlers',
              'Updates are never batched outside synthetic event listeners',
              'Batching must be explicitly wrapped in unstable_batchedUpdates',
              'Only synchronous updates are combined',
            ],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'Which of the following optimizes pure child component renders against unnecessary parent updates?',
            options: ['React.memo with pure prop comparison', 'useId', 'useTransition', 'useImperativeHandle'],
            correctIndex: 0,
          },
        ],
      };
    }

    if (s.includes('node') || s.includes('express')) {
      return {
        title: 'Node.js Core Architecture & Asynchronous I/O',
        questions: [
          {
            id: 'q1',
            question: 'Which phase of the Node.js event loop executes setImmediate() callbacks?',
            options: ['Timers phase', 'Pending I/O callbacks', 'Poll phase', 'Check phase'],
            correctIndex: 3,
          },
          {
            id: 'q2',
            question: 'What is the primary advantage of utilizing Node.js Streams over fs.readFile?',
            options: [
              'Enables cryptographic hashing automatically',
              'Processes chunks sequentially without buffering entire file data in heap RAM',
              'Executes file operations across multi-core workers without thread pools',
              'Converts async callbacks to synchronized promises automatically',
            ],
            correctIndex: 1,
          },
          {
            id: 'q3',
            question: 'In modern Node.js versions, what is the default behavior when an unhandled promise rejection occurs?',
            options: [
              'The process terminates with a non-zero exit code (SIGABRT)',
              'The error is silently suppressed',
              'Execution retries 3 times before warning',
              'A warning is printed but the runtime continues uninterrupted',
            ],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'Which core module is utilized to scale Node.js processes across multi-core CPUs by forking child processes?',
            options: ['cluster', 'child_process.execSync', 'vm', 'worker_threads alone'],
            correctIndex: 0,
          },
        ],
      };
    }

    if (s.includes('python')) {
      return {
        title: 'Python Engineering & Concurrency Architecture',
        questions: [
          {
            id: 'q1',
            question: 'What is the function of the Global Interpreter Lock (GIL) in CPython?',
            options: [
              'Prevents circular imports at compile time',
              'Ensures thread-safe memory management by allowing only one native thread to execute bytecode at a time',
              'Encrypts compiled .pyc bytecode in memory',
              'Forces garbage collection at regular time intervals',
            ],
            correctIndex: 1,
          },
          {
            id: 'q2',
            question: 'What is the primary operational difference between a generator function and a list comprehension?',
            options: [
              'Generators evaluate lazily yielding items on-demand, reducing memory consumption',
              'Generators can only hold primitive string types',
              'List comprehensions execute asynchronously in worker threads',
              'Generators cannot be iterated using a for loop',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: 'Which built-in library module provides native asynchronous event loop primitives in Python 3.7+?',
            options: ['threading', 'asyncio', 'multiprocessing', 'concurrent.futures'],
            correctIndex: 1,
          },
          {
            id: 'q4',
            question: 'In Python dictionary implementation, how are average case lookups guaranteed in O(1) time?',
            options: [
              'Binary search trees',
              'Hash table with open addressing and compact array indexing',
              'Doubly linked lists',
              'Radix tree nodes',
            ],
            correctIndex: 1,
          },
        ],
      };
    }

    if (s.includes('type') || s.includes('ts')) {
      return {
        title: 'TypeScript Type Systems & Advanced Generics',
        questions: [
          {
            id: 'q1',
            question: 'What does the `never` type represent in TypeScript?',
            options: [
              'A value that can be assigned null or undefined',
              'Values that never occur, such as a function that always throws an error or never returns',
              'Any type that hasn’t been resolved yet by the compiler',
              'An alias for Object.freeze()',
            ],
            correctIndex: 1,
          },
          {
            id: 'q2',
            question: 'What is the difference between `type` and `interface` regarding declaration merging in TypeScript?',
            options: [
              'Interfaces with the same name automatically merge declarations, while types cannot be redeclared',
              'Types merge declarations automatically while interfaces throw duplicate identifier errors',
              'Both merge identical definitions seamlessly',
              'Neither supports declaration extension',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: 'Which utility type constructs a type with all properties of T set to optional?',
            options: ['Required<T>', 'Partial<T>', 'Readonly<T>', 'Record<string, T>'],
            correctIndex: 1,
          },
          {
            id: 'q4',
            question: 'How do Discriminated Unions enable type narrowing in TypeScript?',
            options: [
              'By utilizing a common literal property present across all variant types',
              'By casting runtime types with the `any` keyword',
              'By verifying prototype inheritance chains via instanceof',
              'By declaring generic constraints with `extends unknown`',
            ],
            correctIndex: 0,
          },
        ],
      };
    }

    // Universal high-quality engineering benchmark for any skill
    return {
      title: `${skillName} Practical Engineering Assessment`,
      questions: [
        {
          id: 'q1',
          question: `In modern production applications, what is the best practice for managing state and lifecycle events in ${skillName}?`,
          options: [
            'Encapsulating pure logic into decoupled, testable modular units',
            'Storing mutable state globally across unindexed variables',
            'Suppressing error reporting in production builds',
            'Executing heavy blocking operations synchronously on the main thread',
          ],
          correctIndex: 0,
        },
        {
          id: 'q2',
          question: `What is the recommended approach for optimizing throughput and reducing resource latency when deploying ${skillName}?`,
          options: [
            'Implementing proactive caching, asynchronous execution, and horizontal scaling',
            'Allocating maximum heap memory without monitoring GC pauses',
            'Disabling connection pooling in relational databases',
            'Increasing request timeout thresholds indefinitely',
          ],
          correctIndex: 0,
        },
        {
          id: 'q3',
          question: `How should unhandled runtime exceptions and network timeouts be handled in ${skillName} services?`,
          options: [
            'Catching exceptions at boundaries, logging structured telemetry, and gracefully failing or retrying with backoff',
            'Silently swallowing errors to prevent crash logs',
            'Terminating the host server immediately upon every single network timeout',
            'Re-throwing raw exceptions directly to end users without sanitization',
          ],
          correctIndex: 0,
        },
        {
          id: 'q4',
          question: `Which architectural pattern provides optimal security and maintainability for ${skillName} integrations?`,
          options: [
            'Strict input validation, parameterized queries, and environment variable credential segregation',
            'Hardcoding secrets directly into client-side build bundles',
            'Disabling CORS and authentication headers to ease client connectivity',
            'Trusting all incoming user payloads without schema verification',
          ],
          correctIndex: 0,
        },
      ],
    };
  }
}

export const llmAssistService = new LLMAssistService();

