import { Announcement } from "../models/announcement.model.js";
import { Event } from "../models/event.model.js";

export const SEARCH_LIMIT = 20;

type SearchScope = { collegeId: string; departmentId?: string };

function visibility(scope: SearchScope) {
  return scope.departmentId
    ? [{ departmentId: null }, { departmentId: scope.departmentId }]
    : [{ departmentId: null }];
}

function searchFilter(query: string, scope: SearchScope) {
  return {
    collegeId: scope.collegeId,
    $or: visibility(scope),
    $text: { $search: query }
  };
}

export async function searchCampus(query: string, scope: SearchScope) {
  const filter = searchFilter(query, scope);
  const projection = { score: { $meta: "textScore" } };
  const sort = { score: { $meta: "textScore" as const }, createdAt: -1 as const };

  const [announcements, events] = await Promise.all([
    Announcement.find(filter, projection).sort(sort).limit(SEARCH_LIMIT).lean(),
    Event.find(filter, projection).sort(sort).limit(SEARCH_LIMIT).lean()
  ]);

  return { announcements, events };
}