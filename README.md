# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

# Classroom Survey Web App

A full-stack classroom survey application that allows instructors to create and manage surveys while students submit responses anonymously through a public link or QR code.

Developed for the University of Connecticut's CSE 4095 Agentic Programming assignment.

## Technologies Used

**Frontend**
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- QRCode

**Backend and Deployment**
- Supabase PostgreSQL
- Supabase Authentication
- Supabase Row Level Security (RLS)
- PostgreSQL functions (RPC)
- Cloudflare Pages
- GitHub

## Features

### Instructor Features

- Email and password authentication
- Instructor dashboard
- Create and edit surveys
- Add multiple-choice and true/false questions
- Add and remove answer choices
- Activate and close surveys
- Automatically close the previously active survey when activating another
- Duplicate, archive, and delete surveys
- Generate public survey links and QR codes
- View student response counts
- View survey results using charts
- Download results as CSV files

### Student Features

- Access active surveys without an account
- Join surveys using a QR code or public link
- Answer multiple-choice and true/false questions
- Submit responses anonymously
- Receive submission confirmation
- Prevent accidental duplicate submissions using browser-generated tokens

## Database Design

The application uses five main PostgreSQL tables:

| Table | Purpose |
|---|---|
| `surveys` | Stores survey titles, descriptions, and statuses |
| `questions` | Stores questions belonging to surveys |
| `choices` | Stores answer choices for questions |
| `responses` | Stores anonymous student submissions |
| `answers` | Stores answers associated with each response |

Foreign key relationships maintain referential integrity.

Row Level Security restricts direct database access to authorized instructors.

Students interact with public surveys through database functions rather than direct table access.

## Database Functions

The application uses four Supabase RPC functions:

- `get_public_survey` — retrieves the questions and choices of an active survey.
- `submit_survey_response` — validates and stores anonymous responses in a database transaction.
- `activate_survey` — activates a survey and closes the previously active survey.
- `close_survey` — closes an active survey.

## Running Locally

### Prerequisites

- Node.js and npm
- A Supabase project

### Installation

Clone the repository:

```bash
git clone https://github.com/Hiu1111/classroom-survey.git
cd classroom-survey
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

The Supabase database schema, security policies, and RPC functions must also be configured before using the application.

Never put a Supabase secret key or service-role key in the frontend environment variables.

Start the development server:

```bash
npm run dev
```

Open the URL displayed by Vite, usually:

http://localhost:5173

### Production Build

```bash
npm run build
```

The production files are generated in the `dist` directory.

## Application Routes

| Route | Description |
|---|---|
| `/` | Application home page |
| `/login` | Instructor login |
| `/dashboard` | Instructor dashboard |
| `/surveys/new` | Create a new survey |
| `/surveys/:id/edit` | Edit an existing survey |
| `/surveys/:id/present` | View the QR code and student link |
| `/surveys/:id/results` | View results and download CSV |
| `/s/:slug` | Public student survey |

Instructor routes require authentication.

## How to Use

### Instructor Workflow

1. Sign in using an authorized instructor account.
2. Open the dashboard.
3. Create a survey with a title and questions.
4. Save the survey.
5. Activate the survey.
6. Open the presentation page.
7. Share the QR code or public link with students.
8. Monitor responses.
9. View results and download CSV data.
10. Close the survey when finished.

### Student Workflow

1. Open the shared survey link or scan its QR code.
2. Read the questions.
3. Select an answer for each question.
4. Submit the survey.
5. View the submission confirmation.

Students do not need to create an account or log in.

## Deployment

The application is deployed through Cloudflare Pages using GitHub integration.

Build configuration:

| Setting | Value |
|---|---|
| Framework | React / Vite |
| Production branch | `main` |
| Build command | `npm run build` |
| Output directory | `dist` |

The following environment variables must be configured in Cloudflare Pages:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Cloudflare automatically deploys changes pushed to the production branch.

## Security

The application implements:

- Supabase authentication for instructors
- Row Level Security policies
- An authorized instructor allowlist
- Public survey access through restricted RPC functions
- Transactional anonymous response submission
- Validation of survey IDs, question IDs, and choices
- One active survey at a time
- Unique anonymous tokens per survey and browser

Anonymous tokens help prevent accidental duplicate submissions but do not guarantee one submission per real-world student.

## Testing

The following workflows were tested locally:

- Instructor sign-in
- Creating and saving surveys
- Activating surveys
- Loading public student surveys
- Submitting an anonymous response
- Displaying response counts and results
- Generating a production build

Additional production testing and performance validation may be needed.

## Known Limitations

- Anonymous participation is browser-token-based rather than identity-based.
- The application has not been load-tested with 200 simultaneous students.
- Some ESLint warnings/errors remain unresolved.
- Live response counts use periodic polling rather than a real-time database subscription.
- Database configuration must be applied separately to a new Supabase project.

## AI Assistance

AI-assisted programming tools were used during development for initial scaffolding, generating React components, designing Supabase SQL functions, troubleshooting build and database permission errors, and preparing documentation.

Generated code was integrated incrementally and tested through local builds and application workflows.

## Repository

https://github.com/Hiu1111/classroom-survey
