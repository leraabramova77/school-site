import "server-only";
import {
  type AssignmentInfo,
  type AssignmentRef,
  parseAssignmentInfo,
} from "./assignment";
import { netschoolRequest } from "./http.server";
import type { NetschoolSession } from "./login.server";

/** Подробности задания из дневника. */
export async function fetchAssignmentInfo(
  session: NetschoolSession,
  ref: AssignmentRef,
  pclid: string,
): Promise<AssignmentInfo> {
  const res = await netschoolRequest(
    session.cookies,
    "/asp/ajax/Assignments/GetAssignmentInfo.asp",
    {
      method: "POST",
      retry: true,
      form: {
        AID: ref.aid,
        CID: ref.cid,
        TP: ref.tp,
        PCLID_IUP: pclid,
        AT: session.at,
        VER: String(Date.now()),
      },
    },
  );
  return parseAssignmentInfo(res.html);
}
