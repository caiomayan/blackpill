"use client";

import { useState, useTransition } from "react";
import { deleteUser } from "@/app/actions/admin";
import { IconTrash, IconLoader2 } from "@tabler/icons-react";

export default function DeleteUserButton({ userId, username }: { userId: string, username: string }) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    const confirmName = prompt(`Are you sure you want to delete this user? Type "${username}" to confirm.`);
    if (confirmName !== username) {
      return;
    }

    startTransition(async () => {
      const res = await deleteUser(userId);
      if (res?.error) {
        alert(res.error);
      }
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-bold text-red-500 hover:text-white hover:bg-red-600 transition-colors px-3 py-1.5 bg-white border border-red-200 rounded-lg shadow-sm flex items-center gap-1 disabled:opacity-50"
      title="Delete User"
    >
      {isPending ? <IconLoader2 size={14} className="animate-spin" /> : <IconTrash size={14} />}
      Delete
    </button>
  );
}
