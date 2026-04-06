# Mazadat Sprint 0

---

## Introduction

### A. Project Idea

Mazadat is a web-based auction marketplace designed for the Saudi market, enabling individuals and organizations to buy and sell items through transparent, secure, and real-time bidding.

The platform aims to modernize local auction processes by providing a trustworthy digital environment that ensures fairness, accessibility, and efficiency for all users.

Mazadat will allow sellers to create auctions, buyers to place bids in real time, and administrators to manage users, auctions, and platform integrity.

---

### B. Stakeholders

- **Buyers (End Users):** Users who participate in auctions and place bids on listed items.
- **Sellers (End Users):** Users or organizations who create auctions and list items for sale.
- **Administrator:** Manages users, auctions, reports, and platform policies.
- **Platform Owner / Business:** Responsible for platform governance, policies, and growth.

---

### C. Glossary

- **Auction:** A process where items are sold to the highest bidder within a specified time.
- **Bid:** The price offered by a buyer for an item in an auction.
- **Reserve Price:** The minimum price required for the item to be sold.
- **Seller:** A user who lists items for auction.
- **Buyer:** A user who places bids on auction items.
- **Admin:** A privileged user who moderates content and manages the system.
- **Listing:** An item published by a seller for bidding.
- **Real-Time Bidding:** Live bidding where users can see current bids instantly.
- **Winner:** The highest bidder when the auction ends.

---

## Product Backlog

### A. System Features

| No. | System Features | Priority | Actor |
|-----|-----------------|----------|-------|
| 1 | The System shall allow users to register using name, email, and password. | Must | Buyer/Seller |
| 2 | The System shall allow users to sign in using email and password. | Must | Buyer/Seller |
| 3 | The System shall allow users to log out securely. | Must | Buyer/Seller |
| 4 | The System shall allow users to edit their profile information. | Should | Buyer/Seller |
| 5 | The System shall allow sellers to create auction listings with title, images, description, and starting price. | Must | Seller |
| 6 | The System shall allow sellers to set auction duration and reserve price. | Must | Seller |
| 7 | The System shall display active auctions with current highest bid in real time. | Must | System |
| 8 | The System shall allow buyers to place bids on active auctions. | Must | Buyer |
| 9 | The System shall prevent bids lower than the current highest bid. | Must | System |
| 10 | The System shall notify users when they are outbid. | Must | System |
| 11 | The System shall notify users when they win an auction. | Must | System |
| 12 | The System shall display auction history and bidding history for each item. | Should | System |
| 13 | The System shall allow users to search auctions by keyword. | Must | Buyer |
| 14 | The System shall allow users to filter auctions by category, price, and status. | Should | Buyer |
| 15 | The System shall allow users to add auctions to a watchlist. | Could | Buyer |
| 16 | The System shall provide a dashboard for sellers showing their active and ended auctions. | Should | Seller |
| 17 | The System shall allow sellers to cancel auctions before any bids are placed. | Should | Seller |
| 18 | The System shall allow admin to suspend or delete auctions that violate policies. | Must | Admin |
| 19 | The System shall allow admin to manage user accounts (suspend, activate, delete). | Must | Admin |
| 20 | The System shall provide an admin dashboard with system statistics. | Must | Admin |
| 21 | The System shall log all bids for auditing and transparency. | Must | System |
| 22 | The System shall prevent fraudulent bidding patterns (basic validation rules). | Should | System |
| 23 | The System shall support image upload for auction listings. | Must | Seller |
| 24 | The System shall display auction countdown timers. | Must | System |
| 25 | The System shall send email notifications for important auction events. | Should | System |
| 26 | The System shall support Arabic and English languages. | Could | System |
| 27 | The System shall allow users to report suspicious auctions or users. | Should | Buyer/Seller |
| 28 | The System shall allow admin to review and resolve reports. | Must | Admin |
| 29 | The System shall allow sellers to mark items as sold after auction completion. | Should | Seller |
| 30 | The System shall display auction terms and platform policies to users. | Must | System |
| 31 | The System shall allow sellers to feature their auctions for increased visibility. | Could | Seller |
| 32 | The System shall allow sellers to rate buyers after completing a transaction. | Could | Seller |
| 33 | The System shall allow buyers to rate sellers after completing a transaction. | Could | Buyer |
| 34 | The System shall provide advanced analytics for sellers including views, bids, and engagement statistics. | Would | Seller |
| 35 | The System shall support auto-bidding where buyers can set a maximum bid limit. | Could | Buyer |
| 36 | The System shall extend auction time if a bid is placed during the final seconds (anti-sniping mechanism). | Could | System |
| 37 | The System shall allow buyers to save search preferences for future use. | Could | Buyer |
| 38 | The System shall provide a dark mode interface option. | Could | Buyer/Seller |
| 39 | The System shall support secure online payment integration. | Would | Buyer |
| 40 | The System shall provide an escrow service to hold payments until item delivery is confirmed. | Would | Buyer/Seller |
| 41 | The System shall provide a mobile application version of the platform. | Would | Buyer/Seller |
| 42 | The System shall use AI-based techniques to detect suspicious activity and fraudulent behavior. | Would | System |
| 43 | The System shall send SMS notifications for important auction events. | Would | System |

