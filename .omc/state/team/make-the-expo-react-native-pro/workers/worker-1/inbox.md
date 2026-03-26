## REQUIRED: Task Lifecycle Commands
You MUST run these commands. Do NOT skip any step.

1. Claim your task:
   omc team api claim-task --input '{"team_name":"make-the-expo-react-native-pro","task_id":"1","worker":"worker-1"}' --json
   Save the claim_token from the response.
2. Do the work described below.
3. On completion (use claim_token from step 1):
   omc team api transition-task-status --input '{"team_name":"make-the-expo-react-native-pro","task_id":"1","from":"in_progress","to":"completed","claim_token":"<claim_token>"}' --json
4. On failure (use claim_token from step 1):
   omc team api transition-task-status --input '{"team_name":"make-the-expo-react-native-pro","task_id":"1","from":"in_progress","to":"failed","claim_token":"<claim_token>"}' --json
5. ACK/progress replies are not a stop signal. Keep executing your assigned or next feasible work until the task is actually complete or failed, then transition and exit.

## Task Assignment
Task ID: 1
Worker: worker-1
Subject: Make the Expo React Native project at /home/harian/PROJECT/mulsikmul production-

Make the Expo React Native project at /home/harian/PROJECT/mulsikmul production-ready. Project uses Expo ~55, React Native 0.83.2, expo-router, expo-sqlite, expo-notifications. Source files: src/api/perenual.ts (plant API), src/db/queries.ts, src/db/schema.ts (SQLite), src/notifications/scheduler.ts, src/types/plant.ts. WORKER ASSIGNMENTS: Worker 1: Setup jest + @testing-library/react-native + jest-expo, write tests for src/api/perenual.ts

REMINDER: You MUST run transition-task-status before exiting. Do NOT write done.json or edit task files directly.