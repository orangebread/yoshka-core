import { BrandEntry } from "../../schema/brand_entry";

export default {
  // Added ctx: ExecutionContext to the fetch handler signature
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const url = new URL(request.url);
    const [, , resource, slug] = url.pathname.split("/");   // e.g. /v1/brand/some-slug
    if (resource === "brand") {
      const data = await env.BRANDS.get<BrandEntry>(slug, "json");
      return data
        ? Response.json(data)
        : new Response("Not Found", { status: 404 });
    }
    if (resource === "recommend") {
      const current = await env.BRANDS.get<BrandEntry>(slug, "json");
      if (!current) return new Response("Not Found", { status: 404 });
      const sector = current.naics.slice(0, 2);            // 2‑digit NAICS sector
      // Naïve ranker: same sector, different ultimate parent, top 3 by some implicit score (or just first 3 found)
      const matches = await env.BRANDS.list({ prefix: "" }); // Consider more targeted listing if possible
      const alts = [];
      for (const { name } of matches.keys) {
        if (alts.length === 3) break;
        const cand = await env.BRANDS.get<BrandEntry>(name, "json");
        if (!cand) continue;
        // Ensure ownership_chain exists and is not empty before using .at(-1)
        const currentUltimateParent = current.ownership_chain?.at(-1);
        const candUltimateParent = cand.ownership_chain?.at(-1);

        const diffParent = currentUltimateParent && candUltimateParent && candUltimateParent !== currentUltimateParent;
        
        if (diffParent && cand.naics.startsWith(sector)) {
          // Ensure meta, brand, slug, and name exist
          if (cand.meta?.brand?.slug && cand.meta?.brand?.name) {
            alts.push({ slug: cand.meta.brand.slug, name: cand.meta.brand.name });
          }
        }
      }
      return Response.json(alts);
    }
    return new Response("Bad Request: Invalid resource", { status: 400 });
  },
  // Use ExportedHandler<Env>
} satisfies ExportedHandler<Env>;
