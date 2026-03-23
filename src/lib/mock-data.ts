export const sampleCode = "";

export const fixedCode = `async function fetchUserData(userId: string): Promise<User | null> {
  try {
    const response = await fetch(\`/api/users/\${userId}\`);
    
    if (response.ok) {
      const user: User = await response.json();
      console.log(user.name);
      return user;
    } else {
      console.error(\`Error fetching user: \${response.status}\`);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
}

function processItems(items: Item[]): Item[] {
  return items.map(item => ({
    ...item,
    processed: item.active ? true : item.processed,
  }));
}`;

export interface ReviewFeedback {
  id: string;
  type: "error" | "warning" | "suggestion";
  line: number;
  title: string;
  description: string;
  code?: string;
}

export const mockReviewFeedback: ReviewFeedback[] = [
  {
    id: "1",
    type: "error",
    line: 2,
    title: "Missing await on async operation",
    description: "fetch() returns a Promise. Without await, 'data' holds a Promise object, not the response. This will cause runtime errors.",
    code: "const response = await fetch(...)",
  },
  {
    id: "2",
    type: "error",
    line: 4,
    title: "Loose equality comparison",
    description: "Using == instead of === can lead to unexpected type coercion. Always use strict equality.",
    code: "if (response.status === 200)",
  },
  {
    id: "3",
    type: "warning",
    line: 5,
    title: "Missing await on response.json()",
    description: "response.json() is async and returns a Promise. You need to await it to get the actual data.",
    code: "const user = await response.json()",
  },
  {
    id: "4",
    type: "warning",
    line: 1,
    title: "Using var instead of const/let",
    description: "var has function scope which can lead to hoisting bugs. Use const for values that don't change, let for those that do.",
  },
  {
    id: "5",
    type: "suggestion",
    line: 1,
    title: "Add TypeScript types",
    description: "Adding type annotations improves code maintainability and catches errors at compile time.",
    code: "async function fetchUserData(userId: string): Promise<User>",
  },
  {
    id: "6",
    type: "suggestion",
    line: 12,
    title: "Add error handling with try/catch",
    description: "Network requests can fail. Wrap fetch calls in try/catch blocks to handle network errors gracefully.",
  },
  {
    id: "7",
    type: "error",
    line: 15,
    title: "Loose equality with boolean",
    description: "items[i].active == true uses loose comparison. Use strict === or just check items[i].active directly.",
  },
  {
    id: "8",
    type: "suggestion",
    line: 13,
    title: "Use Array.map() instead of for loop",
    description: "Functional array methods like map() create new arrays without mutating the original, leading to fewer bugs.",
    code: "items.map(item => ({ ...item, processed: item.active }))",
  },
];

export const generatedCode = `import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const router = express.Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ user: { id: user._id, name, email }, token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );
    
    res.json({ user: { id: user._id, name: user.name, email }, token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;`;

export interface HistoryItem {
  id: string;
  title: string;
  mode: "review" | "fix" | "generate";
  language: string;
  timestamp: string;
}

export const mockHistory: HistoryItem[] = [];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export const mockChatMessages: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "👋 Hey! I'm your AI code assistant. I can help you review, fix, or generate code. What would you like to work on?",
    timestamp: "Just now",
  },
];

export const languages = [
  "JavaScript", "TypeScript", "Python", "Java", "C++",
  "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin",
];
