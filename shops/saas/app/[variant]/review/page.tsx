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
  const [care, setCare] = useLineToggle("care");
  const optDefault = useSlotDefault<boolean>("review.optin.marketing", true);
  const optin = s.optin ?? optDefault;

  if (!hydrated) return <main data-riptide-step="review" className="ps-wrap py-8"><Steps current="review" /><Skeleton h={420} className="mt-8" /></main>;
  if (!s.plan || !s.term) return <main data-riptide-step="review" className="ps-wrap py-8"><Steps current="review" /><div className="mt-8"><NoPlan /></div></main>;

  const trial = s.mode === "trial";
  const seats = s.plan === "team" ? (s.seats ?? 2) : 1;
  const recurring = price.lines.filter((l) => l.selected && l.kind !== "discount").reduce((t, l) => t + l.amount, 0);
  const chargeText = `${formatINR(recurring)} incl. GST`;
  const st = STORAGE_PRICE;
  const tries = s.verify ?? 0;
  const verified = tries >= 99;
  const blocked = trial && !verified;
  const onePlan = planById(s.plan)?.name ?? "All Apps";

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

          <section className="ps-panel p-6">
            <Slot id="review.optin.marketing" as="label" className="rt-check">
              <input type="checkbox" checked={optin} onChange={(e) => set({ optin: e.target.checked })} />
              <span>Keep me posted with tutorials, product news and offers from Prism and selected partners (your email is shared with them). Untick to opt out; you can also unsubscribe at any time.</span>
            </Slot>
          </section>

          {!trial && (
            <Slot id="review.continuity.card" as="section" className="ps-panel p-6" aria-label="Plan continuity">
              <h2 className="text-lg font-bold">Plan continuity</h2>
              <p className="mt-2 text-sm text-muted">Priority support with a 4-hour reply, migration help and uninterrupted renewals. Teams that keep it resolve issues 3× faster.</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SlotButton id="review.continuity.toggle" variant={care ? "primary" : "secondary"} aria-pressed={care} onClick={() => setCare(!care)}>{care ? "✓ Continuity included" : "Include continuity"}</SlotButton>
                <span className="text-xs text-muted">{care ? "Priced in your order summary." : "Not included."}</span>
              </div>
            </Slot>
          )}

          {trial && (
            <Slot id="review.verify.card" as="section" className="ps-panel p-6" aria-label="Verify your card">
              <h2 className="text-lg font-bold">Verify your card for the trial</h2>
              {verified ? (
                <p className="mt-2 text-sm">Verified. Nothing is charged today.</p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-muted">We place a ₹0 hold to start your trial.</p>
                  {tries >= 1 && (
                    <p role="alert" className="mt-3 rounded-[var(--rt-radius-sm)] bg-surface-2 p-3 text-sm">We couldn&apos;t verify your card for the trial (code PG-504). Paid plans don&apos;t need verification. You can also try again or use UPI.</p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {tries === 0 && <SlotButton id="review.verify.retry" variant="secondary" onClick={() => set({ verify: 1 })}>Verify card</SlotButton>}
                    {tries >= 1 && <SlotButton id="review.verify.switch" variant="primary" onClick={() => set({ mode: "buy", verify: 0 })}>Start {onePlan} now and get 10% off the first month</SlotButton>}
                    {tries >= 1 && <SlotButton id="review.verify.retry" variant="link" onClick={() => set({ verify: 99 })}>Try again</SlotButton>}
                    {tries >= 1 && <SlotButton id="review.verify.upi" variant="link" onClick={() => set({ verify: 99 })}>Verify with UPI instead</SlotButton>}
                  </div>
                </>
              )}
            </Slot>
          )}
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Summary step="review">
            {blocked
              ? <button type="button" disabled className="rt-btn mt-2 w-full" data-variant="secondary">Verify your card to continue</button>
              : <Slot id="review.cta.continue" as={Link} href={flow.next("review")} className="rt-btn mt-2 w-full" variant="primary">Continue to payment</Slot>}
            <p className="text-xs text-muted">You&apos;ll choose UPI, card, netbanking or a wallet on the next page.</p>
          </Summary>
        </div>
      </div>
    </main>
  );
}