---

### B. User Stories

> **Priority:** Based on the MoSCoW ranking: Must, Should, Could, Would.
> 
> **Story Points:** Estimated using the Fibonacci scale (1, 2, 3, 5, 8, 13, 21) to represent effort and complexity.

| ID | Title | Description | Story Points | Priority | Actor |
|----|-------|-------------|--------------|----------|-------|
| 1 | User Registration | As a Buyer or Seller, I want to register using my name, email, and password so that I can create an account and use the platform | 3 | Must | Buyer / Seller |
| 2 | User Login | As a Buyer or Seller, I want to sign in using my email and password so that I can access my account securely | 3 | Must | Buyer / Seller |
| 3 | Secure Logout | As a Buyer or Seller, I want to log out securely so that my account remains protected | 1 | Must | Buyer / Seller |
| 4 | Edit Profile | As a Buyer or Seller, I want to edit my profile information so that my account details stay updated. | 3 | Should | Buyer / Seller |
| 5 | Create Auction Listing | As a Seller, I want to create auction listings with title, images, description, and starting price so that I can sell my items | 8 | Must | Seller |
| 6 | Set Auction Duration & Reserve Price | As a Seller, I want to set auction duration and reserve price so that I can control the minimum acceptable value and timeline | 5 | Must | Seller |
| 7 | Upload Auction Images | As a Seller, I want to upload images for auction listings so that buyers can clearly view the item | 5 | Must | Seller |
| 8 | Seller Dashboard | As a Seller, I want to view my active and ended auctions in a dashboard so that I can manage them efficiently | 8 | Should | Seller |
| 9 | Cancel Auction Before Bids | As a Seller, I want to cancel an auction before any bids are placed so that I can correct mistakes | 2 | Should | Seller |
| 10 | Mark Item as Sold | As a Seller, I want to mark items as sold after auction completion so that auction status is accurate | 2 | Should | Seller |
| 11 | Featured Auctions | As a Seller, I want to feature my auction for better visibility so that I can attract more buyers | 5 | Could | Seller |
| 12 | Buyer Rating System | As a Seller, I want to rate buyers after a transaction so that I can identify serious bidders | 5 | Could | Seller |
| 13 | Advanced Analytics for Sellers | As a Seller, I want detailed analytics about views, bids, and engagement so that I can improve my auction performance | 13 | Would | Seller |
| 14 | View Active Auctions in Real Time | As a Buyer, I want to see active auctions with the current highest bid in real time so that I can make informed bidding decisions | 8 | Must | Buyer |
| 15 | Place Bid | As a Buyer, I want to place bids on active auctions so that I can compete to win items | 8 | Must | Buyer |
| 16 | Prevent Lower Bids | As a Buyer, I want the System to prevent bids lower than the current highest bid so that bidding remains fair | 5 | Must | System |
| 17 | Auction Countdown Timer | As a Buyer, I want the System to display a countdown timer so that I know how much time is left | 5 | Must | System |
| 18 | View Auction & Bidding History | As a Buyer, I want to view auction and bidding history so that I can review past activity | 5 | Should | Buyer |
| 19 | Add to Watchlist | As a Buyer, I want to add auctions to a watchlist so that I can track them easily | 3 | Should | Buyer |
| 20 | Search Auctions | As a Buyer, I want to search auctions by keyword so that I can find items quickly | 5 | Must | Buyer |
| 21 | Filter Auctions | As a Buyer, I want to filter auctions by category, price, and status so that I can narrow results | 5 | Should | Buyer |
| 22 | Outbid Notification | As a Buyer, I want the System to notify me when I am outbid so that I can bid again if needed | 8 | Must | System |
| 23 | Winning Notification | As a Buyer, I want the System to notify me when I win an auction so that I can proceed with the next steps | 5 | Must | System |
| 24 | Email Notifications | As a Buyer or Seller, I want the System to send email notifications for important auction events so that I don't miss updates | 8 | Should | System |
| 25 | Moderate Auctions | As an Admin, I want to suspend or delete auctions that violate policies so that the platform remains safe and compliant | 5 | Must | Admin |
| 26 | Manage User Accounts | As an Admin, I want to suspend, activate, or delete user accounts so that I can enforce platform rules | 5 | Must | Admin |
| 27 | Admin Dashboard | As an Admin, I want to view system statistics so that I can monitor platform performance | 8 | Should | Admin |
| 28 | Log All Bids | As an Admin, I want the System to log all bids so that auction activity is transparent and auditable | 8 | Must | System |
| 29 | Prevent Fraudulent Bidding | As a Buyer or Seller, I want the System to detect and prevent fraudulent bidding patterns so that auctions remain fair | 8 | Could | System |
| 30 | Report Suspicious Activity | As a Buyer or Seller, I want to report suspicious auctions or users so that I can help protect the marketplace | 3 | Should | Buyer / Seller |
| 31 | Review Reports | As an Admin, I want to review and resolve user reports so that issues are handled properly | 5 | Should | Admin |
| 32 | Multi-language Support | As a Buyer or Seller, I want the System to support Arabic and English so that it is accessible to more users | 8 | Should | System |
| 33 | View Platform Policies | As a Buyer or Seller, I want to view auction terms and platform policies so that I understand the rules before participating | 2 | Must | Buyer / Seller |
| 34 | Auto-Bidding | As a Buyer, I want to set a maximum auto-bid amount so that the System automatically bids on my behalf until my limit is reached | 13 | Could | Buyer |
| 35 | Seller Rating System | As a Buyer, I want to rate sellers after completing a transaction so that other buyers can see seller reliability | 5 | Could | Buyer |
| 36 | Auction Extension (Anti-Sniping) | As a Buyer, I want the System to extend the auction time if a bid is placed in the last few seconds so that bidding remains fair | 8 | Could | Buyer |
| 37 | Saved Search Preferences | As a Buyer, I want to save my search filters so that I can quickly access preferred auctions later | 3 | Could | Buyer |
| 38 | Dark Mode | As a Buyer or Seller, I want the System to provide dark mode so that I can use the platform comfortably at night | 3 | Could | Buyer / Seller |
| 39 | Online Payment Integration | As a Buyer, I want to pay securely through the platform so that the transaction process is seamless | 13 | Would | Buyer |
| 40 | Escrow Service | As a Buyer and Seller, I want the System to hold payment in escrow until the item is delivered so that both parties are protected | 13 | Would | Buyer / Seller |
| 41 | Mobile Application | As a Buyer or Seller, I want a mobile application so that I can participate in auctions anytime and anywhere | 13 | Could | Buyer / Seller |
| 42 | AI-Based Fraud Detection | As a Buyer or Seller, I want the System to use AI to detect suspicious activity so that the marketplace remains secure | 21 | Would | Buyer / Seller |
| 43 | SMS Notifications | As a Buyer or Seller, I want to receive SMS notifications for important auction events so that I stay updated instantly | 8 | Would | Buyer / Seller |

