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
  const [handling, setHandling] = useLineToggle("handling");
  const optDefault = useSlotDefault<boolean>("review.optin.marketing", false);
  const optin = s.optin ?? optDefault;

  if (!hydrated) return <main data-riptide-step="review" className="ps-wrap py-8"><Steps current="review" /><Skeleton h={420} className="mt-8" /></main>;
  if (!s.plan || !s.term) return <main data-riptide-step="review" className="ps-wrap py-8"><Steps current="review" /><div className="mt-8"><NoPlan /></div></main>;

  const trial = s.mode === "trial";
  const seats = s.plan === "team" ? (s.seats ?? 2) : 1;
  const recurring = price.lines.filter((l) => l.selected && l.kind !== "discount").reduce((t, l) => t + l.amount, 0);
  const chargeText = `${formatINR(recurring)} incl. GST`;
  const st = STORAGE_PRICE;
  const tries = s.checkTries ?? 0;
  const blocked = trial && tries < 2;

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

          {trial && (
            <Slot id="review.verify.card" as="section" className="ps-panel p-6" aria-label="Card check">
              <p className="ps-eyebrow">Trial activation</p>
              <h2 className="mt-2 text-xl font-bold">Verify your card (₹0 hold)</h2>
              {tries === 0 && <p className="mt-2 text-sm text-muted">We place a ₹0 hold to confirm your card before the trial starts.</p>}
              {tries === 1 && (
                <p className="mt-2 text-sm">We couldn&apos;t verify your card for the trial (code PG-504, gateway timeout). Paid plans don&apos;t need this check. You can also try the check again.</p>
              )}
              {tries >= 2 && <p className="mt-2 text-sm">Card verified. You can continue.</p>}
              {tries < 2 && (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <SlotButton id="review.verify.switch" variant="primary" onClick={() => set({ mode: "buy" })}>Start paid plan now</SlotButton>
                  <SlotButton id="review.verify.retry" variant="muted" onClick={() => set({ checkTries: tries + 1 })}>{tries === 0 ? "Verify card" : "Try again"}</SlotButton>
                </div>
              )}
            </Slot>
          )}

          <Slot id="review.upsell.storage" as="section" className="ps-panel p-6" aria-label="Plan extras">
            <p className="ps-eyebrow">Included with your order</p>
            <h2 className="mt-2 text-xl font-bold">Stock assets &amp; +1 TB cloud storage</h2>
            <p className="mt-2 text-sm text-muted">
              120,000 licensed photos, vectors and video clips inside every app, plus an extra 1 TB of Prism Cloud.
              {` ${formatINR(st)}/mo + ${formatINR(gstOf(st))} GST`}{termById(s.term)?.id === "annual-prepaid" ? ", billed yearly with your plan" : ", billed with your plan"}. Remove it any time from Account.
            </p>
            {trial ? (
              <p className="mt-4 text-sm">Add-ons aren&apos;t part of the free trial. You can add this from Account after your first payment.</p>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <SlotButton id="review.upsell.add" variant="primary" aria-pressed={storage} onClick={() => setStorage(true)}>{storage ? "✓ Included (recommended)" : "Add to plan"}</SlotButton>
                <SlotButton id="review.upsell.decline" variant="muted" className="!text-xs !px-1 underline text-muted" aria-pressed={!storage} onClick={() => setStorage(false)}>No, thanks</SlotButton>
                <span className="text-sm text-muted">{storage ? "Included. Priced in your order summary." : "Not included."}</span>
              </div>
            )}
          </Slot>

          <section className="ps-panel p-6">
            <Slot id="review.optin.marketing" as="label" className="rt-check">
              <input type="checkbox" checked={optin} onChange={(e) => set({ optin: e.target.checked })} />
              <span>Send me tutorials, product news and offers by email. You can unsubscribe at any time.</span>
            </Slot>
          </section>
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Summary step="review">
            {blocked
              ? <Slot id="review.cta.continue" as="button" type="button" disabled className="rt-btn mt-2 w-full" variant="primary">Continue to payment</Slot>
              : <Slot id="review.cta.continue" as={Link} href={flow.next("review")} className="rt-btn mt-2 w-full" variant="primary">Continue to payment</Slot>}
            {handling && !trial && (
              <p className="text-xs text-muted">Licence activation &amp; handling is charged once per order.{" "}
                <SlotButton id="review.handling.remove" variant="muted" className="!inline !p-0 !min-h-0 !text-xs underline" onClick={() => setHandling(false)}>Remove</SlotButton>
              </p>
            )}
            <p className="text-xs text-muted">You&apos;ll choose UPI, card, netbanking or a wallet on the next page.</p>
          </Summary>
        </div>
      </div>
    </main>
  );
}
