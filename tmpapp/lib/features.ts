/**
 * Application feature flags.
 * Features can be toggled on or off without deleting underlying database columns or business logic.
 */

// Billing is handled manually during founder partner phase.
export const BILLING_ENABLED = false

// SMS messaging is hidden per current marketing alignment.
export const SMS_ENABLED = false

// Multi-state management is hidden per current marketing alignment.
export const MULTI_STATE_ENABLED = false
