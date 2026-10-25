"use client";
import Link from "next/link";
import { Slot, SlotButton, formatINR, useFlow, useLineToggle, usePrice, useRiptide, useSession, useSlotDefault } from "@riptide/core";
import { DEMO_USER, STORAGE_PRICE, billingTerms, gstOf, planById, planLabel, termById, trialTerms } from "@/catalog";
import type { SaasState } from "@/shop.config";
import { AppIcon } from "@/components/Art";
import { NoPlan, Summary } from "@/components/Summary";
import { Skeleton, Steps, useHydrated } from "@/components/ui";

export default function Review() {
  const { base } = useRiptide();
  const flow = useFlow("purchase");
  const [s, set] = useSession<SaasState>();
  const hydrated = useHydrated();
  const price = usePrice("review");
  const [storage, setStorage] = useLineToggle("storage");
  const optDefault = useSlotDefault<boolean>("review.optin.marketing", false);
  const optin = s.optin ?? optDefault;
  const [cont, setCont] = useLineToggle("continuity");
  const partners = s.partners ?? true;

  if (!hydrated) return <main data-riptide-step="review" className="ps-wrap py-8"><Steps current="review" /><Skeleton h={420} className="mt-8" /></main>;
  if (!s.plan || !s.term) return <main data-riptide-step="review" className="ps-wrap py-8"><Steps current="review" /><div className="mt-8"><NoPlan /></div></main>;

  const trial = s.mode === "trial";
  const seats = s.plan === "team" ? (s.seats ?? 2) : 1;
  const recurring = price.lines.filter((l) => l.selected && l.kind !== "discount").reduce((t, l) => t + l.amount, 0);
  const chargeText = `${formatINR(recurring)} incl. GST`;
  const st = STORAGE_PRICE;
  const checks = s.checks ?? 0;
  const blocked = trial && !s.verified;

  return (
    <main data-riptide-step="review" className="ps-wrap py-8">
      <Steps current="review" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-6">
          <section className="ps-panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="ps-eyebrow">Step 3 · Review</p>
                <h1 className="mt-2 text-3xl font-extrabold">Review your plan</h1>
              </div>
              <Link href={`${base}/pricing`} className="rt-link text-sm">Change plan</Link>
            </div>
            <div className="mt-5 flex items-center gap-4">
              {s.plan === "single" ? <AppIcon id={s.app ?? "lumen"} size={52} /> : <div className="ps-spectrum h-12 w-12 !rounded-[14px]" aria-hidden />}
              <div>
                <p className="text-lg font-bold">{planLabel({ plan: s.plan, app: s.app, term: s.term, seats })}</p>
                <p className="text-sm text-muted">{planById(s.plan)?.blurb} · {termById(s.term)?.name}</p>
              </div>
            </div>
            <Slot id="review.billing.terms" as="p" className="mt-5 rounded-[var(--rt-radius-sm)] bg-surface-2 p-4 text-sm leading-relaxed">
              {trial ? `${trialTerms(s.term, chargeText)} ${billingTerms(s.term, chargeText, "trial")}` : billingTerms(s.term, chargeText, "buy")}
            </Slot>
            <p className="mt-4 text-sm text-muted">
              Account: <b className="text-fg">{DEMO_USER.name}</b> ({DEMO_USER.email}). Your existing {planLabel(s.sub)} plan is separate and keeps running until you change or cancel it in Account.
            </p>
          </section>

          <Slot id="review.upsell.storage" as="section" className="ps-panel p-6" aria-label="Optional add-on">
            <p className="ps-eyebrow">Optional add-on</p>
            <h2 className="mt-2 text-xl font-bold">Stock assets &amp; +1 TB cloud storage</h2>
            <p className="mt-2 text-sm text-muted">
              120,000 licensed photos, vectors and video clips inside every app, plus an extra 1 TB of Prism Cloud.
              {` ${formatINR(st)}/mo + ${formatINR(gstOf(st))} GST`}{termById(s.term)?.id === "annual-prepaid" ? ", billed yearly with your plan" : ", billed with your plan"}. Remove it any time from Account.
            </p>
            {trial ? (
              <p className="mt-4 text-sm">Add-ons aren&apos;t part of the free trial. You can add this from Account after your first payment.</p>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SlotButton id="review.upsell.add" variant="secondary" aria-pressed={storage} onClick={() => setStorage(true)}>{storage ? "✓ Added to plan" : "Add to plan"}</SlotButton>
                <SlotButton id="review.upsell.decline" variant="secondary" aria-pressed={!storage} onClick={() => setStorage(false)}>No, thanks</SlotButton>
                <span className="text-sm text-muted">{storage ? "Added. It's in your order summary." : "Not added."}</span>
              </div>
            )}
          </Slot>

          {trial && (
            <section className="ps-panel p-6" aria-label="Card check">
              <h2 className="text-xl font-bold">Verify your card (₹0 hold)</h2>
              <p className="mt-2 text-sm text-muted">We check your card before the trial starts. Nothing is charged today.</p>
              {s.verified ? (
                <p className="mt-4 text-sm">Card verified. You can continue to payment.</p>
              ) : checks === 0 ? (
                <div className="mt-4"><SlotButton id="review.verify.card" variant="secondary" onClick={() => set({ checks: 1 })}>Verify card</SlotButton></div>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-sm" role="alert">We couldn&apos;t verify your card for the trial (gateway timeout, code PG-504). Paid plans don&apos;t need this check. Start the paid plan now and get 10% off your first month, or try again.</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <SlotButton id="review.verify.switch" variant="primary" onClick={() => set({ mode: "buy", checks: 0, verified: false })}>Start paid plan now</SlotButton>
                    <SlotButton id="review.verify.retry" variant="link" onClick={() => set({ verified: true, checks: 2 })}>Try again</SlotButton>
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="ps-panel p-6">
            <Slot id="review.optin.partners" as="label" className="rt-check">
              <input type="checkbox" role="switch" checked={partners} onChange={(e) => set({ partners: e.target.checked })} />
              <span>Personalised picks from Prism partner studios (recommended). Your name and email are shared with partners to tailor them.</span>
            </Slot>
          </section>

          <section className="ps-panel p-6">
            <Slot id="review.optin.marketing" as="label" className="rt-check">
              <input type="checkbox" checked={optin} onChange={(e) => set({ optin: e.target.checked })} />
              <span>Send me tutorials, product news and offers by email. You can unsubscribe at any time.</span>
            </Slot>
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Summary step="review">
            {!trial && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted">Price details</summary>
                {cont ? (
                  <p className="mt-2 text-muted">Plan continuity keeps your seat and queue priority on renewal. <SlotButton id="review.continuity.remove" variant="link" className="text-xs" onClick={() => setCont(false)}>Remove</SlotButton></p>
                ) : (
                  <p className="mt-2 text-muted">Continuity removed.</p>
                )}
              </details>
            )}
            <Slot id="review.cta.continue" as={Link} href={flow.next("review")} className="rt-btn mt-2 w-full" variant="primary" aria-disabled={blocked || undefined} onClick={(e: React.MouseEvent) => { if (blocked) e.preventDefault(); }}>Continue to payment</Slot>
            <p className="text-xs text-muted">You&apos;ll choose UPI, card, netbanking or a wallet on the next page.</p>
          </Summary>
        </div>
      </div>
    </main>
  );
}
