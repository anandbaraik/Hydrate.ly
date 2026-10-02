# Product Requirements Document

## Product
Hydrate.ly – Water & Break Reminder
Tagline: Small sips, better focus

## Problem
People at a screen forget to drink water and take breaks.

## Target users
People who spend long hours in Google Chrome or Microsoft Edge.

## Goal
Remind users to hydrate and rest, and track daily water intake,
without accounts, servers or subscriptions.

## Core features (MVP)

### Smart Reminders
- Water reminders: presets of 30, 45 or 60 minutes,
  plus a custom interval from 15 minutes to 4 hours
- Break reminders: 20-20-20 eye rule or Pomodoro-style intervals
- Native browser notification with an optional gentle chime
- Custom notification message
- Persistent or banner-style notifications

### Intake Tracking
- One-tap logging: 250 ml, 500 ml or a custom amount
- Daily goal with a progress ring in the popup (default 2,500 ml)
- ml / oz unit toggle

### Quick Actions
- Snooze and "I drank" buttons on the notification

### 7-Day History
- Bar chart of intake over the past week
- Daily average and streak count

### Focus-Friendly
- Quiet hours (e.g. no reminders after 8 PM)
- One-click pause: 30 minutes, 1 hour, or until tomorrow
- Auto-pause when the user is away (chrome.idle)

### 100% Private
- No accounts, servers or subscriptions
- All data stays on the device

## Targets
Google Chrome and Microsoft Edge (one codebase, one build)

## Out of scope
- Other browsers
- Accounts or sign-in
- Servers or backend
- Subscriptions or payments

## Success criteria
A user can:
1. Install the extension in Chrome or Edge
2. Set a daily goal and reminder interval
3. Receive a water reminder on schedule
4. Log a drink from the popup or the notification
5. Snooze a reminder from the notification
6. See the progress ring fill toward the goal
7. See the last 7 days of intake, average and streak
8. Get no reminders during quiet hours or while paused
