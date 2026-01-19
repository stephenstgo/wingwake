# MVP Time Estimate - Working Days Breakdown

## Assumptions
- **Working day**: 8 hours of focused development
- **Solo developer** (can be reduced with team)
- **Experienced full-stack developer** familiar with Next.js, Convex, Stripe
- **Some tasks can be parallelized** (e.g., documentation while testing)
- **Testing happens iteratively**, not just at the end

## Detailed Breakdown by Category

### 1. Database & Infrastructure: **8-10 working days**

| Task | Days | Notes |
|------|------|-------|
| Create 4 migration files (schema, RLS, triggers, storage) | 3-4 | Complex SQL, needs careful testing |
| Environment configuration & documentation | 0.5 | Quick setup |
| Convex file storage setup & testing | 1-1.5 | Authorization, testing uploads |
| File cleanup implementation | 0.5 | Background job logic |
| Testing migrations on fresh DB | 1 | Critical - must work perfectly |
| Documentation & rollback procedures | 0.5 | Important for production |
| **Subtotal** | **6.5-8** | |
| **Buffer (20%)** | **1.5-2** | For unexpected issues |
| **Total** | **8-10 days** | |

### 2. Core Functionality Completion: **20-25 working days**

| Task | Days | Notes |
|------|------|-------|
| **Document Management** | | |
| File upload UI component | 1 | Drag-drop, progress, validation |
| Upload API endpoint with validation | 1.5 | Security, file type/size checks |
| Download/view functionality | 1 | Download links, preview modal |
| Document categorization | 0.5 | UI for category selection |
| Document deletion | 0.5 | Confirmation, cleanup |
| Document list display | 0.5 | Table/list component |
| PDF viewer integration | 1 | Third-party library integration |
| File validation (size/type) | 0.5 | Client & server-side |
| **Subtotal** | **7** | |
| **Status Transition Validation** | | |
| UI-level validation logic | 1.5 | Check requirements before transitions |
| Missing document warnings | 1 | Show what's missing |
| Block invalid transitions | 1 | Prevent bad state changes |
| Error messages | 0.5 | User-friendly messaging |
| Required documents checklist | 1 | Per-status requirements |
| Confirmation dialogs | 0.5 | For critical changes |
| **Subtotal** | **6** | |
| **Flight Workflow Completion** | | |
| Complete status transition handlers | 2 | All status paths |
| Complete Flight functionality | 1 | Form, validation, submission |
| Abort Flight functionality | 0.5 | Status change + confirmation |
| Status history/audit log display | 1.5 | Timeline component |
| Restart denied flights | 0.5 | Reset to draft logic |
| Field validation | 1 | Comprehensive validation |
| **Subtotal** | **6.5** | |
| **Organization & User Management** | | |
| Organization management UI | 1.5 | List, create, edit pages |
| Create organization form | 1 | Form + validation |
| User invitation system | 2 | Email invites, tokens, acceptance |
| Role assignment | 0.5 | During invitation |
| Member management page | 1.5 | List, remove, role changes |
| Organization switching | 1 | If multi-org support |
| Organization settings | 1 | Settings page |
| **Subtotal** | **8** | |
| **Aircraft Management** | | |
| Aircraft creation form | 1 | Form + validation |
| Aircraft list view | 1 | Table with search/filter |
| Edit functionality | 1 | Edit form + update logic |
| Search/filter | 0.5 | Filtering logic |
| Link to organizations | 0.5 | Relationship management |
| Aircraft detail view | 0.5 | Detail page |
| **Subtotal** | **4.5** | |
| **Total** | **32** | |
| **Buffer (20%)** | **6.5** | |
| **Adjusted for parallelization** | **-8** | Some tasks can overlap |
| **Final** | **20-25 days** | |

### 3. Payment & Subscription System: **12-15 working days**

