# Riverside Suburban Medical Clinic - EHR Prototype

A fully interactive **front-end prototype** of an integrated Electronic Health Record (EHR)
system. There is **no backend** - all data is seeded and persisted in the browser via
`localStorage`, so every screen and flow works immediately.

Built with **React + Vite**, **Tailwind CSS**, **react-router-dom** and **lucide-react**.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually <http://localhost:5173>).

To create a production build: `npm run build` then `npm run preview`.

## Demo accounts

The login screen lists these (click a card to auto-fill):

| Role          | Username    | Password    |
| ------------- | ----------- | ----------- |
| Doctor        | `dmoyo`     | `doctor123` |
| Doctor        | `dpatel`    | `doctor123` |
| Receptionist  | `reception` | `front123`  |
| Administrator | `admin`     | `admin123`  |

> **Role-based access (FR01):** a receptionist **cannot** open clinical consultation
> notes or order labs / prescriptions; a doctor can. Only an administrator sees the
> Audit Log. The sidebar and pages adapt to the signed-in role.

## Feature map (functional requirements)

| FR   | Feature | Where |
| ---- | ------- | ----- |
| FR01 | Login + Role-Based Access Control | `Login`, `lib/rbac.js`, `ProtectedRoute` |
| FR02 | Audit log of every create/edit/delete | `Audit Log` page; logged in `DataContext` |
| FR03 | Patients: list, register, view/edit full record | `Patients`, `PatientDetail` |
| FR04 | Search by surname / ID / medical-aid number | search bar on `Patients` |
| FR05 | Appointments: book / reschedule / cancel, **double-booking blocked**, day & week views | `Appointments` |
| FR06 | Appointment reminders (simulated SMS/email toast) | "Remind" action on `Appointments` |
| FR07 | Walk-in queue with sequential numbers + "Call next" | `Queue` |
| FR08 | Itemised billing, full/partial payments, outstanding balance | `Billing` |
| FR09 | Insurance claims: submit + track status | `Claims` |
| FR10 | Lab orders + results, e-prescriptions to a pharmacy | `Lab & Pharmacy`, `PatientDetail` |
| —    | Dashboard summary (today, queue, invoices, labs) | `Dashboard` |

## Data & reset

Seed data (8 patients, doctors, a receptionist, an admin, plus existing appointments,
invoices, claims, lab orders and prescriptions) loads automatically on first run. It is
stored under the `ehr_db_v1` localStorage key.

To start fresh, sign in as **admin** and use **Reset demo data** on the Audit Log page
(or clear site data in your browser).

## Project structure

```
src/
  components/   Layout, Sidebar, ProtectedRoute, shared UI primitives
  context/      AuthContext (RBAC), DataContext (store + audit), ToastContext
  data/         seed.js — mock data
  lib/          utils.js (formatting, invoice math), rbac.js (permissions)
  pages/        one file per screen
```

> This is a college practicum prototype. Credentials are mock values stored in plain
> text on purpose - do not use real patient data.