---

## Non-Functional Requirements

| No. | Title | Description |
|-----|-------|-------------|
| 1 | Performance | The platform must process bids, load auctions, and update real-time data quickly to ensure a smooth user experience. |
| 2 | Security | The system must protect user accounts, bidding data, and transactions through secure authentication and data encryption. |
| 3 | Scalability | The platform must support an increasing number of users and concurrent bids without degrading performance. |
| 4 | Availability | The system should be accessible 24/7 with minimal downtime to allow continuous auction participation. |
| 5 | Usability | The interface must be simple and intuitive for buyers, sellers, and administrators. |
| 6 | Reliability | The system must ensure accurate bid processing and prevent data loss during auctions. |

---

## Design / Architecture

### Architecture Overview

We chose a **Multi-Tier (Layered) Architecture** for the Mazadat application because it provides clear separation between the user interface, business logic, and data management. This structure makes the system easier to develop, maintain, and scale. It also improves security since critical auction and bidding logic is handled on the secure backend server.

The system is composed of three main tiers.

---

### Presentation Tier

**Purpose:**
To provide an interactive and user-friendly interface for buyers, sellers, and administrators to interact with the auction platform.

**Technology:**
Web Application (React or Next.js recommended)

**Function:**
- Displays auctions and item details
- Allows users to register and log in
- Enables buyers to place bids
- Enables sellers to manage their auctions
- Provides admin dashboard access
- Communicates with the Application Tier via REST APIs (and optional WebSocket for live updates)