| Task | Days | Notes |
|------|------|-------|
| **Payment Integration** | | |
| Stripe account setup | 0.5 | Account creation, API keys |
| Subscription plans design | 0.5 | Plan structure, pricing |
| Subscription table schema | 0.5 | Database design |
| Subscription creation flow | 2 | Checkout, payment collection |
| Payment method UI | 1.5 | Stripe Elements integration |
| Webhook handler | 2 | Handle all Stripe events |
| Middleware subscription checks | 1 | Protect routes by plan |
| Billing/payment history page | 1.5 | Transaction history |
| Upgrade/downgrade flow | 2 | Plan changes, prorating |
| Usage limits implementation | 2 | Track usage, enforce limits |
| **Subtotal** | **13.5** | |
| **Pricing Page** | | |
| Design & build pricing page | 1.5 | Comparison table, CTAs |
| Feature comparison | 0.5 | Plan differences |
| FAQ section | 0.5 | Pricing questions |
| **Subtotal** | **2.5** | |
| **Free Trial / Usage Limits** | | |
| Free trial logic | 1 | Trial period tracking |
| Usage tracking system | 1.5 | Count flights, documents, etc. |
| Feature gating | 1 | Show/hide features by plan |
| Upgrade prompts | 1 | When limits reached |
| Usage dashboard | 1 | Show current usage |
| **Subtotal** | **5.5** | |
| **Total** | **21.5** | |
| **Buffer (20%)** | **4.5** | |
| **Adjusted for complexity** | **-5** | Some overlap with other work |
| **Final** | **12-15 days** | |

### 4. Email Notifications: **5-7 working days**

| Task | Days | Notes |
|------|------|-------|
| Email service setup (Resend/SendGrid) | 0.5 | Account, API keys |
| Domain authentication (SPF, DKIM) | 1 | DNS configuration |
| Email template design | 1 | Branded HTML templates |
| Template system setup | 0.5 | Template engine |
| **Notification Triggers** | | |
| Status change notifications | 1.5 | Multiple status types |
| Welcome email | 0.5 | New user |
| Organization invites | 0.5 | Invitation emails |
| Flight assignments | 0.5 | Notify pilots/mechanics |
| Permit expiration warnings | 1 | Scheduled job for checks |
| SLA breach alerts | 0.5 | Scheduled checks |
| Document upload notifications | 0.5 | File upload alerts |
| Flight completion | 0.5 | Completion notification |
| **Subtotal** | **7** | |
| **Email Preferences** | | |
| Preferences page | 1 | UI for notification settings |
| Opt-in/opt-out logic | 0.5 | Preference storage |
| Digest emails | 1 | Daily/weekly summaries |
| **Subtotal** | **2.5** | |
| **Total** | **10** | |
| **Buffer (20%)** | **2** | |
| **Adjusted for parallel work** | **-3** | Can work alongside other features |
| **Final** | **5-7 days** | |

### 5. User Experience & Onboarding: **8-10 working days**

| Task | Days | Notes |
|------|------|-------|
| **Onboarding Flow** | | |
| Onboarding wizard | 2 | Multi-step wizard |
| Organization creation guide | 0.5 | First org setup |
| Aircraft addition guide | 0.5 | First aircraft |
| Ferry flight tutorial | 1 | First flight creation |
| Tooltips/help text | 1.5 | Throughout app |
| Video tutorials (optional) | 2 | If doing videos |
| **Subtotal** | **7.5** | |
| **Error Handling & Feedback** | | |
| Global error boundary | 1 | React error boundary |
| Toast notifications | 1 | Success/error toasts |
| Form validation improvements | 1.5 | Inline errors |
| Loading states | 1 | All async operations |
| Retry logic | 0.5 | Failed API calls |
| User-friendly error messages | 1 | Rewrite error text |
| Error logging (Sentry) | 1 | Setup + integration |
| **Subtotal** | **7** | |
| **Empty States** | | |
| Improve empty state designs | 1 | Better UX |
| Helpful guidance | 0.5 | Contextual help |
| CTAs in empty states | 0.5 | Guide next actions |
| **Subtotal** | **2** | |
| **Total** | **16.5** | |
| **Buffer (20%)** | **3.5** | |
| **Adjusted for iterative work** | **-8** | Can be done incrementally |
| **Final** | **8-10 days** | |

