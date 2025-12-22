import { ROLES } from "./roles";

// --- Role Groups ---
const ALL_ROLES = [ROLES.HAZOP_CREATOR, ROLES.TEAM_LEAD, ROLES.TEAM_MEMBER];
const CREATOR_ONLY = [ROLES.HAZOP_CREATOR];
const LEAD_AND_CREATOR = [ROLES.HAZOP_CREATOR, ROLES.TEAM_LEAD];

export const PERMISSIONS = {
  
  // 1. Hazop Page (Home) -> Creator Only
  HazopPage: CREATOR_ONLY,

  // 2. Hazop List (Standard List) -> Creator Only 
  // (Lead/Member see specific status pages instead per your req)
  HazopList: CREATOR_ONLY,

  // 3. MOC List -> Creator Only
  MOCList: CREATOR_ONLY,

  // 4. Approval Request -> Everyone
  ApprovalRequest: null,
  // 5. All Hazop's (Status Page) -> Everyone
  HazopStatusPage: ALL_ROLES,

  // 6. Role Based Page -> Creator and Lead
  RoleBasedHazopPage: LEAD_AND_CREATOR,

  // --- Internal Screens (Not in Sidebar, but need protection) ---
  Dashboard: ALL_ROLES,
  NodePages: CREATOR_ONLY, // Grouping Node create/update/details here
};