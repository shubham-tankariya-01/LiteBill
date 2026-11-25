# LiteBill

LiteBill is a full-stack household electricity bill management application. It helps a user manage one or more houses, record submeters (“rooms”), enter periodic meter readings, combine those readings with the official main-meter bill, and calculate a balanced share for every room.

The application uses **Express 5**, **MongoDB/Mongoose**, **EJS**, **Bootstrap 5**, and server-side sessions. It is an MVC-style monolith: the server routes requests, performs database operations and billing calculations, and renders EJS templates for the user interface.

> **Repository:** [shubham-tankariya-01/LiteBill](https://github.com/shubham-tankariya-01/LiteBill)

## Table of Contents

- [Features](#features)
- [How the Billing Workflow Works](#how-the-billing-workflow-works)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Data Model](#data-model)
- [Request Flow](#request-flow)
- [Security and Access Control](#security-and-access-control)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Available Routes](#available-routes)
- [Billing Calculation](#billing-calculation)
- [Frontend Behavior](#frontend-behavior)
- [Testing and Quality Status](#testing-and-quality-status)
- [Deployment Notes](#deployment-notes)
- [Known Implementation Details and Limitations](#known-implementation-details-and-limitations)
- [Contributing](#contributing)
- [License](#license)

## Features

### Account management

- Sign up with a 10-digit mobile number and a password of at least six characters.
- Passwords are hashed with `bcryptjs` using a cost of 12.
- Log in or log out through server-side sessions.
- View profile statistics: number of houses, rooms, and main bills.
- Change the account password after verifying the current password.
- Authentication rate limiting: 100 requests per 15-minute window per IP.

### House management

- Create, rename, view, and delete houses.
- Create multiple named submeters/rooms for a house.
- Keep a house-specific list of rooms and meters.
- Delete a house with all of its rooms, readings, bills, and billing cycles.
- View a house-level workflow status:
  - Initial setup required
  - Main bill required
  - Meter readings required
  - Cycle complete
- View recent bill history directly from the house dashboard.

### Room and submeter management

- Add one or more rooms/meters to a house.
- Rename rooms/meters.
- Delete rooms and remove their readings and allocated room bills.
- Open room details for historical readings and bills.
- View room usage and amount trends on room analysis pages.
- Display the latest room reading and latest room bill in the room list.

### Billing cycles

- Automatically create setup and active cycles.
- Track a cycle's start date and optional end date.
- Associate every main bill, room reading, and room bill with a cycle.
- Close a cycle after readings are submitted.
- Automatically create the next active cycle beginning the day after the latest reading date.
- Prevent duplicate reading submissions for an already closed cycle.

### Main electricity bill entry

- Enter the main bill's total units, total amount, and bill date.
- One main bill is associated with the house's active cycle.
- Prevent duplicate main bill creation for the same cycle.
- Edit or delete a previously entered main bill.
- Verify main-bill ownership before edit/delete operations.

### Meter readings and bill splitting

- Enter one reading and date per room.
- Display previous readings while new readings are entered.
- Validate readings against the previous value in the browser.
- Compare the total entered room-unit difference with the main bill's total units.
- Calculate each room's raw consumption.
- Adjust the difference between total raw consumption and supplier units.
- Calculate an average cost per unit.
- Allocate each room's adjusted amount.
- Resolve cent-level rounding differences so room bills sum exactly to the main bill amount.
- Enforce an upper-level validation that prevents a mismatch from being saved.

### Analytics and history

- House history with cycle summaries.
- Cycle total and average room amount statistics.
- Main bill and room bill history.
- Room-specific bill and usage history.
- Per-room usage analysis charts and trend tables.
- Recent house activity on the house dashboard.

### Interface and UX

- Server-rendered EJS layouts and reusable partials.
- Responsive Bootstrap-based views.
- Shared navbar, deletion modals, and empty states.
- Dark and light visual treatments across the custom CSS.
- Sticky reading submission controls on small and large screens.
- Inline client-side validation for reading values and unit totals.
- Static brand and utility imagery.

## How the Billing Workflow Works

### 1. Create an account

A user signs up or logs in. The mobile number is used as the login identifier.

### 2. Create a house

The user creates a house and enters names for its submeters. A submeter is represented internally as a `Room` belonging to a `House`.

### 3. Initialize meter readings

For a new house, LiteBill creates:

- A setup billing cycle
- A setup reading for every room
- A second, active billing cycle

The setup readings become the previous-reading baseline. The house then records `previous_billing_cycle` and `active_billing_cycle` IDs.

### 4. Enter the supplier/main bill

The user enters:

- Total main-meter units
- Total supplier bill amount
- Bill date

LiteBill stores this information as a `MainBill` associated with the active billing cycle.

### 5. Enter end-of-cycle room readings

The user opens the readings page for the active cycle. The page shows the previous reading for each room and requests:

- Current reading
- Reading date

A reading can only be submitted after all room values and dates are supplied and the browser-side unit match passes basic validation.

### 6. Generate room bills

LiteBill:

1. Fetches the active main bill.
2. Fetches previous readings for the baseline cycle.
3. Calculates consumption for each room.
4. Compares raw room consumption with the main-meter units.
5. Splits the main-bill amount among rooms.
6. Stores a `RoomBill` for each room.

### 7. Close and continue

When room bills are stored successfully, LiteBill:

- Sets the current cycle's `endDate` to the latest reading date.
- Creates a new billing cycle starting the following day.
- Moves the completed cycle to `previous_billing_cycle`.
- Sets the new cycle to `active_billing_cycle`.
- Redirects to the cycle room-bill summary.

## Technology Stack

- **Runtime:** Node.js
- **Web framework:** Express 5
- **Database:** MongoDB
- **ODM:** Mongoose 9
- **Template engine:** EJS 5 with `ejs-mate` layouts
- **Session storage:** MongoDB via `connect-mongo`
- **Password hashing:** `bcryptjs`
- **Environment loading:** `dotenv`
- **Rate limiting:** `express-rate-limit`
- **Frontend:** Bootstrap 5.3, custom CSS, and browser JavaScript
- **Development runner:** `nodemon`
- **Package format:** npm

## Project Structure

```text
LiteBill/
├── client/
│   ├── public/
│   │   ├── css/               # Base, house, billing, and feature styles
│   │   ├── js/                # Browser interaction and UI utilities
│   │   └── images/            # Hero, meter, and split-billing imagery
│   └── views/
│       ├── auth/              # Login, signup, and profile pages
│       ├── houses/            # House dashboard, list, edit, and history
│       ├── rooms/             # Room management and analysis
│       ├── cycles/            # Billing-cycle views
│       ├── main_bills/        # Main bill entry and editing
│       ├── readings/          # Setup and cycle reading entry
│       ├── room_bills/        # Generated room-bill summary
│       ├── includes/          # Navbar and reusable modal/empty-state partials
│       ├── layouts/           # Boilerplate layouts
│       └── index/             # Public/dashboard entry views
└── server/
    ├── app.js                 # Application entry point and middleware setup
    ├── package.json           # Server dependencies and npm scripts
    ├── routes/                # Express route definitions
    ├── controllers/           # HTTP request and page behavior
    ├── models/                # Mongoose schemas
    ├── middleware/            # Authentication, ownership, CSRF, and errors
    └── utils/BillCounter.js   # Individual bill allocation algorithm
```

## Data Model

```text
User
 └── owns many Houses

House
 ├── has many Rooms
 ├── has many BillingCycles
 ├── points to one active BillingCycle
 └── points to one previous BillingCycle

BillingCycle
 ├── belongs to one House
 ├── has one MainBill
 ├── has many RoomReadings
 └── has many RoomBills

Room
 ├── belongs to one House
 ├── has many RoomReadings
 └── has many RoomBills

MainBill
 └── belongs to a House and BillingCycle

RoomReading
 ├── belongs to a Room
 └── belongs to a BillingCycle

RoomBill
 ├── belongs to a Room
 └── belongs to a BillingCycle
```

### Important fields

| Model | Key fields | Notes |
|---|---|---|
| `User` | `mobile_number`, `password` | Mobile number is unique; password is bcrypt-hashed. |
| `House` | `house_name`, `user_id`, `active_billing_cycle`, `previous_billing_cycle` | Tracks workflow state through cycle pointers. |
| `Room` | `meter_name`, `house_id` | Represents a submeter or household section. |
| `BillingCycle` | `house`, `startDate`, `endDate` | `endDate` is null while the cycle is active. |
| `MainBill` | `house_id`, `billing_cycle_id`, `total_units`, `total_amount`, `bill_date` | Supplier meter bill for one cycle. |
| `RoomReading` | `room_id`, `billing_cycle_id`, `reading_value`, `reading_date` | A room can only have one reading per cycle due to a unique index. |
| `RoomBill` | `room_id`, `billing_cycle_id`, `previous_reading`, `current_reading`, `units_consumed`, `amount` | A room can only have one bill per cycle due to a unique index. |

## Request Flow

1. `server/app.js` loads environment variables and creates the Express application.
2. EJS and `ejs-mate` render templates from `client/views`.
3. Static assets are served below `/public` from `client/public`.
4. JSON and URL-encoded form bodies are parsed.
5. A `_method` query parameter or body field overrides unsupported HTML form methods.
6. MongoDB and MongoDB-backed sessions are initialized.
7. Origin/referer validation rejects unsafe state-changing requests.
8. `isLoggedIn` redirects unauthenticated users to `/auth/login`.
9. Navbar house data is loaded into `res.locals.navHouses` for authenticated users.
10. Route modules dispatch to controllers.
11. Ownership middleware checks the current session against houses, rooms, cycles, and main bills.
12. Controllers read/write Mongoose models and render EJS or redirect.
13. A final error handler returns the application error page.

## Security and Access Control

- Passwords are stored only in bcrypt-hashed form.
- Sessions are stored in MongoDB and expire after one day.
- Session cookies are HTTP-only and use `sameSite: "lax"`.
- In production, session cookies are marked `secure` and the app trusts the reverse-proxy layer.
- `SESSION_SECRET` is mandatory in production.
- Login and signup endpoints are rate-limited.
- State-changing HTTP requests must match the host through `Origin` or `Referer` headers.
- House, room, cycle, and main-bill ownership is checked before authorized operations.
- House deletion removes dependent readings and bills.
- Room deletion removes dependent readings and bills.

## Prerequisites

- Node.js 18 or newer
- npm
- MongoDB, either local or hosted
- A modern browser

## Installation

Clone and enter the repository:

```bash
git clone https://github.com/shubham-tankariya-01/LiteBill.git
cd LiteBill
```

Install server dependencies:

```bash
cd server
npm install
```

## Environment Variables

Create `server/.env`:

```env
MONGO_URL=mongodb://127.0.0.1:27017/LiteBill
MONGO_DB_NAME=LiteBill
SESSION_SECRET=replace-with-a-long-random-secret
PORT=8080
NODE_ENV=development
```

| Variable | Required | Default | Purpose |
|---|---:|---|---|
| `MONGO_URL` | No | `mongodb://127.0.0.1:27017/LiteBill` | MongoDB connection string. |
| `MONGO_DB_NAME` | No | `LiteBill` | Database name passed to Mongoose and `connect-mongo`. |
| `SESSION_SECRET` | Yes in production | Development fallback secret | Signing secret for Express sessions. |
| `PORT` | No | `8080` | HTTP listening port. |
| `NODE_ENV` | No | unset | Set to `production` to require a session secret and enable secure cookies. |

In a hosted environment, configure `MONGO_URL` and `SESSION_SECRET` before starting the application.

## Running the Application

Start a local MongoDB instance, then run:

```bash
cd server
npm start
```

For automatic restarts during development:

```bash
cd server
npm run dev
```

Open:

```text
http://localhost:8080
```

The port can be changed with `PORT`.

There is no separate client build or development server. EJS templates and static assets are served directly by Express.

## Available Routes

### Public and account routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/auth/login` | Login page |
| `POST` | `/auth/login` | Authenticate |
| `GET` | `/auth/signup` | Signup page |
| `POST` | `/auth/signup` | Create account |
| `POST` | `/auth/logout` | End session |
| `GET` | `/auth/profile` | Account and usage statistics |
| `POST` | `/auth/change-password` | Change password |

### House routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/houses` | List houses |
| `GET` | `/houses/new` | New-house form |
| `POST` | `/houses` | Create house and meters |
| `GET` | `/houses/:houseId` | House dashboard |
| `PUT` | `/houses/:houseId` | Rename house |
| `DELETE` | `/houses/:houseId` | Delete house and its data |
| `GET` | `/houses/:houseId/history` | House billing history |

### Room routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/houses/:houseId/rooms` | List rooms |
| `POST` | `/houses/:houseId/rooms` | Add rooms |
| `GET` | `/rooms/:roomId` | Room detail |
| `PUT` | `/rooms/:roomId` | Rename room |
| `DELETE` | `/rooms/:roomId` | Delete room |
| `GET` | `/rooms/:roomId/analysis` | Room trend analysis |

### Main-bill, cycle, and reading routes

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/houses/:houseId/main-bill/new` | Enter the current main bill |
| `POST` | `/houses/:houseId/main-bill` | Create a main bill |
| `GET` | `/houses/:houseId/main-bill/:billId/edit` | Edit a main bill |
| `PUT` | `/houses/:houseId/main-bill/:billId` | Update a main bill |
| `DELETE` | `/houses/:houseId/main-bill/:billId` | Delete a main bill |
| `GET` | `/houses/:houseId/cycles` | List a house's cycles |
| `GET` | `/cycles/:cycleId/room-bills` | View generated room bills |
| `GET` | `/houses/:houseId/readings/new` | Setup or new cycle readings |
| `POST` | `/houses/:houseId/readings/setup` | Submit setup readings |
| `POST` | `/houses/:houseId/cycles/:cycleId/readings` | Submit cycle readings and generate bills |

## Billing Calculation

The calculation is implemented in `server/utils/BillCounter.js`.

Given:

- `M` = main bill total units
- `A` = main bill total amount
- `n` = number of rooms
- `r₁` = current room reading
- `r₀` = previous room reading

LiteBill calculates:

```text
raw consumption for a room = r₁ - r₀
cost per unit = A / M
total raw consumption = sum(raw consumption for all rooms)
unit difference = M - total raw consumption
equal unit adjustment = unit difference / n
adjusted units = raw consumption + equal unit adjustment
initial room amount = adjusted units × cost per unit
```

The room amounts are rounded to two decimal places. LiteBill then compares their sum with the supplier total and distributes any one-cent difference across rooms until the sum matches `A`.

A final validation rejects the result when the sum of room bills differs from the main bill amount by more than ₹0.01. The current implementation does not add a currency field to the data model; the UI and descriptions use the rupee symbol.

## Frontend Behavior

- `houses.js` and `rooms.js` add responsive add/delete and modal interactions.
- `polish.js` adds general interface improvements.
- Utility scripts under `client/public/js/utilities/` provide shared browser behavior.
- Billing and reading views contain inline JavaScript for live total and validation calculations.
- The reading form compares current readings against previous readings and disables submission when readings are incomplete or invalid.
- Shared EJS partials provide the navbar, add/delete modals, and empty states.

## Testing and Quality Status

The package currently contains no real test suite:

```json
"test": "echo \"Error: no test specified\" && exit 1"
```

Recommended verification steps before changes or releases include:

1. Sign up and log in.
2. Create a house with several meters.
3. Submit setup readings.
4. Enter a main bill.
5. Submit end-cycle readings.
6. Confirm room bills sum exactly to the main bill amount.
7. Confirm a next cycle is created.
8. Confirm history, room analysis, editing, logout, and password change work.
9. Confirm users cannot access another user's houses or meters.
10. Confirm duplicate submissions do not create duplicate readings or bills.

## Deployment Notes

The server is a Node/Express process and requires MongoDB in every environment.

Before production deployment:

- Set `NODE_ENV=production`.
- Set a strong random `SESSION_SECRET`.
- Use a hosted or managed MongoDB connection string.
- Set `MONGO_DB_NAME` explicitly if it differs from `LiteBill`.
- Put the app behind HTTPS when relying on secure session cookies.
- Configure the platform's proxy trust behavior correctly; `app.js` enables `trust proxy`.
- Ensure persistent MongoDB storage includes session and billing data.

The listening port uses `PORT`, with `8080` as the local default.

## Known Implementation Details and Limitations

- This repository currently supports manual meter-reading entry. Static meter/house images are included in `client/public/images`, but no image-upload or OCR service is wired into the reading controllers or routes.
- There is no automated test suite or lint script.
- The project has no root-level manifest or Docker/Compose file; npm commands run inside `server/`.
- MongoDB must be available before session and application setup operate reliably.
- The setup uses a development fallback session secret if `SESSION_SECRET` is not set outside production.
- Room consumption validation is primarily browser-assisted. Server-side duplicate prevention and model constraints exist, but invalid negative or inconsistent values should also be audited in future API hardening.
- Bill allocation assumes all rooms should receive an equal share of unit differences caused by meter reconciliation.
- No `currency` field is stored with main or room bills.
- Main-bill editing does not automatically recalculate previously generated room bills.

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Keep server code inside `server/` and presentation assets/templates inside `client/`.
4. Preserve the owner-checking middleware for protected resources.
5. Preserve cycle pointers and unique room-reading/room-bill indexes when changing workflow code.
6. Add automated tests for billing calculations and authorization.
7. Open a pull request with setup steps and test evidence.

## License

The `server/package.json` declares the package license as `ISC`, but no repository-level `LICENSE` file is currently present. Review this with the project owner before redistribution or commercial use.