### 6. Legal & Compliance: **3-5 working days**

| Task | Days | Notes |
|------|------|-------|
| Terms of Service | 1 | Write or use template |
| Privacy Policy | 1 | Write or use template |
| Cookie Policy | 0.5 | If needed |
| Acceptable Use Policy | 0.5 | If needed |
| Legal page links | 0.5 | Footer links |
| Terms acceptance | 0.5 | During signup |
| Cookie consent banner | 0.5 | If needed |
| GDPR compliance | 1 | Data export, deletion |
| Data export functionality | 1 | Download user data |
| Account deletion | 0.5 | Delete account flow |
| Privacy controls | 0.5 | Settings page |
| **Total** | **7.5** | |
| **Buffer** | **1.5** | |
| **Adjusted (can use templates)** | **-4** | Legal templates available |
| **Final** | **3-5 days** | |

### 7. Testing & Quality Assurance: **15-20 working days**

| Task | Days | Notes |
|------|------|-------|
| **Manual Testing** | | |
| End-to-end workflow testing | 2 | Complete ferry flight |
| All user roles testing | 1.5 | Owner, mechanic, pilot, admin |
| Status transitions testing | 1 | All transitions |
| Document upload/download | 0.5 | File operations |
| Organization management | 0.5 | Org features |
| Payment flow testing | 1 | Subscription flow |
| Email notifications | 0.5 | Verify emails sent |
| Error scenarios | 1 | Network failures, invalid data |
| Browser testing | 1 | Chrome, Firefox, Safari, Edge |
| Mobile responsiveness | 1 | Mobile devices |
| **Subtotal** | **9.5** | |
| **Automated Testing** | | |
| Testing framework setup | 1 | Jest/Playwright/Cypress |
| Unit tests (critical functions) | 3 | Core business logic |
| Integration tests (API routes) | 2 | API endpoint tests |
| E2E tests (core workflows) | 3 | Critical user paths |
| CI/CD pipeline | 1 | Automated test runs |
| Test coverage reporting | 0.5 | Coverage tools |
| **Subtotal** | **10.5** | |
| **Performance Testing** | | |
| Page load time testing | 0.5 | Identify slow pages |
| Database query optimization | 1.5 | Optimize slow queries |
| Add database indexes | 0.5 | Performance indexes |
| Pagination implementation | 0.5 | Large lists |
| Image/file optimization | 0.5 | Optimize assets |
| Realistic data volume testing | 0.5 | Load testing |
| **Subtotal** | **4** | |
| **Total** | **24** | |
| **Buffer (20%)** | **5** | |
| **Adjusted (testing is iterative)** | **-9** | Much testing happens during dev |
| **Final** | **15-20 days** | |

### 8. Security & Compliance: **5-7 working days**

| Task | Days | Notes |
|------|------|-------|
| **Security Audit** | | |
| API endpoint authorization review | 1 | Check all endpoints |
| RLS policy testing | 1.5 | Thorough testing |
| Sensitive data check | 0.5 | Client-side review |
| Rate limiting | 1 | API rate limits |
| CSRF protection | 0.5 | CSRF tokens |
| File upload security | 1 | Secure uploads |
| Input sanitization | 1 | XSS prevention |
| Security headers | 0.5 | CSP, HSTS, etc. |
| **Subtotal** | **7** | |
| **Authentication Security** | | |
| Password strength requirements | 0.5 | Validation rules |
| Password reset | 1 | Reset flow |
| Account lockout | 0.5 | Failed attempt lockout |
| 2FA (optional) | 2 | If implementing |
| OAuth flow testing | 0.5 | Test OAuth |
| **Subtotal** | **4.5** | |
| **Total** | **11.5** | |
| **Buffer (20%)** | **2.5** | |
| **Adjusted (some overlap with testing)** | **-6** | Security testing overlaps with QA |
| **Final** | **5-7 days** | |

