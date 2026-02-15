/**
 * API Route: GET /api/users
 *
 * Returns user profile data.
 */

import { NextResponse } from "next/server";
import { withAutoduty } from "@/lib/error-reporter";

// Simulated database response
function fetchUsersFromDB() {
  return {
    users: [
      { id: 1, name: "Alice Johnson", email: "alice@example.com" },
      { id: 2, name: "Bob Smith", email: "bob@example.com" },
      { id: 3, name: "Charlie Brown", email: "charlie@example.com" },
    ],
  };
}

async function handler(request: Request) {
  const data = fetchUsersFromDB();

  const users = (data as Record<string, unknown>).data as Record<string, unknown>;
  const userList = users.users;

  return NextResponse.json({ users: userList });
}

export const GET = withAutoduty(handler, "src/app/api/users/route.ts");
