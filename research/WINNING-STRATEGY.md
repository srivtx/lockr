# How to Win: Superteam India × Dodo Payments Track

## The Prize Breakdown

| Place | Prize |
|-------|-------|
| 1st | 5,000 USDG |
| 2nd | 3,000 USDG |
| 3rd | 2,000 USDG |
| **Total** | **10,000 USDG** |

- **Deadline:** Submissions close May 11, 2026
- **Winners announced:** May 26, 2026
- **Region:** India only
- **Current submissions:** 31 (as of early May)

---

## What Dodo Payments Wants to See

Dodo Payments is sponsoring this track because they want real-world payment solutions built on their platform. They're looking for:

### 1. Deep Dodo Integration (Critical)
- **Webhook handling** — Properly receiving and verifying Dodo payment events
- **Checkout flow** — Clean, working payment creation and redirects
- **Product/catalog integration** — Using Dodo products, not just one-off payments
- **Error handling** — Graceful failure states when payments fail or are refunded

### 2. Real-World Problem Solving
- Does this solve an actual pain point?
- Is the market large enough?
- Would someone actually use this today?

### 3. Solana-Native Architecture
- Using Solana for what it's good at (speed, cost, programmability)
- Not just "crypto for crypto's sake"
- Smart contract security and proper PDA design

### 4. Complete Product (Not Just a Demo)
- Working end-to-end flow
- Clean UI/UX
- Mobile responsive
- Error states handled
- Documentation

---

## How LOCKR Checks Every Box

### Deep Dodo Integration ✅
- [x] Webhook handler at `/api/webhooks/dodo` with signature verification
- [x] Dodo checkout creation with real product ID (`pdt_0Ne8Ouzmy9Kxj6snrcCj3`)
- [x] Payment status synced to escrow state
- [x] Webhook secret properly configured (`DODO_WEBHOOK_KEY`)

### Real-World Problem ✅
- [x] $3.2B annual loss to Indian freelancers from payment delays
- [x] 15M+ freelancers in India
- [x] Existing platforms charge 5-20% and hold funds for weeks
- [x] International clients want card payments; freelancers want crypto

### Solana-Native ✅
- [x] Sub-second settlement
- [x] $0.001 transaction cost
- [x] Program-owned escrow PDA (non-custodial)
- [x] Milestone-based fund release
- [x] Auto-created token accounts for freelancers

### Complete Product ✅
- [x] Live deployed app: https://lockr.srivtx.tech
- [x] End-to-end flow tested: create → pay → deliver → approve → release
- [x] Email notifications via Resend
- [x] Mobile responsive design
- [x] Video demo: https://vimeo.com/1191304055
- [x] Professional README with architecture docs

---

## Submission Checklist

Before submitting, verify:

### Technical
- [ ] Smart contract deployed and verified on devnet
- [ ] Frontend loads without errors
- [ ] Dodo checkout creates successfully
- [ ] Webhook fires and funds escrow
- [ ] Milestone delivery triggers email
- [ ] Client approval releases USDC
- [ ] Mobile works (no video background, proper spacing)

### Presentation
- [ ] Video demo under 3 minutes
- [ ] Shows the problem and solution
- [ ] Shows the Dodo integration clearly
- [ ] Shows the Solana transaction

### Documentation
- [ ] README explains the problem
- [ ] README shows architecture
- [ ] README has setup instructions
- [ ] Code is commented where needed

---

## Winning Strategy

### 1. Emphasize the Dodo Integration
This is a Dodo-sponsored track. Make sure the judges see:
- The webhook handling code
- The checkout creation flow
- How fiat becomes USDC on-chain

### 2. Show Real Transactions
Don't just show UI screenshots. Show:
- The actual Solana transaction signature
- The Dodo payment confirmation
- The email the client receives

### 3. Highlight the Indian Market
This is Superteam India. Emphasize:
- India-specific problem (UPI, INR payments)
- Market size (15M freelancers)
- Local relevance (international clients, payment delays)

### 4. Demonstrate Completeness
31 submissions means competition. Stand out by showing:
- A polished, production-ready UI
- Full error handling
- Working email system
- Clean code architecture

### 5. Tell a Story
Judges see dozens of submissions. Make yours memorable:
- Start with the freelancer's pain
- Show the old way (chasing invoices)
- Show the new way (LOCKR)
- End with the transaction receipt

---

## Common Mistakes to Avoid

1. **Weak Dodo integration** — Just using Dodo as a payment button without webhooks or proper handling
2. **No real problem** — Building something that looks cool but solves nothing
3. **Broken demo** — Submitting without testing the full flow
4. **No documentation** — Judges can't figure out what you built
5. **Generic submission** — Not tailoring the pitch to the Payments track

---

## Key Files to Highlight in Submission

```
app/api/webhooks/dodo/route.ts       # Dodo webhook handler
app/api/escrow/[id]/checkout/route.ts # Dodo checkout creation
programs/trustlock/src/lib.rs         # Anchor escrow program
app/page.tsx                          # Landing page with video
README.md                             # Full documentation
```

---

## Final Tips

- Submit early — don't wait for the last minute
- Test the demo video on multiple devices
- Make sure the deployed app is actually working
- Double-check all env vars on Vercel
- Have a backup plan if the demo site goes down

Good luck. We're already ahead of most submissions with a working product.
