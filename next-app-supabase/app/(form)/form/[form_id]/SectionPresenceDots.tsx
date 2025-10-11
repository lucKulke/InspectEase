// components/PresenceDots.tsx
"use client";

import React from "react";
import { IUserProfileResponse } from "@/lib/database/public/publicInterface";

type PresenceDotsProps = {
  userIds: string[];
  teamMembers: IUserProfileResponse[] | null;

  max?: number; // show at most N dots before "+n"
  size?: number; // px (dot diameter), default 20
  ring?: boolean; // contrast ring around dot
  ping?: boolean; // enable ping animation
};

export function PresenceDots({
  userIds,
  teamMembers,
  max = 4,
  size = 20,
  ring = true,
  ping = true,
}: PresenceDotsProps) {
  if (!teamMembers || userIds.length === 0) return null;

  const displayed = userIds.slice(0, max);
  const overflow = userIds.length - displayed.length;

  return (
    <div className="flex items-center">
      {displayed.map((id, i) => {
        const color = idToColor(id, teamMembers);
        const name = idToName(id, teamMembers) ?? id;
        return (
          <span
            key={id}
            className={`relative inline-flex items-center justify-center ${
              i > 0 ? "-ml-2" : ""
            }`}
            style={{
              width: size,
              height: size,
              zIndex: 10 + (displayed.length - i),
            }}
            title={name}
          >
            {/* ping aura */}
            {ping && (
              <span
                className="absolute inset-0 rounded-full opacity-40 motion-safe:animate-ping"
                style={{
                  backgroundColor: color,
                  // slightly larger than the core dot
                  transform: "scale(1.4)",
                }}
                aria-hidden
              />
            )}

            {/* core dot */}
            <span
              className={`rounded-full block ${
                ring ? "ring-2 ring-white dark:ring-zinc-900" : ""
              }`}
              style={{ width: size, height: size, backgroundColor: color }}
            />
          </span>
        );
      })}

      {overflow > 0 && (
        <span
          className={`rounded-full -ml-2 flex items-center justify-center text-[10px] font-medium
                      ring-2 ring-white dark:ring-zinc-900 bg-zinc-200 dark:bg-zinc-700`}
          style={{ width: size, height: size }}
          title={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}

// Look up a team color for this user (fallback to a pleasant gray)
function idToColor(userId: string, teamMembers: IUserProfileResponse[]) {
  const member = teamMembers.find((m) => m.user_id === userId);
  if (member?.color) return member.color;
  return "#a3a3a3"; // zinc-400-ish fallback
}

// Optional: show a nicer tooltip than the raw ID
function idToName(userId: string, teamMembers: IUserProfileResponse[]) {
  const member = teamMembers.find((m) => m.user_id === userId);
  return member?.email ?? member?.first_name ?? null;
}
