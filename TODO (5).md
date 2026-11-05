# Classroom Survey Web App — TODO

## Purpose

This roadmap tracks the implementation and testing progress of the Classroom Survey Web App.

**Status as of November 5, 2026:** The core application is implemented, the local survey submission workflow has been tested, and the application has been deployed to Cloudflare Pages. Some enhancements, testing, and documentation remain incomplete.

---

## Phase 1 — Project Setup

- [x] Create a new React + TypeScript project with Vite.
- [x] Add Tailwind CSS.
- [x] Add React Router.
- [x] Add Supabase JavaScript client.
- [x] Add Recharts.
- [x] Add QR code generation package.
- [x] Create the initial project folder structure.
- [x] Add `.env.example` with Supabase environment variable names.
- [x] Configure ESLint.
- [x] Create a basic home page.
- [x] Verify the project builds successfully.
- [ ] Resolve remaining ESLint errors.

---

## Phase 2 — Supabase Project and Database

- [x] Create a Supabase project.
- [x] Create the `surveys` table.
- [x] Create the `questions` table.
- [x] Create the `choices` table.
- [x] Create the `responses` table.
- [x] Create the `answers` table.
- [x] Add foreign-key constraints.
- [x] Add database indexes.
- [x] Add timestamps.
- [x] Add survey-status validation.
- [x] Create Row Level Security policies.
- [x] Implement an authorized-instructor allowlist.
- [x] Create public survey retrieval and anonymous submission RPC functions.
- [x] Verify anonymous students can read active surveys.
- [x] Verify anonymous students can submit responses.
- [x] Verify the instructor can create and manage surveys.
- [ ] Independently verify that anonymous users cannot read survey results.
- [ ] Complete unauthorized-access and RLS security tests.

---

## Phase 3 — Instructor Authentication

- [x] Create the instructor login page.
- [x] Connect login to Supabase Auth.
- [x] Add logout.
- [x] Create an authentication context/provider.
- [x] Create a protected-route component.
- [x] Redirect unauthenticated users to login.
- [x] Implement instructor authentication and dashboard access.

---

## Phase 4 — Instructor Dashboard

- [x] Create the dashboard layout.
- [x] Load surveys from Supabase.
- [x] Display survey information and status.
- [x] Add status badges.
- [x] Add a New Survey button.
- [x] Add Edit action.
- [x] Add Duplicate action.
- [x] Add Delete action.
- [x] Add Archive action.
- [x] Add View Results action.
- [x] Add Activate action.
- [x] Add Close action.
- [ ] Verify search by survey title.
- [ ] Verify filtering by status.
- [ ] Test all management actions.

---

## Phase 5 — Survey Editor

- [x] Create a survey editor page.
- [x] Add survey title field.
- [x] Add optional description field.
- [x] Add questions dynamically.
- [x] Support Multiple Choice questions.
- [x] Support True / False questions.
- [x] Add answer choices dynamically.
- [ ] Implement question reordering.
- [ ] Implement answer choice reordering.
- [x] Allow deleting questions.
- [x] Allow deleting choices.
- [x] Validate required fields.
- [x] Save a survey as Draft.
- [x] Load an existing survey for editing.
- [x] Prevent editing an active survey unless it is first closed.
- [ ] Verify editing an existing survey end-to-end.

---

## Phase 6 — Survey Activation

- [x] Add activation logic.
- [x] Ensure at most one survey is Active.
- [x] Automatically close the previously active survey.
- [x] Generate a public survey slug or identifier.
- [x] Generate the public survey URL.
- [x] Generate a QR code from the public URL.
- [x] Create a Present Survey page.
- [x] Display survey title and QR code.
- [x] Display a readable fallback URL.
- [x] Add a Close Survey action on the dashboard.
- [ ] Add a Download QR Code button.
- [ ] Test QR scanning using a mobile device.

---

## Phase 7 — Student Survey Page

- [x] Create the public route `/s/:slug`.
- [x] Load the requested active survey.
- [x] Show an error if the survey does not exist.
- [x] Show a message if the survey is closed.
- [x] Render survey title and description.
- [x] Render Multiple Choice questions.
- [x] Render True / False questions.
- [x] Validate required answers.
- [x] Add Submit button.
- [x] Store responses and answers through Supabase RPC.
- [x] Show a submission confirmation.
- [x] Implement a responsive page layout.
- [ ] Complete mobile device testing.

---

## Phase 8 — Duplicate Submission Protection

- [x] Generate an anonymous browser token.
- [x] Store the token in local storage.
- [x] Save the token with each response.
- [x] Add a database uniqueness constraint on survey and token.
- [x] Handle duplicate responses in the database function.
- [x] Handle duplicate responses in the frontend.
- [ ] Test duplicate submission attempts.

