# Home Connect Laundry Card

A standalone Home Assistant dashboard card for Home Connect washers and dryers, built against the [`homeconnect_local_hass`](https://github.com/chris-mc1/homeconnect_local_hass) integration ("Home Connect Local"). Washers and dryers expose nearly identical entity shapes, so this is one card for both instead of two near-duplicates.

No upstream project existed for this (unlike the [Dishwasher Card](https://github.com/JupiterZen/homeassistant_custom_dishwasher_card), which is a fork), so this is a fresh build modeled on that one's structure and styling for consistency.

## Features

- Operation state, program, progress, finish time, connectivity, door status
- Program selection
- Power-on / start / pause / resume / stop actions, shown only for the entities that actually exist on the appliance
- Dryer-specific options (drying target, wrinkle guard, gentle) and washer-specific options (spin speed, washing temperature, prewash) — each rendered only if present
- Responsive layout with reduced-motion support

## Compatibility

Tested against a Bosch dryer (WQB246C7NL) and washer (WAWH2673NL) via `homeconnect_local_hass`. Should work with the core `home_connect` integration and `home_connect_alt` too, since entity discovery matches on platform + suffix rather than a specific integration.

## Installation

### HACS

1. Go to HACS → Custom Repositories and add this repository as a Custom Repository, category **Dashboard**.
2. Install **Home Connect Laundry Card**.
3. Reload the browser.

HACS installs the resource as `/hacsfiles/homeassistant_custom_laundry_card/homeassistant_custom_laundry_card.js`.

### Manual

Copy `dist/homeassistant_custom_laundry_card.js` to Home Assistant and register it as a JavaScript module.

## Configuration

### Automatic discovery from a device

```yaml
type: custom:laundry-card
device_id: <device-id>
title: Wasmachine
icon: mdi:washing-machine
```

### Manual entity mapping

```yaml
type: custom:laundry-card
title: Droger
icon: mdi:tumble-dryer
entities:
  connectivity: binary_sensor.badkamer_droger_connection
  door: sensor.badkamer_droger_door
  operation: sensor.badkamer_droger_operation_state
  finish: sensor.badkamer_droger_finish_in
  progress: sensor.badkamer_droger_program_progress
  activeProgram: sensor.badkamer_droger_active_program
  selectedProgram: select.badkamer_droger_selected_program
  power: switch.badkamer_droger_power
  pause: button.badkamer_droger_pause
  resume: button.badkamer_droger_resume
  stop: button.badkamer_droger_abort
  dryingTarget: select.badkamer_droger_drying_target
  wrinkleGuard: select.badkamer_droger_wrinkle_guard
  gentle: switch.badkamer_droger_gentle
```

## License

MIT
