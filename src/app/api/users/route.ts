/**
 * API Route: GET /api/users
 *
 * BUG: Tries to access `data.data.users` but the mock data structure
 * is `{ users: [...] }` — there is no `.data` wrapper.
 * This causes a TypeError: Cannot read properties of undefined.
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

  // FIXED: Access `data.users` directly since the data structure is { users: [...] }
  const userList = data.users;

  return NextResponse.json({ users: userList });
}

export const GET = withAutoduty(handler, "src/app/api/users/route.ts");