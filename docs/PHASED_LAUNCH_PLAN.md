# WingWake Phased Launch Plan - Fast Track to Revenue

This plan breaks down the MVP into phases, prioritizing the fastest path to generating revenue while maintaining quality.

**⚠️ IMPORTANT**: This project has been migrated from Supabase to Convex. All database operations, authentication, and file storage now use Convex. See `CONVEX_MIGRATION.md` and `CONVEX_SETUP_COMPLETE.md` for details.

## Phase 1: Foundation (Weeks 1-3) - **Critical Path**
**Goal**: Get core system working, no revenue blockers

### Week 1: Database & Basic Infrastructure
- [✅] **COMPLETED**: Migrated from Supabase to Convex database
  - [✅] Convex schema defined (`convex/schema.ts`)
  - [✅] All tables migrated (profiles, organizations, aircraft, ferryFlights, etc.)
  - [✅] Convex queries, mutations, and actions implemented
  - [✅] Database helper functions updated for Convex
  - [✅] Example data seeding script created
- [✅] **COMPLETED**: Authentication migrated to Convex Auth
  - [✅] Convex Auth configured with Password provider
  - [✅] Login/signup pages updated
  - [✅] AuthContext updated to use Convex Auth
  - [✅] Profile sync on authentication
- [✅] Set up Convex file storage (replacing Supabase Storage)
- [✅] Configure environment variables (NEXT_PUBLIC_CONVEX_URL)
- [✅] Basic error handling (global error boundary, toast notifications)

**Deliverable**: Working Convex database with all tables, authentication, and storage

### Week 2: Core Ferry Flight Workflow
- [✅] **COMPLETED**: Convex file storage integration
  - [✅] Document upload actions created
  - [✅] Document download actions created
  - [ ] Test document upload/download end-to-end (runtime test needed)
- [ ] Implement all status transition handlers (using Convex mutations)
- [ ] Add status transition validation (block invalid transitions)
- [ ] Complete "Complete Flight" functionality
- [ ] Basic document categorization

**Deliverable**: Can create and complete a full ferry flight workflow

