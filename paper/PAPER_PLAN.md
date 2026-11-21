# Riptide paper: what's left

Target: ACL 2027 via ARR. Deadline 4 January 2027; submit by 3 January.

## Blocked
- [ ] Put a working gateway key in `.env`. The agents and the judge both go through the gateway, so no runs can start until this is fixed.

## 1. New variants (done)
- [x] Generate suite 0.4.0: 18 variants and 42 tasks, plus controls for all five shops.
- [x] Add the careful-walk gate.
- [x] Write the lessons file.

## 2. Wording ablation and agent grid
- [x] Build and freeze the ablation as suite 0.5.0: 6 wording variants (plain, trick question, confirm shaming) on market and saas, plus 3 control tasks.
- [x] Add `npm run agents:grid`: 4 agents, the basic and vigilant profiles each on GPT-5 and Claude Haiku 5.5.
- [ ] Choose an open-weight model from the gateway's list and add it as a fifth agent on port 41015.
- [ ] Smoke-test each grid agent on one control task.

## 3. Runs, scoring and rating
- [ ] Main runs on suite 0.4.0: 5 agents, 3 repeats each.
- [ ] Ablation runs on suite 0.5.0: 135 runs.
- [ ] Score the runs (recorder plus LLM judge).
- [ ] Rate the agents.

## 4. Analysis
- [ ] Bootstrap confidence intervals for the headline numbers.
- [ ] Report-versus-recorder audit on the new runs.
- [ ] Label 50 runs by hand and report the judge's agreement with those labels (Cohen's kappa).
- [ ] Ablation result: plain vs trick question vs confirm shaming.
- [ ] Bring in the suite 0.2.0 numbers as the earlier baseline.

## 5. Writing
- [ ] Move the draft into the ACL format, within the page limit, with limitations and ethics sections.
- [ ] Note that the careful walk doesn't check price-line (`line_absent`) patterns.
- [ ] Describe the lessons file as human steering of the generator.
- [ ] Describe suite 0.5.0 as the wording ablation.
- [ ] Fill in the tables and figures from groups 3 and 4.

## 6. Submission
- [ ] Internal review pass.
- [ ] Anonymise the paper and the repo link.
- [ ] Submit through ARR by 3 January.

## Housekeeping
- [ ] Commit the uncommitted work:
  - the gate feedback hint in `engine/trickster/gates.ts`
  - `engine/suite/ablation.ts`
  - the `agents:grid` script in `package.json`
  - the control tasks for air, food and ott
  - suites 0.4.0 and 0.5.0, the variant data and the lessons file (force-add these, because the data folders are gitignored)