### 9. Deployment & DevOps: **5-7 working days**

| Task | Days | Notes |
|------|------|-------|
| **Production Deployment** | | |
| Production hosting setup (Vercel) | 0.5 | Account, project setup |
| Domain configuration | 0.5 | DNS, domain setup |
| SSL certificate | 0.5 | Auto-configured on Vercel |
| Environment variables | 0.5 | Production env vars |
| Database migrations (prod) | 1 | Run migrations safely |
| Convex production project | 0.5 | Production database |
| Monitoring setup (Vercel Analytics) | 0.5 | Analytics config |
| Error tracking (Sentry) | 0.5 | Sentry setup |
| Uptime monitoring | 0.5 | Uptime monitoring service |
| **Subtotal** | **5** | |
| **CI/CD Pipeline** | | |
| GitHub Actions setup | 1 | Workflow configuration |
| Automated deployments | 1 | Deploy on push |
| Pre-deployment checks | 0.5 | Linting, tests |
| Staging environment | 1 | Staging setup |
| Rollback procedure | 0.5 | Rollback docs/process |
| **Subtotal** | **4** | |
| **Backup & Recovery** | | |
| Database backups | 0.5 | Automated backups |
| Recovery documentation | 0.5 | Recovery procedures |
| Backup restoration test | 0.5 | Test restore |
| File storage backups | 0.5 | Storage backups |
| **Subtotal** | **2** | |
| **Total** | **11** | |
| **Buffer (20%)** | **2** | |
| **Adjusted (some tasks quick)** | **-4** | Many tasks are straightforward |
| **Final** | **5-7 days** | |

### 10. Documentation & Support: **5-7 working days**

| Task | Days | Notes |
|------|------|-------|
| **User Documentation** | | |
| User guide/help center | 2 | Comprehensive guide |
| FAQ section | 1 | Common questions |
| Video tutorials | 2 | If creating videos |
| Common workflows | 1 | Step-by-step guides |
| In-app tooltips | 1 | Contextual help |
| **Subtotal** | **7** | |
| **Support System** | | |
| Support email/ticketing | 0.5 | Email or tool setup |
| Contact/support page | 0.5 | Contact form |
| Feedback mechanism | 0.5 | Feedback form |
| Support process | 0.5 | Process documentation |
| Response templates | 0.5 | Email templates |
| **Subtotal** | **2.5** | |
| **Developer Documentation** | | |
| README updates | 0.5 | Setup instructions |
| API documentation | 1 | Endpoint docs |
| Database schema docs | 0.5 | Schema documentation |
| Code comments | 0.5 | Complex logic comments |
| Architecture diagram | 0.5 | System diagram |
| **Subtotal** | **3** | |
| **Total** | **12.5** | |
| **Buffer (20%)** | **2.5** | |
| **Adjusted (can be done incrementally)** | **-7** | Documentation during development |
| **Final** | **5-7 days** | |

### 11. Marketing & Launch Preparation: **3-5 working days**

| Task | Days | Notes |
|------|------|-------|
| **Landing Page** | | |
| Pricing information | 0.5 | Add to landing page |
| Customer testimonials | 0.5 | If available |
| Case studies/use cases | 1 | Write use cases |
| SEO improvements | 1 | Meta tags, descriptions |
| Analytics tracking | 0.5 | GA/Plausible setup |
| **Subtotal** | **3.5** | |
| **Launch Checklist** | | |
| Final security review | 0.5 | Last security check |
| Load testing | 1 | Stress testing |
| Launch announcement | 0.5 | Announcement content |
| Customer onboarding materials | 0.5 | Onboarding docs |
| Customer success process | 0.5 | Success process |
| Marketing strategy | 0.5 | Launch plan |
| **Subtotal** | **3.5** | |
| **Total** | **7** | |
| **Buffer (20%)** | **1.5** | |
| **Adjusted** | **-3** | Some tasks quick |
| **Final** | **3-5 days** | |