### Week 3: Essential Features
- [✅] **COMPLETED**: Aircraft creation and management (Convex mutations/queries)
- [✅] **COMPLETED**: Organization creation (Convex mutations/queries)
- [ ] Basic user management (invite users to org) - Update for Convex Auth
- [ ] Missing document warnings (show what's needed)
- [✅] **COMPLETED**: Status history display (audit log queries)

**Deliverable**: Multi-user workflow working

**Total Phase 1: ~15 working days**

---

## Phase 2: Revenue Enablement (Weeks 4-6) - **Revenue Critical**
**Goal**: Enable payments and subscriptions

### Week 4: Payment Integration
- [ ] Set up Stripe account
- [ ] Create subscription plans (Start with 2 plans: Starter & Professional)
- [ ] Add subscription table to database
- [ ] Implement subscription creation flow
- [ ] Payment method collection UI
- [ ] Basic webhook handler (subscription created, updated, canceled)

**Deliverable**: Users can subscribe and pay

### Week 5: Subscription Management
- [ ] Subscription status checks in middleware
- [ ] Billing/payment history page
- [ ] Usage limits (track flights per month)
- [ ] Feature gating (block features if over limit)
- [ ] Upgrade prompts

**Deliverable**: Subscription system fully functional

### Week 6: Pricing & Free Trial
- [ ] Design and build pricing page
- [ ] Add pricing to landing page
- [ ] Implement 14-day free trial
- [ ] Trial expiration handling
- [ ] Usage dashboard (show current usage)

**Deliverable**: Can launch with paying customers

**Total Phase 2: ~15 working days**

---

## Phase 3: Polish & Launch Prep (Weeks 7-9) - **Launch Ready**
**Goal**: Make it production-ready and launch

### Week 7: Essential Notifications & Security
- [ ] Set up email service (Resend recommended - easiest setup)
- [ ] Domain authentication (SPF, DKIM)
- [ ] Critical email notifications:
  - Welcome email
  - Status change notifications (key ones only)
  - Organization invitations
- [ ] Password reset functionality
- [ ] Basic security audit (API authorization, RLS testing)

**Deliverable**: Basic notifications working, security reviewed

### Week 8: Legal, Testing & Deployment
- [ ] Terms of Service (use template, customize)
- [ ] Privacy Policy (use template, customize)
- [ ] Legal page links in footer
- [ ] Terms acceptance during signup
- [ ] Manual testing of complete workflow (Convex operations)
- [ ] Production deployment setup:
  - [ ] Deploy Convex to production (`npx convex deploy`)
  - [ ] Deploy Next.js to Vercel
  - [ ] Configure production environment variables
  - [ ] Test production Convex connection
- [ ] Verify Convex production deployment works correctly

**Deliverable**: Legally compliant, deployed to production

### Week 9: Final Testing & Launch
- [ ] End-to-end testing (all user roles)
- [ ] Browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness testing
- [ ] Payment flow testing (use Stripe test mode)
- [ ] Error scenario testing
- [ ] Performance optimization (critical queries only)
- [ ] Basic monitoring setup (Vercel Analytics, Sentry)
- [ ] Launch announcement preparation

**Deliverable**: Ready to launch

**Total Phase 3: ~15 working days**

---

## Phase 4: Post-Launch Improvements (Weeks 10-12) - **Iterate Based on Feedback**
**Goal**: Improve based on real user feedback

### Week 10: User Feedback & Quick Wins
- [ ] Set up support email/system
- [ ] Create contact/support page
- [ ] Gather user feedback
- [ ] Fix critical bugs found in production
- [ ] Improve error messages based on user issues

### Week 11: Enhanced Notifications
- [ ] Complete all email notification types
- [ ] Permit expiration warnings
- [ ] SLA breach alerts
- [ ] Email preferences page
- [ ] Digest emails (optional)

### Week 12: UX Improvements
- [ ] Onboarding wizard (if users struggle)
- [ ] Better empty states
- [ ] Improved tooltips/help text
- [ ] PDF viewer for documents
- [ ] Document preview improvements

**Total Phase 4: ~15 working days**

---

## Phase 5: Advanced Features (Post-MVP) - **Competitive Advantage**
**Goal**: Add features that differentiate from competitors

- [ ] Automated FAA form 8130-6 generation
- [ ] SLA timers in UI ("Waiting on FAA for 5 days")
- [ ] Advanced analytics dashboard
- [ ] Multi-leg ferry flight support
- [ ] Pilot currency tracking
- [ ] Insurance policy management
- [ ] Smart checklists

---

## Revenue Timeline Comparison

### Original MVP Plan
- **Revenue Start**: Week 8-10 (after all features complete)
- **Launch**: Week 12-16
- **First Payment**: Week 12-16

### Phased Launch Plan
- **Revenue Start**: Week 6 (can accept payments)
- **Launch**: Week 9
- **First Payment**: Week 6-9 (beta customers)

**Time to Revenue: 6 weeks faster!**

---

## Phase 1-3 Critical Path (Weeks 1-9)

### Must-Have for Launch (Cannot Skip)
1. ✅ **COMPLETED**: Database migrations (Convex schema)
2. ✅ **COMPLETED**: Authentication (Convex Auth)
3. ✅ Core ferry flight workflow (using Convex)
4. ✅ Document upload/download (Convex file storage)
5. [ ] Payment/subscription system
6. [ ] Basic email notifications
7. [ ] Legal pages (Terms, Privacy)
8. [ ] Security audit (basic) - Review Convex Auth permissions
9. [ ] Production deployment (Convex + Vercel)
10. [ ] End-to-end testing (Convex-specific tests)

### Can Defer to Phase 4 (Post-Launch)
- ❌ Advanced onboarding wizard (can use simple guide)
- ❌ All email notification types (start with critical ones)
- ❌ Email preferences page (add later)
- ❌ Comprehensive automated testing (manual testing first)
- ❌ Advanced analytics
- ❌ Multi-org switching (single org per user for MVP)
- ❌ Video tutorials (add based on user needs)
- ❌ Advanced search/filtering
- ❌ PDF preview (basic download is fine)

---

## Week-by-Week Breakdown

### Week 1: Foundation
**Focus**: Database and infrastructure
- ✅ **COMPLETED**: Convex migration (schema, queries, mutations, actions)
- ✅ **COMPLETED**: Convex Auth setup and integration
- ✅ **COMPLETED**: Convex file storage setup
- [ ] Test all Convex operations end-to-end
- [ ] Verify data seeding works correctly
- [ ] Test authentication flow completely

**Blockers**: None - foundation is complete, focus on testing and refinement

### Week 2: Core Workflow
**Focus**: Ferry flight workflow completion
- Days 1-2: Document upload/download
- Days 3-4: Status transitions and validation
- Day 5: Complete flight functionality

**Blockers**: Requires Week 1 complete

### Week 3: Essential Features
**Focus**: Multi-user support
- Days 1-2: Aircraft management
- Days 2-3: Organization and user management
- Day 4: Missing document warnings
- Day 5: Status history display

**Blockers**: Requires Week 1-2 complete

### Week 4: Payment Setup
**Focus**: Stripe integration
- Days 1-2: Stripe account, plans, database schema
- Days 3-4: Subscription creation flow
- Day 5: Payment method UI

**Blockers**: None - can work in parallel with Week 3

### Week 5: Subscription Logic
**Focus**: Usage limits and gating
- Days 1-2: Webhook handler, middleware checks
- Days 3-4: Usage tracking and limits
- Day 5: Billing page

**Blockers**: Requires Week 4 complete

### Week 6: Pricing & Trial
**Focus**: Revenue enablement
- Days 1-2: Pricing page design and build
- Days 3-4: Free trial implementation
- Day 5: Usage dashboard

**Blockers**: Requires Week 5 complete
**Milestone**: 🎉 **CAN ACCEPT PAYMENTS**

### Week 7: Notifications & Security
**Focus**: Production readiness
- Days 1-2: Email service setup, critical notifications
- Days 3-4: Security audit, password reset
- Day 5: Testing notifications

**Blockers**: None - can work in parallel

### Week 8: Legal & Deployment
**Focus**: Launch preparation
- Days 1-2: Legal pages (use templates)
- Days 3-4: Production deployment
- Day 5: Production testing

**Blockers**: Requires previous weeks complete

### Week 9: Final Testing & Launch
**Focus**: Launch readiness
- Days 1-3: Comprehensive testing
- Days 4-5: Performance optimization, monitoring
- End of week: **LAUNCH** 🚀

**Blockers**: Requires all previous weeks complete

---

## Risk Mitigation

### High-Risk Items (Start Early)
1. **Payment Integration** - Start Week 4, test thoroughly
2. ✅ **COMPLETED**: **Database & Auth Migration** - Convex migration complete, test thoroughly
3. **Email Deliverability** - Start Week 7, allow time for DNS propagation
4. **Convex Production Deployment** - Test deployment process early

### Medium-Risk Items
1. **Status Transition Logic** - Complex, test thoroughly with Convex mutations
2. **File Upload Security** - Security critical, review Convex file storage permissions
3. **Production Deployment** - First Convex + Vercel deployment, test thoroughly
4. **Convex Auth Profile Sync** - Ensure profiles sync correctly on signup/login

### Low-Risk Items (Can Defer)
1. Advanced features
2. Comprehensive documentation
3. Video tutorials

---

## Success Metrics by Phase

### Phase 1 (Week 3)
- ✅ **COMPLETED**: Convex database and authentication working
- ✅ Can create and complete a ferry flight (using Convex)
- ✅ Multiple users can collaborate (via Convex Auth)
- ✅ Documents can be uploaded (via Convex file storage)
- [ ] All Convex operations tested end-to-end

### Phase 2 (Week 6)
- ✅ Users can subscribe and pay
- ✅ Usage limits enforced
- ✅ Free trial working

### Phase 3 (Week 9)
- ✅ Production deployment successful
- ✅ Legal compliance in place
- ✅ Security reviewed
- ✅ Ready for public launch

### Phase 4 (Week 12)
- ✅ User feedback incorporated
- ✅ Critical bugs fixed
- ✅ Enhanced notifications

---

## Resource Requirements

### Solo Developer
- **Phase 1-3**: 9 weeks full-time
- **Phase 4**: 3 weeks part-time (while supporting users)
- **Total to Launch**: 9 weeks

### With Help
- **Developer + Designer**: 7-8 weeks (designer helps with UI)
- **2 Developers**: 6-7 weeks (can parallelize more)
- **Developer + QA**: 8 weeks (QA helps with testing)

---

## Launch Strategy

### Week 6: Beta Launch (Soft Launch)
- Invite 5-10 trusted users
- Test payment flow with real customers
- Gather feedback
- Fix critical issues

### Week 9: Public Launch
- Open to public
- Marketing push
- Monitor closely for issues
- Quick response to problems

### Week 10-12: Iterate
- Fix bugs
- Add requested features
- Improve based on feedback
- Scale infrastructure if needed

---

## Key Decisions for Fast Track

1. **Start with 2 subscription plans** (not 3) - Add Enterprise later
2. **Single organization per user** (not multi-org) - Add later if needed
3. **Basic document management** (no preview) - Add preview later
4. **Manual testing first** (not comprehensive automated tests) - Add tests later
5. **Use legal templates** (not custom) - Customize later
6. **Basic email notifications** (not all types) - Add more later
7. **Simple onboarding** (not wizard) - Add wizard if users struggle

## Convex Migration Notes

### ✅ Completed Migration Items
- **Database**: Fully migrated to Convex (schema, queries, mutations, actions)
- **Authentication**: Migrated to Convex Auth with Password provider
- **File Storage**: Migrated to Convex file storage
- **Data Seeding**: Example data seeding script available

### Convex-Specific Considerations
1. **Real-time Updates**: Convex queries automatically update in real-time - no need for manual refresh
2. **Type Safety**: All operations are type-safe via Convex's generated types
3. **No RLS**: Authorization handled in query/mutation logic instead of database policies
4. **Production Deployment**: Requires both Convex deployment (`npx convex deploy`) and Next.js deployment
5. **Environment Variables**: Only need `NEXT_PUBLIC_CONVEX_URL` for basic setup
6. **Testing**: Use Convex dashboard to verify data operations

### Migration Benefits
- ✅ Real-time data synchronization out of the box
- ✅ Type-safe database operations
- ✅ Simplified file storage (no bucket configuration needed)
- ✅ Built-in authentication (no separate auth service)
- ✅ Automatic API generation
- ✅ Better developer experience with hot reloading

---

## Timeline Summary

| Phase | Weeks | Focus | Revenue Status |
|-------|-------|-------|----------------|
| Phase 1 | 1-3 | Foundation & Core Features | ❌ Not ready |
| Phase 2 | 4-6 | Payment & Subscriptions | ✅ **Revenue Ready** |
| Phase 3 | 7-9 | Polish & Launch | ✅ Launch Ready |
| Phase 4 | 10-12 | Post-Launch Improvements | ✅ Iterating |
| Phase 5 | 13+ | Advanced Features | ✅ Scaling |

**Fastest Path to Revenue: 6 weeks**
**Fastest Path to Launch: 9 weeks**

---

## Next Steps

1. ✅ **COMPLETED**: Database and authentication foundation
2. **Test Convex operations** - Verify all CRUD operations work correctly
3. **Set up Stripe account** - Can do in parallel (Week 4)
4. **Choose email provider** - Research Resend vs SendGrid (Week 7)
5. **Prepare legal templates** - Find ToS/Privacy templates (Week 7)
6. **Line up beta users** - Find 5-10 people to test (Week 6)
7. **Test Convex Auth flow** - Verify signup/login/profile sync works
8. **Test file uploads** - Verify Convex file storage works end-to-end

**Foundation complete! Ready to proceed with Week 2-3 features.** 🚀