---

### Application (Logic) Tier

**Purpose:**
To process requests, enforce business rules, and coordinate communication between the presentation and data tiers.

**Technology:**
Backend Server (Node.js/Express or similar)

**Function:**
- Handles authentication and authorization
- Manages auction creation and updates
- Validates and processes bids
- Prevents invalid or lower bids
- Determines auction winners
- Manages reports and admin actions
- Generates user notifications
- Exposes REST APIs to the frontend
- Optionally provides WebSocket support for near real-time bidding updates

---

### Data Tier

**Purpose:**
To securely store and manage all persistent data used by the platform.

**Technology:**
- PostgreSQL Database
- Local File Storage (for images)

**Function:**
- Stores user accounts and roles
- Stores auction listings and images
- Stores bid history and highest bid
- Stores reports and notifications
- Supports data retrieval and query optimization
- Ensures transactional integrity for bidding operations

---

### Architecture Summary

Mazadat uses a simple three-tier architecture where:
- The **Presentation Tier** handles the user interface
- The **Application Tier** enforces auction and bidding logic
- The **Data Tier** manages persistent storage

---

### Sprint 0 Setup Features

| # | Feature | Priority |
|---|---------|----------|
| 1 | Installation of VS Code & IntelliJ IDEA (development environment) | Must |
| 2 | Installation of Git for version control | Must |
| 3 | Configuration of GitHub repository | Must |
| 4 | Installation of the stack Frameworks | Must |
| 5 | Installation of project dependencies (npm install) | Must |
| 6 | Configuration of Backend environment variables | Must |
| 7 | Implementation of database connection | Must |
| 8 | Configuration of Frontend environment variables | Must |
| 9 | Setup of Web Application (Frontend) | Must |
| 10 | Implementation of image upload directory | Must |
| 11 | Installation of API testing tool (Insomnia) | Must |
| 12 | WebSocket setup for live bidding | Should |
| 13 | Installation of Docker (for optional containerization) | Should |

---

### Infrastructure Readiness

| ID | Type | Name | Status | Description |
|----|------|------|--------|-------------|
| 1 | Software | WhatsApp | Available | Used for team internal general communication. |
| 2 | Software | Discord | Available | Used for team internal communication and calls. |
| 3 | Hardware | PC | Available | Used for development, testing, documentation, and system maintenance. |
| 4 | Network | Personal Wi-Fi | Available | Provides internet access for cloud services, repositories, and online collaboration. |
| 5 | Software | Claude AI | Available | Used for AI-assisted development, automation tasks, and productivity enhancement. |
| 6 | Software | Trello | Available | Used for task scheduling, progress tracking, and assignment management. |
| 7 | Software | Canva | Available | Used for designing presentations, documentation, and project materials. |

---

### Environment Specification

| ID | Type | Name | Status | Description |
|----|------|------|--------|-------------|
| 1 | Backend Framework | Spring Boot | Available | Used to build and manage server-side logic, APIs, and database communication. |
| 2 | Frontend Framework | React | Available | Used to develop the user interface and manage client-side interactions. |
| 3 | Development Tool | IntelliJ IDEA | Available | Backend code editor. |
| 4 | Development Tool | VS Code | Available | Frontend code editor. |
| 5 | Version Control Tool | GitHub Repository | Available | Used for source code management, version control, and team collaboration. |
| 6 | Database Control Tool | DataGrip | Available | Used for administering and monitoring the database. |
| 7 | Hosting Tool | Firebase | Unavailable | Used for software and database cloud hosting. |

