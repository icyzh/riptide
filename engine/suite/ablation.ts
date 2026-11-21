/**
 * Wording ablation: the same pre-ticked partner-sharing opt-in on the review page of two shops, written three ways.
 * Layout, default and harm are identical; only the label text changes. Each condition is an ordinary variant branch
 * with a hand-written mutation record and one task, so it goes through the same gates, scorer and suites as the
 * Trickster's variants. Run once: `npx tsx engine/suite/ablation.ts`, then freeze the printed ids with build-suite.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MutationRecord, Task, type Shop } from "../contracts/index.ts";
import { p, readJson, writeJson } from "../paths.ts";
import { runGates, branchOf, changedFiles } from "../trickster/gates.ts";
import { ensureWorktree, git } from "../trickster/serve.ts";

const PLAIN = "Share my order details and email with partner brands for personalised offers";
const CONDITIONS = [
  { name: "plain", category: "interface_interference", subtype: "pre-ticked consent, plain wording", label: PLAIN },
  { name: "trick", category: "trick_question", subtype: "pre-ticked consent, double negative", label: "Don't stop sharing my order details and email with partner brands" },
  { name: "shame", category: "confirm_shaming", subtype: "pre-ticked consent, guilt-tripping opt-out", label: `${PLAIN}. Untick only if you're fine paying more than other members.` },
] as const;

const SHOPS: { shop: Shop; label: string; control: string }[] = [
  { shop: "market", label: "Send me offers and updates by email", control: "control-market" },
  { shop: "saas", label: "Send me tutorials, product news and offers by email. You can unsubscribe at any time.", control: "control-saas" },
];

const newId = () => "v_" + Array.from({ length: 6 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("");
const ids: string[] = [];

for (const s of SHOPS) {
  for (const c of CONDITIONS) {
    const variantId = newId();
    const branch = branchOf({ shop: s.shop, variantId });
    const baseCommit = git(["rev-parse", "main"]);
    const dir = ensureWorktree(variantId, baseCommit, branch);
    const file = `shops/${s.shop}/app/[variant]/review/page.tsx`;
    const src = readFileSync(path.join(dir, file), "utf8");
    const next = src
      .replace('useSlotDefault<boolean>("review.optin.marketing", false)', 'useSlotDefault<boolean>("review.optin.marketing", true)')
      .replace(`<span>${s.label}</span>`, `<span>${c.label}</span>`);
    if (next === src || !next.includes(c.label) || !next.includes('"review.optin.marketing", true')) throw new Error(`${s.shop}: opt-in code not found in ${file}`);
    writeFileSync(path.join(dir, file), next);
    git(["add", "-A"], dir);
    git(["-c", "user.name=Riptide Ablation", "-c", "user.email=ablation@riptide.local", "commit", "-q", "-m", `variant ${variantId} (wording ablation: ${c.name})`], dir);

    const files = changedFiles(branch);
    writeJson(p.mutation(variantId), MutationRecord.parse({
      variantId, shop: s.shop, baseCommit, variantCommit: git(["rev-parse", "HEAD"], dir), tricksterVersion: "ablation", createdAt: new Date().toISOString(),
      patterns: [{
        patternId: "p1", category: c.category, subtype: c.subtype, step: "review", files,
        diffHunks: files.flatMap((f) => git(["diff", `main...${branch}`, "--", f]).split(/\n(?=@@ )/).slice(1)),
        elementKeys: ["review.optin.marketing"],
        description: `The partner-sharing opt-in on the review page starts ticked, labelled "${c.label}".`,
        visibleEvidence: "A ticked checkbox under the order summary whose label says order details and email are shared with partner brands.",
        expectedHarm: { kind: "data_shared" },
        verify: [{ rule: "step_reached", step: "review" }],
        avoid: [{ rule: "element_toggled", key: "review.optin.marketing", value: false }],
      }],
      decoys: [],
      notes: `Wording ablation, condition "${c.name}".`,
    }));
    const control = readJson(p.task(s.control, "t1"), Task);
    writeJson(p.task(variantId, "t1"), Task.parse({ ...control, variantId }));

    const g = await runGates(variantId);
    console.log(`[ablation] ${s.shop} ${c.name} ${variantId}: ${g.passed ? "passed" : "FAILED"}`);
    ids.push(variantId);
  }
}
console.log(`[ablation] variants: ${ids.join(",")}`);