---

## Phase 9 — Results Dashboard

- [x] Create a results page for each survey.
- [x] Show total response count.
- [x] Aggregate answers by question.
- [x] Show counts for each choice.
- [x] Show percentages for each choice.
- [x] Add bar charts using Recharts.
- [x] Show unanswered question counts.
- [x] Add Refresh Results button.
- [x] Add link back to the main dashboard.
- [x] Verify that a submitted response appears in the results.
- [ ] Test aggregation with multiple responses.

---

## Phase 10 — Historical Results

- [x] Implement results access by survey ID.
- [x] Store responses persistently in PostgreSQL.
- [ ] Verify viewing results for Closed surveys.
- [ ] Verify viewing results for Archived surveys.
- [ ] Add results filtering by date.
- [ ] Add results filtering by survey title.
- [ ] Verify historical data retention when surveys are closed or archived.

---

## Phase 11 — CSV Export

- [x] Add Download CSV button.
- [ ] Export complete survey metadata.
- [x] Export one row per response.
- [x] Include submission timestamp.
- [x] Include each question and selected answer.
- [x] Implement CSV escaping.
- [ ] Test CSV export with spreadsheet applications.

---

## Phase 12 — Survey Duplication

- [x] Implement duplication of survey title and description.
- [x] Implement duplication of questions.
- [x] Implement duplication of answer choices.
- [x] Create duplicated surveys in Draft state.
- [x] Add "Copy of ..." naming.
- [ ] Verify the duplicated survey opens correctly in the editor.
- [ ] Test duplication end-to-end.

---

## Phase 13 — UI Polish

- [x] Create page layouts using Tailwind CSS.
- [x] Implement responsive layout classes.
- [x] Add loading states.
- [x] Add empty states and error messages.
- [x] Create reusable confirmation dialog components.
- [x] Display QR codes at a presentation-friendly size.
- [ ] Verify all destructive actions show confirmation dialogs.
- [ ] Test accessibility and keyboard navigation.
- [ ] Review color contrast.
- [ ] Complete final UI polish.

---

## Phase 14 — Testing

- [x] Test instructor login locally.
- [x] Test survey creation locally.
- [x] Test activation locally.
- [x] Test public survey links locally.
- [x] Test anonymous student submission locally.
- [x] Test that a response appears in results locally.
- [x] Run a successful production build.
- [ ] Test survey editing.
- [ ] Test survey closing.
- [ ] Test duplicate-submission prevention.
- [ ] Test results with multiple responses.
- [ ] Test CSV export.
- [ ] Test mobile layout.
- [ ] Test with at least two browsers.
- [ ] Test unauthorized access attempts.
- [ ] Test database Row Level Security independently.
- [ ] Perform load testing with 200 concurrent students.

---

## Phase 15 — Deployment

- [x] Initialize a Git repository.
- [x] Push the project to GitHub.
- [x] Create the Cloudflare Pages site.
- [x] Connect Cloudflare Pages to the GitHub repository.
- [x] Configure production environment variables.
- [x] Deploy the application.
- [x] Include SPA routing support.
- [x] Verify that the deployed website loads.
- [ ] Verify production instructor login.
- [ ] Verify QR codes point to the production URL.
- [ ] Test anonymous student submissions in production.
- [ ] Test instructor results in production.
- [x] Add project documentation to README.
- [x] Add the development summary.
- [ ] Capture required screenshots.
- [ ] Save database migration SQL files in the repository.
- [ ] Save AI development history or required AI interaction records.
- [ ] Push final documentation and submission materials to GitHub.

---

## Phase 16 — Post-MVP Enhancements

- [ ] Add live updating results with Supabase Realtime.
- [ ] Add question bank.
- [ ] Add survey import/export as JSON.
- [ ] Add Markdown import.
- [ ] Add short-answer questions.
- [ ] Add checkbox questions.
- [ ] Add rating-scale questions.
- [ ] Add numeric questions.
- [ ] Add AI-assisted question generation.
- [ ] Add LMS integration.
- [ ] Add multiple instructors.
- [ ] Add course and semester organization.
- [ ] Add analytics across multiple surveys.

---

## Final Notes

The core Classroom Survey application is implemented and has successfully demonstrated the local instructor-to-student submission workflow. GitHub integration and Cloudflare Pages deployment are complete.

Remaining work includes production workflow verification, additional testing, database migration files, screenshots, AI development records, and final submission checks.

Some optional enhancements and ESLint errors remain unresolved and are documented rather than marked complete.