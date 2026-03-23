# 🚀 Code Companion AI

A modern, stunning, highly-responsive AI-powered code editor and companion built with Next.js, React, Tailwind CSS, and Framer Motion. This application seamlessly integrates with OpenRouter completely bypassing local limitations, granting you immediate access to cutting-edge models for analyzing, fixing, chatting, and generating code.

## ✨ Features

- **Code Editor**: A fully integrated, syntax-highlighted editor experience (using Monaco logic).
- **Glassmorphism Design**: Experience a gorgeous dark-first theme with frosted glass effects and dynamic glowing accents.
- **AI Review Panel**: Submit your code and get structured, line-by-line feedback with severity levels (error, warning, suggestion).
- **AI Fix Panel**: Automatically applies AI-generated best practices to your buggy code, showcasing a clear unified diff for comparison.
- **AI Generate Panel**: Stream completely new, functional scripts based on your conversational natural language prompts in real-time.
- **AI Chat Panel**: Ask the assistant anything using your session's rich chat context.
- **Model Selection**: Switch seamlessly between top-tier free open-source models (like Qwen, Nemotron, StepFun) instantly from the application settings!
- **Persistent History**: Browsing sessions and chat queries are saved securely in your browser's local storage so you can easily pick up where you left off.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Backend**: OpenRouter API Integration (`/api/review` and `/api/chat`)

## ⚡ Quick Start

### 1. Clone & Install
\`\`\`bash
npm install
\`\`\`

### 2. Configure Environment
Create a new file named \`.env.local\` in the root directory and add your OpenRouter API key:
\`\`\`env
OPENROUTER_API_KEY=sk-or-v1-...
\`\`\`
> Note: If you add or change this file while the server is running, you must restart the server for Next.js to load the key!

### 3. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) with your browser to use the application.

## 💡 Usage

1. Paste your code into the primary editor block.
2. Select your desired mode from the Sidebar (Review, Fix, Generate).
3. Ensure your desired model is selected in the Settings Dialog (Gear Icon on the top right).
4. Hit **"Analyze"** or **"Send"** to invoke the AI!
