# Classroom Survey Web App — Development Summary

**Course:** CSE 4095 — Agentic Programming  
**Project:** Classroom Survey Web App  
**Date:** November 5, 2026

## Project Overview

For this assignment, I developed a full-stack classroom survey web application that allows instructors to create surveys and collect anonymous student responses. The goal was to create a simple platform that instructors could use during class to check students' understanding of different topics. Instead of requiring students to create accounts, the application allows them to participate by scanning a QR code or opening a public survey link.

The application was built using React, TypeScript, Vite, and Tailwind CSS for the frontend. I used Supabase for the PostgreSQL database and instructor authentication, while Cloudflare Pages was used to deploy the application.

## Development Process

I began by setting up the React and TypeScript project using Vite and installing the necessary dependencies. I also organized the project into components, pages, and library files to separate the frontend interface from database operations.

Next, I configured a Supabase project and created five database tables: surveys, questions, choices, responses, and answers. These tables store survey information, questions, answer choices, and student submissions. I also implemented Row Level Security policies to restrict direct database access to authorized instructors.

After setting up the database, I worked on the instructor-facing features. These included the login page, dashboard, and survey creation and editing interface. Instructors can create multiple-choice and true/false questions, save surveys, and activate them for students. The application also supports closing surveys, with only one survey active at a time.

For students, I created a public survey page that displays the active survey's questions and answer choices. Students can submit responses anonymously without signing in. A PostgreSQL function validates the submission and saves the response and its answers together in a database transaction.

I then implemented a presentation page that generates a QR code and public student link. Finally, I added a results page that displays response counts, charts, and a CSV download option.

## AI-Assisted Development

AI-assisted tools were used throughout the development process to help generate code, organize components, explain database concepts, and troubleshoot errors. Cursor was used for initial project scaffolding and code generation, while ChatGPT provided step-by-step guidance for implementing additional frontend features and Supabase database functions.

The development process was iterative. Rather than attempting to generate the entire application at once, I implemented individual features, tested them, and continued building on the working code.

AI assistance was particularly useful when connecting the React frontend to Supabase and troubleshooting database permission errors. I still needed to configure the external services, run the SQL queries, test the application, and verify that the generated code worked.

## Challenges and Troubleshooting

One challenge was configuring the PostgreSQL database permissions. Although the database tables and security policies had been created, the application initially received a `403 Forbidden` error when attempting to save a survey. I investigated the browser console and resolved the issue by updating the necessary Supabase table permissions.

Another challenge involved integrating the different React components and ensuring the application compiled successfully. I used the Vite production build command to identify TypeScript errors and verify that the application could be built.

I also had to configure instructor authentication, public survey access, anonymous submissions, and survey activation functions separately. Testing each step helped identify problems before moving on to the next feature.

## Testing and Deployment

I tested the application locally by signing in as an instructor, creating a survey, activating it, and accessing the public survey page through an anonymous browser session. I successfully submitted a student response and verified that it appeared in the instructor results.

I also ran the production build successfully and pushed the project to a GitHub repository. The application was deployed through Cloudflare Pages using the GitHub integration.

The core workflow was tested locally, but additional testing would be necessary to verify performance with 200 concurrent students. Some ESLint errors also remain unresolved, although they do not prevent the application from building.

## Reflection

This project helped me better understand how a full-stack web application connects its frontend, authentication system, database, and deployment platform. I gained experience working with React, TypeScript, Supabase, SQL functions, database permissions, and Cloudflare Pages.

One important lesson was that AI-generated code still requires testing and debugging. AI tools helped accelerate development, but integrating the different components and resolving configuration issues required additional work.

Overall, I completed a working classroom survey application that demonstrates survey creation, anonymous student participation, QR-code access, and results visualization. Future improvements could include real-time updates, more comprehensive automated testing, and performance optimization.