## Summary Totals

| Category | Days (Range) |
|---------|--------------|
| 1. Database & Infrastructure | 8-10 |
| 2. Core Functionality | 20-25 |
| 3. Payment & Subscription | 12-15 |
| 4. Email Notifications | 5-7 |
| 5. User Experience & Onboarding | 8-10 |
| 6. Legal & Compliance | 3-5 |
| 7. Testing & QA | 15-20 |
| 8. Security & Compliance | 5-7 |
| 9. Deployment & DevOps | 5-7 |
| 10. Documentation & Support | 5-7 |
| 11. Marketing & Launch Prep | 3-5 |
| **TOTAL** | **100-132 working days** |

## Adjusted for Realistic Development

### Factors Reducing Time:
- **Parallel work**: Some tasks can be done simultaneously (e.g., documentation while testing)
- **Iterative testing**: Testing happens during development, not just at the end
- **Reusable components**: Some UI components can be reused
- **Templates**: Legal pages can use templates
- **Existing knowledge**: Developer familiar with stack

### Factors Increasing Time:
- **Unexpected bugs**: Always find issues during testing
- **Integration complexity**: Payment/webhook integration can be tricky
- **Third-party dependencies**: Email service, Stripe setup can have delays
- **Review cycles**: Need time to review and iterate
- **Learning curve**: Some features may require research

## Final Estimate

### Solo Developer (Full-Time)
- **Optimistic**: 100 working days = **~20 weeks** (5 months)
- **Realistic**: 115 working days = **~23 weeks** (5.5-6 months)
- **Pessimistic**: 132 working days = **~26 weeks** (6-7 months)

### With 2 Developers (Can Parallelize)
- **Optimistic**: 60-70 working days = **~12-14 weeks** (3-3.5 months)
- **Realistic**: 70-85 working days = **~14-17 weeks** (3.5-4 months)

### With 3 Developers (Good Parallelization)
- **Optimistic**: 45-55 working days = **~9-11 weeks** (2-2.5 months)
- **Realistic**: 55-70 working days = **~11-14 weeks** (2.5-3.5 months)

## Critical Path Items (Cannot Be Parallelized)

1. Database migrations (blocks everything)
2. Core functionality (blocks testing)
3. Payment system (blocks monetization)
4. Basic testing (blocks launch)

## Recommendations

1. **Start with database migrations** - Everything depends on this
2. **Build core features first** - Get the main workflow working
3. **Add payment early** - Can't launch without it
4. **Test iteratively** - Don't wait until the end
5. **Use templates where possible** - Legal pages, email templates
6. **Consider MVP scope reduction** - Some features can be post-launch

## Risk Factors

- **Payment integration complexity**: Stripe webhooks can be tricky (add 2-3 days buffer)
- **Email deliverability**: Domain authentication can take time (add 1-2 days)
- **Security audit findings**: May require rework (add 3-5 days buffer)
- **Third-party service setup**: Stripe, email service, monitoring (add 2-3 days)
- **Production deployment issues**: First deployment often has issues (add 2-3 days)

## Conclusion

**For a solo developer working full-time:**
- **Minimum**: 20 weeks (5 months)
- **Realistic**: 23-26 weeks (5.5-6.5 months)
- **With buffer for unknowns**: 28-30 weeks (7-7.5 months)

**Recommendation**: Plan for **6-7 months** as a solo developer to account for:
- Unexpected issues
- Learning curve on new features
- Iteration based on testing
- Third-party service setup delays
- Buffer for scope creep
