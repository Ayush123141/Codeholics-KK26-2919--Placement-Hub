export interface CanonicalSkill {
  id: string;
  name: string;
  category: string;
  aliases: string[];
  description?: string;
}

export const CANONICAL_SKILLS: CanonicalSkill[] = [
  {
    id: 'skill-react',
    name: 'React',
    category: 'frontend',
    aliases: ['react', 'reactjs', 'react.js', 'react-js', 'react framework'],
    description: 'Declarative component-based frontend library'
  },
  {
    id: 'skill-nodejs',
    name: 'Node.js',
    category: 'backend',
    aliases: ['node', 'nodejs', 'node.js', 'node js'],
    description: 'JavaScript runtime built on Chrome V8 engine'
  },
  {
    id: 'skill-typescript',
    name: 'TypeScript',
    category: 'languages',
    aliases: ['typescript', 'ts'],
    description: 'Typed superset of JavaScript'
  },
  {
    id: 'skill-javascript',
    name: 'JavaScript',
    category: 'languages',
    aliases: ['javascript', 'js', 'es6', 'ecmascript'],
    description: 'Core web scripting language'
  },
  {
    id: 'skill-python',
    name: 'Python',
    category: 'languages',
    aliases: ['python', 'py', 'python3'],
    description: 'High-level versatile programming language'
  },
  {
    id: 'skill-postgres',
    name: 'PostgreSQL',
    category: 'database',
    aliases: ['postgresql', 'postgres', 'psql', 'postgres db'],
    description: 'Advanced open-source relational database'
  },
  {
    id: 'skill-mongodb',
    name: 'MongoDB',
    category: 'database',
    aliases: ['mongodb', 'mongo', 'nosql mongodb'],
    description: 'Document-oriented NoSQL database'
  },
  {
    id: 'skill-docker',
    name: 'Docker',
    category: 'devops',
    aliases: ['docker', 'containerization', 'docker engine', 'docker-compose'],
    description: 'Container management platform'
  },
  {
    id: 'skill-express',
    name: 'Express',
    category: 'backend',
    aliases: ['express', 'express.js', 'expressjs'],
    description: 'Fast, unopinionated minimalist web framework for Node'
  },
  {
    id: 'skill-nextjs',
    name: 'Next.js',
    category: 'frontend',
    aliases: ['nextjs', 'next.js', 'next'],
    description: 'Full-stack React framework'
  },
  {
    id: 'skill-git',
    name: 'Git',
    category: 'devops',
    aliases: ['git', 'version control', 'github'],
    description: 'Distributed version control system'
  },
  {
    id: 'skill-rest-api',
    name: 'REST API',
    category: 'backend',
    aliases: ['rest', 'rest api', 'restful', 'restful apis', 'rest apis'],
    description: 'Representational State Transfer web services'
  },
  {
    id: 'skill-graphql',
    name: 'GraphQL',
    category: 'backend',
    aliases: ['graphql', 'gql'],
    description: 'Data query and manipulation language for APIs'
  },
  {
    id: 'skill-redis',
    name: 'Redis',
    category: 'database',
    aliases: ['redis', 'redis cache'],
    description: 'In-memory data structure store used as a database and cache'
  },
  {
    id: 'skill-tailwind',
    name: 'Tailwind CSS',
    category: 'frontend',
    aliases: ['tailwind', 'tailwindcss', 'tailwind-css'],
    description: 'Utility-first CSS framework'
  }
];

export function getCanonicalSkillById(id: string): CanonicalSkill | undefined {
  return CANONICAL_SKILLS.find((s) => s.id.toLowerCase() === id.toLowerCase());
}

export function getAllCanonicalSkills(): CanonicalSkill[] {
  return [...CANONICAL_SKILLS];
}
