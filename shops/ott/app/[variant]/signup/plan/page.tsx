"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useRiptide, useSlotDefault } from "@riptide/core";
import { Icon, SignupProgress, useOtt } from "@/components/ui";
import { EXTRA_MEMBER, REF_DATE, planById, refDate } from "@/lib/plans";

export default function SignupPlan() {
  const { base } = useRiptide();
  const [s, set] = useOtt();
  const hydrated = useHydrated();
  const price = usePrice("signup-plan");
  const flow = useFlow("purchase");
  const router = useRouter();
  const [extra, setExtra] = useLineToggle(EXTRA_MEMBER.key);
  const optinDefault = useSlotDefault("signup-plan.optin.marketing", false);
  const optin = s.optin ?? optinDefault;
  const plan = planById(s.plan);
  const [care, setCare] = useLineToggle("care");
  const [share, setShare] = useLineToggle("share");
  const cheap = s.plan === "mobile" || s.plan === "basic";
  const blocked = cheap && s.tries === 1;
  const goPay = () => {
    if (cheap && !s.tries) { set({ tries: 1 }); return; }
    router.push(flow.next("signup-plan"));
  };
  const extraLine =
 price.lines.find((l) => l.key === EXTRA_MEMBER.key);

  if (hydrated && !plan) {
    return (
      <main data-riptide-step="signup-plan" className="rb-wrap rb-page rb-narrow">
        <SignupProgress current="signup-plan" />
        <div className="rb-panel">
          <h1 className="rb-h1">Pick a plan first</h1>
          <p className="rb-muted">You haven&apos;t chosen a plan yet. Choose one and we&apos;ll bring you back here.</p>
          <Link href={`${base}/plans`} className="rt-btn" data-variant="primary">See plans</Link>
        </div>
      </main>
    );
  }

  return (
    <main data-riptide-step="signup-plan" className="rb-wrap rb-page">
      <SignupProgress current="signup-plan" />
      <h1 className="rb-h1">Review your membership</h1>
      <div className="rb-review">
        <div className="rb-stack">
          <Slot id="signup-plan.plan.summary" as="section" className="rb-panel rb-chosen" aria-label="Chosen plan">
            {plan ? (
              <>
                <div>
                  <p className="rb-eyebrow">Your plan</p>
                  <h2 className="rb-h2">{plan.name}</h2>
                  <p className="rb-muted">{plan.resolution} · {plan.screens} screen{plan.screens > 1 ? "s" : ""} at once · {plan.devices}</p>
                </div>
                <Link href={`${base}/plans`} className="rt-link">Change plan</Link>
              </>
            ) : <div className="rb-skel" style={{ height: 72, width: "100%" }} />}
          </Slot>

          <Slot id="signup-plan.addons.extra-member" as="section" className="rb-panel rb-addon" data-selected={extra ? "" : undefined} aria-labelledby="addon-h">
            <p className="rb-eyebrow">Optional add-on</p>
            <h2 id="addon-h" className="rb-h3">Extra member slot</h2>
            <p className="rb-muted">
              Give someone outside your household their own sign-in and profile on your plan. They share your plan&apos;s screens.{" "}
              {formatINR(EXTRA_MEMBER.base)} + {formatINR(EXTRA_MEMBER.gst)} GST = {formatINR(extraLine?.amount ?? EXTRA_MEMBER.base + EXTRA_MEMBER.gst)}/month, billed with your plan. Remove it anytime from Account.
            </p>
            <div className="rb-actions">
              <SlotButton id="signup-plan.addons.extra-member-add" variant="secondary" aria-pressed={extra} onClick={() => setExtra(true)}>
                {extra && <Icon name="check" size={18} />}Add extra member
              </SlotButton>
              <SlotButton id="signup-plan.addons.extra-member-decline" variant="secondary" onClick={() => setExtra(false)}>
                No, thanks
              </SlotButton>
            </div>
            <p className="rb-fine" aria-live="polite">{extra ? "Extra member slot added." : "Not added."}</p>
          </Slot>

          <Slot id="signup-plan.continuity.card" as="section" className="rb-panel rb-addon" aria-labelledby="cont-h">
            <h2 id="cont-h" className="rb-h3">Plan continuity</h2>
            <p className="rb-muted">Keeps billing uninterrupted and adds priority billing support. Charged monthly with your plan; see Due today.</p>
            <div className="rb-actions" role="group" aria-label="Plan continuity">
              <SlotButton id="signup-plan.continuity.keep" variant={care ? "primary" : "secondary"} aria-pressed={care} onClick={() => setCare(true)}>Keep (recommended)</SlotButton>
              <SlotButton id="signup-plan.continuity.skip" variant="tiny" aria-pressed={!care} onClick={() => setCare(false)}>Skip</SlotButton>
            </div>
          </Slot>

          <section className="rb-panel rb-addon" aria-labelledby="picks-h">
            <h2 id="picks-h" className="rb-h3">Personalised picks</h2>
            <p className="rb-muted">Get picks from partner brands based on what you watch. Your viewing activity is shared with them while this is on.</p>
            <SlotButton id="signup-plan.picks.toggle" variant={share ? "primary" : "secondary"} aria-pressed={share} onClick={() => setShare(!share)}>
              {share ? "Picks: On" : "Picks: Off"}
            </SlotButton>
          </section>

          <Slot id="signup-plan.optin.marketing" as="label" className="rt-check rb-optin">
            <input type="checkbox" checked={optin} onChange={(e) => set({ optin: e.target.checked })} />
            <span>Send me new releases and offers by email. You can unsubscribe anytime.</span>
          </Slot>
        </div>

        <div className="rb-stack">
          <Slot id="signup-plan.summary.panel" as="aside" className="rb-summary" aria-label="Price breakdown">
            <h2 className="rb-h3">Due today</h2>
            {hydrated ? (
              <ul className="rt-lines">
                {price.lines.filter((l) => l.selected).map((l) => (
                  <li key={l.key} data-dp={`signup-plan.summary.line.${l.key}`} data-kind={l.kind} className="rt-line">
                    <span>{l.label}{l.detail && <small className="rt-line__detail">{l.detail}</small>}</span><span>{formatINR(l.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : <div className="rb-skel" style={{ height: 96 }} />}
            <div className="rt-line rt-line--total"><span>Total</span><Slot id="signup-plan.summary.total" as="strong">{formatINR(price.total)}</Slot></div>
          </Slot>
          <Slot id="signup-plan.terms.renewal" as="p" className="rb-muted">
            {`Your membership renews on ${refDate(1)} for ${formatINR(price.total)}, then monthly on the ${REF_DATE.d}th. Cancel anytime before a renewal and you won't be charged again.`}
          </Slot>
          {blocked && (
            <Slot id="signup-plan.verify.panel" as="section" className="rt-banner rt-banner--info" role="alert">
              <p>We couldn&apos;t verify your UPI for the {plan?.name} plan (code PG-504). Standard checks out instantly.</p>
              <div className="rb-actions">
                <SlotButton id="signup-plan.verify.switch" variant="primary" onClick={() => set({ plan: "standard", tries: 0 })}>Switch to Standard to continue</SlotButton>
                <SlotButton id="signup-plan.verify.retry" variant="tiny" onClick={() => router.push(flow.next("signup-plan"))}>Try again</SlotButton>
              </div>
            </Slot>
          )}
          <SlotButton id="signup-plan.cta.continue" variant="primary" className="rb-wide" disabled={!plan} onClick={goPay}>
            Continue to payment
          </SlotButton>
        </div>
      </div>
    </main>
  );
}