---

### Team Readiness

| ID | Name | Skill | Status |
|----|------|-------|--------|
| 1 | Khaled Lallali | Frontend Development | To be trained |
| 2 | Abdulmalik Albaqami | Full-stack Development | To be trained |
| 3 | Abdulmalik Alhussain | UI/UX Design | To be trained |
| 4 | Essa ALGhanim | Backend Development | To be trained |
| 5 | Abdurrahman Alzomea | Project Management | To be trained |
| 6 | Moath Aloneq | Backend Development, Testing | To be trained |

---

### Training

| Type | Skill | Related to | Person to be trained | Source | Duration |
|------|-------|------------|----------------------|--------|----------|
| Platform Training | VS Code | Development Environment | All Team Members | Online | 30 min |
| Version Control Training | Git & GitHub | Shared base code control | All Team Members | YouTube | 1 hour |
| Design Tool Training | Figma | UI/UX Design | Abdulmalik Alhussain | YouTube | 5 hours |
| Framework Training | React | Frontend development | Khaled Lallali, Abdulmalik Albaqami | React Official Documentation | 10 hours |
| Integration Training | API Integration | Integration | Abdulmalik Albaqami, Khaled Lallali | YouTube + personal effort | 1 hour |
| Framework Training | Node.js | Backend Development | Essa Alghanim, Abdulmalik Albaqami | YouTube & Documentation | 10 hours |
| Database/tool Training | Firebase | Backend Development | Essa Alghanim, Abdulmalik Albaqami | YouTube | 5 hours |
| Testing | Software testing | QA | Moath Aloneq, Abdurrahman Alzomea | YouTube | 5 hours |
| AI Tools Training | Vibe coding | Productivity | All Team Members | YouTube | 30 min |

---

## Project Release Road Map

### Sprint 1: Core Platform & Authentication

| No. | Feature | Story Points | Priority |
|-----|---------|--------------|----------|
| 1 | Buyer & Seller Account Registration | 5 | Must |
| 2 | User Login & Logout | 3 | Must |
| 3 | Edit User Profile | 3 | Should |
| 4 | Multi-language Support (Arabic / English) | 8 | Should |
| 5 | View Platform Policies | 2 | Must |
| 6 | Create Auction Listing | 8 | Must |
| 7 | Upload Auction Images | 5 | Must |
| 8 | Set Auction Duration & Reserve Price | 5 | Must |
| 9 | Cancel Auction Before Bids | 3 | Should |
| 10 | Mark Item as Sold | 2 | Should |
| 11 | Auction Countdown Timer | 5 | Must |
| 12 | Secure Authentication & Session Management | 5 | Must |
| 13 | Basic Rule-Based Fraud Detection | 8 | Must |

---

### Sprint 2: Bidding System & Search

| No. | Feature | Story Points | Priority |
|-----|---------|--------------|----------|
| 14 | Place Bids on Auctions | 8 | Must |
| 15 | Prevent Invalid Bids (lower than current bid) | 5 | Must |
| 16 | Real-Time Bid Updates | 8 | Must |
| 17 | Log All Bids | 8 | Must |
| 18 | View Auction & Bidding History | 5 | Should |
| 19 | Auto-Bidding (Maximum Bid) | 13 | Could |
| 20 | Search Auctions | 5 | Must |
| 21 | Filter Auctions | 5 | Should |
| 22 | Add to Watchlist (Save Auction) | 3 | Should |
| 23 | Saved Search Preferences | 3 | Could |
| 24 | Featured Auctions | 3 | Could |
| 25 | Auction Extension (Anti-Sniping) | 8 | Could |

---

### Sprint 3: Notifications, Moderation & Admin

