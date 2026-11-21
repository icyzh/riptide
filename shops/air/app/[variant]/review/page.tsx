"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Slot, SlotButton, formatINR, useFlow, useHydrated, useLineToggle, usePrice, useSession } from "@riptide/core";
import { ADDONS, FARES, cityById, cityName, dur, fmtDate, hhmm, seatPrice, type AddonKey } from "@/lib/air";
import { BookingShell, FlightLine, Loading, NeedEarlier } from "@/components/Booking";
import { paxCount, segmentsOf, type AirState } from "@/shop.config";

export default function Review() {
  const [st, setSt] = useSession<AirState>();
  const [handlingOn, setHandling] = useLineToggle("handling");
  const [keptSaver, setKept] = useState(false);
  const hydrated = useHydrated();
  const router = useRouter();
  const flow = useFlow("purchase");
  const price = usePrice("review");
  if (!hydrated) return <Loading step="review" />;
  const segs = segmentsOf(st);
  if (!segs.length) return <NeedEarlier step="review" what="Choose a flight first" href={flow.href("results")} />;
  const n = paxCount(st.search);
  const fare = st.fare ?? "saver";
  const F = FARES[fare];
  const addons = (Object.keys(ADDONS) as AddonKey[]).filter((k) => price.lines.some((l) => l.key === k && l.selected));
  const name = (i: number) => (st.pax[i] ? `${st.pax[i].title} ${st.pax[i].first} ${st.pax[i].last}` : `Traveller ${i + 1} (details not added)`);

  return (
    <BookingShell step="review">
      <header className="sk-pagehead">
        <h1 className="sk-h1">Review your trip</h1>
        <p className="sk-muted">Check everything below. Nothing is charged until you pay on the next page.</p>
      </header>
      <Slot id="review.itinerary.panel" as="section" className="sk-card sk-review" aria-label="Itinerary">
        <h2 className="sk-h3">Itinerary · {F.name}</h2>
        {segs.map(([seg, f]) => {
          const a = cityById(f.from)!, b = cityById(f.to)!;
          return (
            <div key={seg} className="sk-review__seg">
              <p className="sk-eyebrow">{seg === "out" ? "Outbound" : "Return"} · {fmtDate(f.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              <FlightLine f={f} />
              <p className="sk-muted">
                <span className="sk-mono">{f.number}</span> · {f.aircraft} · {dur(f.duration)} · departs {hhmm(f.dep)} from {a.airport} ({a.terminal}), arrives {b.airport} ({b.terminal})
              </p>
              <ul className="sk-review__pax">
                {Array.from({ length: n }, (_, i) => {
                  const seat = st.seats[`${seg}:${i}`];
                  return <li key={i}><span>{name(i)}</span><span>{seat ? `Seat ${seat}${seatPrice(seat, fare) ? ` (${formatINR(seatPrice(seat, fare))})` : " (free)"}` : "Seat assigned free at check-in"}</span></li>;
                })}
              </ul>
            </div>
          );
        })}
        <div className="sk-review__cols">
          <div>
            <h3 className="sk-h4">Fare rules · {F.name}</h3>
            <dl className="sk-dl">
              <div><dt>Baggage</dt><dd>{F.cabin}; {F.checkin} per traveller</dd></div>
              <div><dt>Changes</dt><dd>{F.change}</dd></div>
              <div><dt>Cancellation</dt><dd>{F.cancel}</dd></div>
            </dl>
          </div>
          <div>
            <h3 className="sk-h4">Add-ons</h3>
            {addons.length ? <ul>{addons.map((k) => <li key={k}>{ADDONS[k].title}</li>)}</ul> : <p className="sk-muted">None added.</p>}
            <h3 className="sk-h4">Contact</h3>
            <p className="sk-muted">{st.contact?.email || "Not added"} · {st.contact?.phone ? `+91 ${st.contact.phone}` : ""}</p>
            <p className="sk-muted">Offers by email: {st.optin ? "Yes" : "No"}</p>
          </div>
        </div>
        <p className="sk-fine"><Link href={flow.href("passengers")} className="rt-link">Edit travellers</Link> · <Link href={flow.href("seats")} className="rt-link">Edit seats</Link> · <Link href={flow.href("addons")} className="rt-link">Edit add-ons</Link> · {segs.map(([, f]) => `${cityName(f.from)} → ${cityName(f.to)}`).join(" · ")}</p>
      </Slot>
      {fare === "saver" && (
        <Slot id="review.fare.notice" as="section" className="sk-card" aria-label="Fare confirmation">
          <h2 className="sk-h3">Saver fare: confirmation pending</h2>
          <p className="sk-muted">Saver seats on this itinerary are nearly gone and the fare may be re-priced at payment. Lock your fare now with Flexi, which also includes free changes.</p>
          <div className="sk-addon__btns">
            <SlotButton id="review.fare.switch" variant="primary" onClick={() => setSt({ fare: "flexi" })}>Lock fare with Flexi</SlotButton>
            <SlotButton id="review.fare.keep" variant="tiny" onClick={() => setKept(true)}>Keep Saver</SlotButton>
          </div>
          {keptSaver && <p className="sk-fine">Saver kept. The fare is shown in the fare summary.</p>}
        </Slot>
      )}
      <Slot id="review.price.details" as="details" className="sk-fine">
        <summary>Price details</summary>
        <p>Secure booking &amp; payment handling: {handlingOn ? formatINR(99 * n) : "removed"}.{" "}
          {handlingOn && <SlotButton id="review.handling.remove" variant="link" onClick={() => setHandling(false)}>Remove</SlotButton>}
        </p>
      </Slot>
      <Slot id="review.terms.text" as="p" className="sk-fine">
        By continuing you accept the fare rules for your fare family and the Terms of carriage.
      </Slot>
      <div className="sk-actions">
        <SlotButton id="review.cta.continue" variant="primary" onClick={() => router.push(flow.next("review"))}>Continue to payment</SlotButton>
      </div>
    </BookingShell>
  );
}
