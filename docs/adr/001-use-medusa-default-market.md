# ADR 001: Use Medusa's default market and currencies

- Status: Accepted
- Date: 2026-11-25

## Context

Crate & Cue is an infrastructure project. The shop exists to give the AWS
platform something realistic to run, not to be a finished retail business.
Customising currency, tax and payment for a specific country (for example KES
and M-Pesa) would take a lot of time and teach nothing about AWS.

## Decision

Keep the Medusa defaults: the Europe region, with EUR and USD, as created by
Medusa's starter seed. Add only a DJ product catalogue on top.

## Consequences

- No time spent on local payment or tax work. The effort goes to Terraform,
  ECS, networking, CI/CD and monitoring.
- The demo shop is not usable by Kenyan customers as-is.
- Reversible: a region, currency or payment provider can be added later
  through the Admin or a seed script. Doing it before real orders exist is
  cheap, and doing it after is not.
- Stripe test mode (from the design doc) works with these currencies, so the
  payment phase is not blocked.