| No. | Feature | Story Points | Priority |
|-----|---------|--------------|----------|
| 26 | Outbid Notifications | 8 | Must |
| 27 | Auction Winner Notification | 5 | Must |
| 28 | Email Notifications | 8 | Should |
| 29 | SMS Notifications | 8 | Would |
| 30 | Buyer Rating System | 5 | Could |
| 31 | Seller Rating System | 5 | Could |
| 32 | Report Suspicious Activity | 3 | Should |
| 33 | Moderate Auctions | 5 | Must |
| 34 | Manage User Accounts | 5 | Must |
| 35 | Review & Resolve Reports | 5 | Should |
| 36 | Admin Dashboard with Statistics | 8 | Should |

---

### Sprint 4: Quality, Performance & Enhancements

| No. | Feature | Story Points | Priority |
|-----|---------|--------------|----------|
| 37 | Advanced Seller Analytics | 13 | Would |
| 38 | Dark Mode | 3 | Could |
| 39 | Online Payment Integration | 13 | Would |
| 40 | Escrow Service | 13 | Would |
| 41 | AI-Based Fraud Detection | 21 | Would |
| 42 | Mobile Application | 13 | Would |
| 43 | Performance Optimization & Bug Fixing | 8 | Must |
| 44 | Final Testing & Deployment Prep | 8 | Must |

---

## Project Management Plan

### 1. High-Level Plan

**In-Scope**
- Web-based auction platform for the Saudi market
- User registration and authentication (buyers & sellers)
- Creating, viewing, and bidding on auctions
- Real-time bidding updates
- Seller dashboard
- Admin moderation and dashboard
- Notifications for auction events (outbid, win)
- Basic fraud prevention and reporting system

**Out-Scope**
- Online payment processing (to be considered in future versions)
- Logistics/shipping management
- Mobile native application (web-only in current phase)
- Advanced identity verification (KYC)
- Third-party marketplace integrations

---

### 2. Cost Estimation

**Hosting & Infrastructure:**
- Cloud hosting and database hosting may incur costs if deployed publicly.
- During development, free tiers or local environments will be used.

**Notifications & Email Services:**
- Email notification services may incur minor operational costs.

**Other Tools:**
- Project management and design tools will use free student tiers when available.

---

### 3. Assumptions

- Users will have stable internet access.
- Team members will complete assigned Sprint 0 learning tasks before Sprint 1.
- The hosting environment will be available and stable throughout development.
- The scope will remain stable after Sprint 0 to avoid major rework.

---

### 4. Dependencies

- Frontend depends on stable backend APIs.
- Backend depends on the finalized database schema.
- Real-time bidding depends on reliable real-time communication (e.g., WebSockets).
- Deployment depends on the availability of cloud hosting services.
- Team productivity depends on effective collaboration and communication tools.

---

### 5. Other Considerations

- User data privacy must be protected.
- Auction integrity and bid transparency are critical to platform trust.
- The system must log bids for auditing and dispute resolution.
- Security best practices must be applied to authentication and authorization.

---

## Risk Management Plan

| Risks | Type | Severity | Likelihood | Management Strategy |
|-------|------|----------|------------|---------------------|
| Integrity/Transparency Issues: Fraudulent bidding or auction manipulation leading to loss of trust | Business | High | Medium | Enforce mandatory bid logging for auditing; implement basic fraud pattern validation rules. |
| Technical Dependency: Real-time bidding failure due to unreliable WebSocket communication | Technical | High | Medium | Ensure robust backend validation as a single source of truth; monitor server stability during peak bidding. |
| Team Readiness: Delay in project start because members are not trained in React or Node.js in time | Operation | Medium | Medium | Track progress of online training (e.g., YouTube, Official Docs) for all 6 members. |
| Cloud Hosting Costs: Infrastructure costs exceeding the budget once public deployment starts | Business | Medium | Low | Utilize free student tiers and local development environments for as long as possible. |
| Security Breach: Unauthorized access to user profiles or sensitive auction data | Technical | High | Low | Apply security best practices for authentication and authorization; implement secure logout. |

---

## Test Management Plan

### Unit Testing

**Implementation:** Developers will apply unit testing after finishing any function, such as user registration, login, or creating auction listings.

---

### Integration Testing

**Implementation:** The team will perform integration testing to ensure the frontend and backend communicate correctly and that the REST APIs accurately transfer data between the client layer and the application server.

---

### Black Box Testing

**Implementation:** The QA lead will conduct Black Box testing to ensure that Mazadat properly processes bidding inputs, prevents invalid lower bids, and displays real-time updates as intended.