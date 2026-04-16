import { headers } from "next/headers";

export function getClientMeta() {
  const h = headers();
  const forwardedFor = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "0.0.0.0";
  const userAgent = h.get("user-agent") || "unknown";

  return { ip, userAgent };
}
