import { inngest } from "@/features/inngest/client";
import { reviewPullRequest } from "@/features/reviews/server/review-pr-function";
import { serve } from "inngest/next";
import { processTask } from "./function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processTask, reviewPullRequest],
});