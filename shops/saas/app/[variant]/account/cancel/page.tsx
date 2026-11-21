"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Slot, SlotButton, formatINR, useFlow, useSession, useSlotDefault } from "@riptide/core";
import { TODAY, accessUntil, fmtDate, nextBillingDate, planLabel, refundInfo, termById } from "@/catalog";
import type { SaasState } from "@/shop.config";
import { Crumbs, Skeleton, chargeOf, useHydrated, useQuote } from "@/components/ui";

const REASONS = ["It's too expensive", "I'm not using it enough", "I'm switching to another tool", "My project has finished", "Something else"];

/** Cancel flow: optional reason → confirm, on one screen. Account → "Cancel plan" → "Cancel plan" = 2 clicks. */
export default function Cancel() {
  const [s, set] = useSession<SaasState>();
  const hydrated = useHydrated();
  const flow = useFlow("cancel");
  const router = useRouter();
  const sub = s.sub;
  const charge = chargeOf(useQuote(sub, "payment"));
  const defReason = useSlotDefault<string>("account.cancel.reason", "");
  const [reason, setReason] = useState<string | null>(null);
  const picked = reason ?? defReason;
  const accountHref = flow.href(flow.steps[0].path);

  if (!hydrated) return <main data-riptide-step="cancel" className="ps-wrap py-8"><Skeleton h={420} /></main>;
  if (sub.status !== "active") {
    return (
      <main data-riptide-step="cancel" className="ps-wrap max-w-2xl py-12">
        <h1 className="text-3xl font-extrabold">This plan is already cancelled</h1>
        <p className="mt-3 text-muted">You keep access until {fmtDate(accessUntil(sub))}. Nothing more will be charged.</p>
        <Link href={accountHref} className="rt-btn mt-6" data-variant="secondary">Back to account</Link>
      </main>
    );
  }
  const r = refundInfo(sub, charge);

  const acceptOffer = () => {
    set({ retention: true, sub: { ...sub, term: "annual-monthly", startedOn: TODAY } });
    router.push(accountHref);
  };

  const confirm = () => {
    set({ sub: { ...sub, status: "cancelled", cancelledOn: TODAY, reason: picked || undefined, scheduled: undefined } });
    router.push(flow.next("cancel"));
  };

  return (
    <main data-riptide-step="cancel" className="ps-wrap py-8">
      <Crumbs items={[["Account", accountHref], ["Cancel plan"]]} />
      <div className="mx-auto mt-6 max-w-2xl">
        <h1 className="text-4xl font-extrabold">Cancel {planLabel(sub)}?</h1>
        <p className="mt-2 text-muted">{termById(sub.term)?.name} · cancelling takes effect as soon as you confirm below.</p>

        <Slot id="account.cancel.summary" as="section" className="ps-panel mt-6 p-6" aria-label="What happens when you cancel">
          <h2 className="text-lg font-bold">What happens</h2>
          <ul className="mt-3 flex flex-col gap-2 text-[0.95rem]">
            <li>• Your plan stops renewing: the {formatINR(charge)} payment due on {fmtDate(nextBillingDate(sub))} won&apos;t be taken{r.fee ? ", and the only further charge is the one-time fee below" : ", and nothing more is charged"}.</li>
            <li>• You keep access to the apps until <b>{r.refund > 0 ? fmtDate(TODAY) : fmtDate(accessUntil(sub))}</b>.</li>
            <li>• Your files stay on your devices. Prism Cloud files stay downloadable for 90 days.</li>
          </ul>
        </Slot>

        <Slot id="cancel.offer.card" as="section" className="ps-panel mt-6 border-2 border-accent p-6" aria-label="Before you go">
          <p className="ps-eyebrow">Before you go</p>
          <h2 className="mt-1 text-xl font-bold">Creators who stay keep their work moving. Take 50% off for 3 months.</h2>
          <div className="mt-4">
            <SlotButton id="cancel.offer.accept" variant="primary" className="w-full" onClick={acceptOffer}>Stay and save 50%</SlotButton>
          </div>
          <Slot id="cancel.offer.terms" as="p" className="mt-3 text-[0.7rem] leading-snug text-muted">
            Offer moves your plan to Annual, billed monthly: a new 12-month commitment starting today, then the standard rate. Early-termination fee applies after that. To carry on cancelling, use Cancel plan below.
          </Slot>
        </Slot>

        <Slot id="account.cancel.refund" as="p" className="mt-4 rounded-[var(--rt-radius-sm)] border-l-4 border-accent bg-surface p-4 text-[0.95rem] leading-relaxed">
          {r.text}
        </Slot>

        <Slot id="account.cancel.reason" as="fieldset" className="ps-panel mt-6 p-6">
          <legend className="sr-only">Reason for cancelling (optional)</legend>
          <p className="font-semibold">Why are you cancelling? <span className="font-normal text-muted">(optional)</span></p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {REASONS.map((x) => (
              <label key={x} className="rt-check"><input type="radio" name="reason" value={x} checked={picked === x} onChange={() => setReason(x)} /><span>{x}</span></label>
            ))}
          </div>
        </Slot>

        <Slot id="account.cancel.actions" className="mt-6 grid gap-3 sm:grid-cols-2">
          <SlotButton id="account.cancel.keep" as={Link} href={accountHref} variant="secondary">Keep plan</SlotButton>
          <SlotButton id="account.cancel.confirm" variant="secondary" onClick={confirm}>Cancel plan</SlotButton>
        </Slot>
        <p className="mt-2 text-xs text-muted">I don&apos;t mind losing my discount: Cancel plan ends access as described above.</p>
      </div>
    </main>
  );
}
