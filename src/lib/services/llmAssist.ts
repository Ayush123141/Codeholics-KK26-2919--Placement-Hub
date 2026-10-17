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

    // 1. REACT ARCHITECTURE & TRICKY CODE SNIPPETS
    if (s.includes('react')) {
      return {
        title: 'React Internals, Reconciliation & Concurrency Benchmark',
        questions: [
          {
            id: 'q1',
            question: `Analyze this React component with an asynchronous timer:
\`\`\`javascript
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <h1>{count}</h1>;
}
\`\`\`
What value is rendered in <h1> after 5 seconds elapsed?`,
            options: [
              'It renders 1 because the closure captured the initial count (0) on mount and never refreshed it',
              'It renders 5 because setInterval increments count by 1 every second',
              'It renders NaN because state mutations in setInterval are rejected by React',
              'It causes an infinite re-render loop crashing the browser window',
            ],
            correctIndex: 0,
          },
          {
            id: 'q2',
            question: `In React 18, consider the following button click handler executing after an async await:
\`\`\`javascript
const handleClick = async () => {
  await fetchUserData();
  setCount(c => c + 1);
  setLoading(false);
};
\`\`\`
How many component re-renders occur when \`handleClick\` completes?`,
            options: [
              'Exactly 1 re-render, because React 18 automatic batching groups all state updates even across async boundaries',
              '2 re-renders, because automatic batching is disabled outside synchronous event handlers',
              '0 re-renders until flushSync() is explicitly triggered',
              '3 re-renders due to React StrictMode re-invocations in development',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: `Why does wrapping a child component in \`React.memo\` fail to prevent re-renders when passed this prop?
\`\`\`jsx
<DataViewer options={{ filterActive: true }} onSelect={item => handleSelect(item)} />
\`\`\``,
            options: [
              'Because object literals and arrow functions create fresh memory references on every parent render, failing shallow reference equality (Object.is)',
              'React.memo only works with class components and ignores functional props',
              'React.memo requires DOM refs instead of JavaScript objects',
              'Arrow functions trigger synthetic unmounting in children',
            ],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'What is the exact behavioral difference between `useLayoutEffect` and `useEffect` in the browser lifecycle?',
            options: [
              'useLayoutEffect runs synchronously immediately after DOM mutations before browser paint; useEffect fires asynchronously after paint',
              'useEffect runs on the server; useLayoutEffect runs exclusively on mobile web views',
              'useLayoutEffect cannot access DOM references; useEffect has direct access to document.body',
              'useEffect blocks the browser UI thread until all child network requests resolve',
            ],
            correctIndex: 0,
          },
        ],
      };
    }

    // 2. CLOUD, DEVOPS, DOCKER & KUBERNETES
    if (s.includes('cloud') || s.includes('devops') || s.includes('docker') || s.includes('kubernetes') || s.includes('aws')) {
      return {
        title: 'Cloud Infrastructure, Containers & DevOps Reliability',
        questions: [
          {
            id: 'q1',
            question: `Examine this multi-stage Dockerfile configuration:
\`\`\`dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
\`\`\`
Why is \`COPY package*.json ./\` intentionally executed before \`COPY . .\`?`,
            options: [
              'To utilize Docker layer caching: npm ci only re-executes if dependencies change, speeding up subsequent builds',
              'Because npm ci cannot resolve directory structures unless package.json is cloned alone',
              'To automatically strip devDependencies before source code compilation',
              'To prevent root access permissions inside the builder container image',
            ],
            correctIndex: 0,
          },
          {
            id: 'q2',
            question: 'What happens in a container when a Node.js process runs as PID 1 without an init process (e.g., tini / dumb-init) upon receiving a SIGTERM signal from Kubernetes?',
            options: [
              'The process ignores the default SIGTERM signal because Linux kernel grants special immunity to PID 1, leading to forceful SIGKILL after termination grace period',
              'The container crashes instantly without running any code',
              'Kubernetes immediately reroutes traffic to fallback pods with zero delay',
              'The Linux kernel automatically cleans up child zombie processes without daemon help',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: 'In Kubernetes Pod health monitoring, what is the crucial difference between a Readiness Probe and a Liveness Probe?',
            options: [
              'Failing a Readiness Probe removes the Pod from Service endpoints without killing it; failing a Liveness Probe causes kubelet to terminate and restart the container',
              'Readiness probes execute once on boot; Liveness probes run only during network partitions',
              'Readiness probes only check HTTP ports; Liveness probes only test disk storage',
              'Both probes terminate the pod and delete its persistent volume claim immediately',
            ],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'Which deployment strategy routes a small percentage of real production traffic (e.g. 5%) to a newly deployed version before rolling out to 100% of the fleet?',
            options: [
              'Canary Deployment with Ingress weighted routing',
              'Big Bang Deployment with immediate DNS cutover',
              'Shadow Mirroring without network responses',
              'Blue/Green switchover with instantaneous load balancer swap',
            ],
            correctIndex: 0,
          },
        ],
      };
    }

    // 3. TYPESCRIPT TYPE SYSTEM & TRICKY CODE SNIPPETS
    if (s.includes('type') || s.includes('ts')) {
      return {
        title: 'TypeScript Type Systems & Advanced Generics',
        questions: [
          {
            id: 'q1',
            question: `Analyze this conditional type in TypeScript:
\`\`\`typescript
type ToArray<T> = T extends any ? T[] : never;
type Result = ToArray<string | number>;
\`\`\`
What is the resolved type of \`Result\`?`,
            options: [
              'string[] | number[] (Naked type parameters distribute across union members)',
              '(string | number)[]',
              'never[]',
              'unknown[]',
            ],
            correctIndex: 0,
          },
          {
            id: 'q2',
            question: `What compile-time error occurs in this TypeScript snippet?
\`\`\`typescript
interface Config {
  [key: string]: string;
  port: number;
}
\`\`\``,
            options: [
              'An index signature property type must be assignable to all other explicit property types (port: number violates string index)',
              'Interfaces cannot contain numeric properties',
              'String index signatures cannot be used alongside explicit keys',
              'TypeScript requires all interface properties to be optional',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: 'Which utility type constructs a type by extracting all properties of type T that are assignable to U?',
            options: ['Extract<T, U>', 'Omit<T, U>', 'Pick<T, Keys>', 'Exclude<T, U>'],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'What is the purpose of the `satisfies` operator introduced in TypeScript 4.9?',
            options: [
              'It validates that an expression matches a type contract without widening or losing the specific inferred literal types',
              'It casts any variable to `any` while silencing ESLint warnings',
              'It generates runtime type guards in compiled JavaScript',
              'It creates an immutable frozen copy of an object prototype',
            ],
            correctIndex: 0,
          },
        ],
      };
    }

    // 4. PYTHON ADVANCED ENGINEERING & TRICKY CODE SNIPPETS
    if (s.includes('python')) {
      return {
        title: 'Python Core Mechanics, Memory & Concurrency',
        questions: [
          {
            id: 'q1',
            question: `What is printed by executing this Python script with default arguments?
\`\`\`python
def append_item(val, items=[]):
    items.append(val)
    return items

list1 = append_item(10)
list2 = append_item(20, [])
list3 = append_item(30)
print(list1, list3)
\`\`\``,
            options: [
              '[10, 30] [10, 30] (Default arguments are evaluated once at function definition time and shared across invocations)',
              '[10] [30]',
              '[10, 20, 30] [10, 20, 30]',
              'TypeError: Cannot mutate static function parameter list',
            ],
            correctIndex: 0,
          },
          {
            id: 'q2',
            question: `Consider this closure with late binding in Python:
\`\`\`python
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])
\`\`\`
What is the resulting output?`,
            options: [
              '[2, 2, 2] (Variables in Python closures are looked up when the inner function is called, finding the final loop value of i)',
              '[0, 1, 2]',
              '[0, 0, 0]',
              '[3, 3, 3]',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: 'Why does Python `a is b` evaluate to True for `a = 256; b = 256`, but False for `a = 257; b = 257` in an interactive shell session?',
            options: [
              'CPython pre-allocates and caches an internal singleton array for small integers between -5 and 256',
              'Integers greater than 256 are converted to 64-bit IEEE floating-point numbers',
              'The is operator checks mathematical equality only for prime numbers',
              'Integers above 256 require explicit bitwise hashing before memory allocation',
            ],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'What is the operational effect of calling a synchronous, blocking function (like `time.sleep(5)`) inside an `asyncio` coroutine?',
            options: [
              'It blocks the single OS thread running the event loop, freezing all concurrent coroutines for 5 seconds',
              'Python automatically offloads the blocking call to a background OS thread pool',
              'The event loop yields execution automatically to other async tasks',
              'An AsyncBlockedWarning exception is raised at runtime',
            ],
            correctIndex: 0,
          },
        ],
      };
    }

    // 5. NODE.JS & ASYNCHRONOUS I/O
    if (s.includes('node') || s.includes('express') || s.includes('backend')) {
      return {
        title: 'Node.js Core Architecture & Asynchronous I/O',
        questions: [
          {
            id: 'q1',
            question: `What is the exact output sequence of this Node.js script?
\`\`\`javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
process.nextTick(() => console.log('4'));
console.log('5');
\`\`\``,
            options: [
              '1, 5, 4, 3, 2 (Synchronous stack finishes, then process.nextTick microtask queue, then Promise microtask queue, then Timer macrotask)',
              '1, 2, 3, 4, 5',
              '1, 5, 3, 4, 2',
              '1, 5, 2, 4, 3',
            ],
            correctIndex: 0,
          },
          {
            id: 'q2',
            question: 'What is the primary advantage of utilizing Node.js Streams over fs.readFile when handling large data payloads?',
            options: [
              'Streams process chunks sequentially without buffering the entire payload in heap memory, preventing Out-Of-Memory crashes',
              'Streams compress files automatically using GZIP before transmission',
              'Streams execute operations in separate worker threads by default',
              'Streams bypass file system security permissions',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: 'When `stream.write(chunk)` returns `false`, what should the producing code do to prevent memory bloat?',
            options: [
              'Pause writes and wait for the `drain` event before writing further data (handling backpressure)',
              'Immediately retry writing the chunk in a while loop',
              'Close the stream connection with stream.destroy()',
              'Increase V8 max old space size programmatically',
            ],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'Which phase of the Node.js event loop executes `setImmediate()` callbacks?',
            options: ['Check phase', 'Timers phase', 'Poll phase', 'Pending callbacks phase'],
            correctIndex: 0,
          },
        ],
      };
    }

    // 6. DATABASES & POSTGRESQL ARCHITECTURE
    if (s.includes('postgres') || s.includes('sql') || s.includes('database') || s.includes('db')) {
      return {
        title: 'PostgreSQL Architecture, Transactions & Indexing',
        questions: [
          {
            id: 'q1',
            question: `Consider a composite index defined on \`CREATE INDEX idx_users ON users (company_id, created_at, status)\`.
Which query CANNOT efficiently leverage this index for lookups?`,
            options: [
              'SELECT * FROM users WHERE created_at = $1 AND status = $2 (Missing leading column company_id)',
              'SELECT * FROM users WHERE company_id = $1 AND created_at = $2',
              'SELECT * FROM users WHERE company_id = $1',
              'SELECT * FROM users WHERE company_id = $1 ORDER BY created_at ASC',
            ],
            correctIndex: 0,
          },
          {
            id: 'q2',
            question: 'How does PostgreSQL implement Multi-Version Concurrency Control (MVCC) without table read locks?',
            options: [
              'Updates create new tuple versions with xmin/xmax transaction visibility IDs rather than overwriting rows in-place',
              'It stores all updates in temporary in-memory Redis buffers',
              'It locks the entire table schema during every SELECT query',
              'It converts all queries into sequential single-threaded write operations',
            ],
            correctIndex: 0,
          },
          {
            id: 'q3',
            question: 'What is the phenomenon called when Transaction A queries a row set, Transaction B inserts new rows matching the criteria and commits, and Transaction A sees the new rows upon re-querying in Read Committed mode?',
            options: ['Phantom Read', 'Dirty Read', 'Lost Update', 'Write Skew'],
            correctIndex: 0,
          },
          {
            id: 'q4',
            question: 'Why is `VACUUM` periodic maintenance required in production PostgreSQL databases?',
            options: [
              'To reclaim storage occupied by dead tuples generated by UPDATE/DELETE operations and prevent transaction ID wraparound',
              'To recompile PL/pgSQL stored procedures into native machine code',
              'To invalidate Redis cache entries and restart database processes',
              'To encrypt tablespace disks with rotating keys',
            ],
            correctIndex: 0,
          },
        ],
      };
    }

    // Universal high-quality engineering benchmark for any other skill
    return {
      title: `${skillName} Practical Engineering Assessment`,
      questions: [
        {
          id: 'q1',
          question: `In production software architecture, what is the best practice for managing state and lifecycle events in ${skillName}?`,
          options: [
            'Encapsulating pure logic into decoupled, testable modular units with verifiable boundaries',
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
            'Implementing proactive caching, asynchronous non-blocking execution, and horizontal scaling',
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
            'Catching exceptions at boundaries, logging structured telemetry, and gracefully failing or retrying with exponential backoff',
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

