import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import {
  addUserRole,
  setActiveUserRole,
} from "@/entities/user/api/user-role-repository.server";
import type { UserRole } from "@/entities/user/model/types";
import { isTelegramAdmin } from "@/shared/lib/admin/is-telegram-admin";

function parseRole(value: unknown): UserRole {
  if (value === "worker" || value === "employer") return value;
  throw new Error("Invalid role");
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    return NextResponse.json({
      user: { ...user, isAdmin: isTelegramAdmin(user.telegramId) },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load profile";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const { role, addRole } = (await request.json()) as {
      role?: unknown;
      addRole?: unknown;
    };
    const selectedRole = parseRole(role);
    if (addRole === true) await addUserRole(user.id, selectedRole);
    await setActiveUserRole(user.id, selectedRole);
    const updatedUser = await getCurrentUserFromRequest(request);
    return NextResponse.json({
      user: {
        ...updatedUser,
        isAdmin: isTelegramAdmin(updatedUser.telegramId),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update role";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
