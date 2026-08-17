/**
 * Tests for the TemplatePlaceholderPreview debounce behaviour.
 *
 * The component debounces headline, body, and accentColor by 150 ms so that
 * rapid keystrokes do not cause the preview to flicker on slow machines.
 *
 * Each group verifies three guarantees:
 *   1. The preview DOM does NOT change while typing (before 150 ms elapses).
 *   2. At exactly 149 ms the old value is still present, and at 150 ms (1 ms later) the new value appears.
 *   3. The debounce timer truly resets on each keystroke — stale timers fire no intermediate value.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TemplatePlaceholderPreview } from "./AdPdfGenerator";

// An htmlBody that exercises all three placeholder tokens.
const ALL_HTML =
  "<p>{{headline}}</p><p>{{body}}</p><p style='color:{{accent_color}}'>.</p>";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── Helper ─────────────────────────────────────────────────────────────────────

/** Advance fake timers by ms and flush resulting React state updates. */
function tick(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// headline
// ═══════════════════════════════════════════════════════════════════════════════

describe("TemplatePlaceholderPreview — headline debounce", () => {
  it("does not update the preview immediately on prop change", () => {
    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Initial headline"
        body="Body"
        accentColor="#ff0000"
      />
    );

    expect(screen.getByText(/Initial headline/i)).toBeDefined();

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Updated headline"
        body="Body"
        accentColor="#ff0000"
      />
    );

    // 0 ms elapsed — debounce has NOT fired.
    expect(screen.queryByText(/Updated headline/i)).toBeNull();
    expect(screen.getByText(/Initial headline/i)).toBeDefined();
  });

  it("still shows the old value at 149 ms and the new value at 150 ms", () => {
    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Initial headline"
        body="Body"
        accentColor="#ff0000"
      />
    );

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Updated headline"
        body="Body"
        accentColor="#ff0000"
      />
    );

    // 149 ms — one millisecond short of the debounce boundary.
    tick(149);
    expect(screen.queryByText(/Updated headline/i)).toBeNull();
    expect(screen.getByText(/Initial headline/i)).toBeDefined();

    // One more millisecond — the timer fires exactly at 150 ms.
    tick(1);
    expect(screen.getByText(/Updated headline/i)).toBeDefined();
    expect(screen.queryByText(/Initial headline/i)).toBeNull();
  });

  it("resets the timer on each keystroke — no intermediate value ever renders", () => {
    // Timeline (clock starts at 0 after initial render):
    //   t=0   prop→"aaab"   timer-A fires at t=150
    //   t=40  prop→"aaabc"  cancel A, timer-B fires at t=190
    //   t=80  prop→"aaabcd" cancel B, timer-C fires at t=230
    //   t=150 assert "aaab" NOT shown (A was cancelled)
    //   t=190 assert "aaabc" NOT shown (B was cancelled)
    //   t=230 assert "aaabcd" IS shown (C fires)

    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="aaa"
        body="Body"
        accentColor="#ff0000"
      />
    );

    // Keystroke 1: t=0 → t=40
    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="aaab"
        body="Body"
        accentColor="#ff0000"
      />
    );
    tick(40);

    // Keystroke 2: t=40 → t=80
    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="aaabc"
        body="Body"
        accentColor="#ff0000"
      />
    );
    tick(40);

    // Keystroke 3: t=80 (final value)
    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="aaabcd"
        body="Body"
        accentColor="#ff0000"
      />
    );

    // t=150: timer-A would have fired here — assert the intermediate value did NOT appear.
    tick(70);
    expect(screen.queryByText("aaab")).toBeNull();

    // t=190: timer-B would have fired here — assert "aaabc" did NOT appear.
    tick(40);
    expect(screen.queryByText("aaabc")).toBeNull();

    // t=230: timer-C fires — only the final value should be present.
    tick(40);
    expect(screen.getByText(/aaabcd/i)).toBeDefined();
    expect(screen.queryByText("aaab")).toBeNull();
    expect(screen.queryByText("aaabc")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// body
// ═══════════════════════════════════════════════════════════════════════════════

describe("TemplatePlaceholderPreview — body debounce", () => {
  it("does not update the body preview immediately on prop change", () => {
    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Initial body"
        accentColor="#ff0000"
      />
    );

    expect(screen.getByText(/Initial body/i)).toBeDefined();

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Updated body"
        accentColor="#ff0000"
      />
    );

    expect(screen.queryByText(/Updated body/i)).toBeNull();
    expect(screen.getByText(/Initial body/i)).toBeDefined();
  });

  it("still shows the old value at 149 ms and the new value at 150 ms", () => {
    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Initial body"
        accentColor="#ff0000"
      />
    );

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Updated body"
        accentColor="#ff0000"
      />
    );

    tick(149);
    expect(screen.queryByText(/Updated body/i)).toBeNull();
    expect(screen.getByText(/Initial body/i)).toBeDefined();

    tick(1);
    expect(screen.getByText(/Updated body/i)).toBeDefined();
    expect(screen.queryByText(/Initial body/i)).toBeNull();
  });

  it("resets the timer on each keystroke — no intermediate value ever renders", () => {
    // Same staggered-40 ms pattern as the headline test.
    // t=0   prop→"body-b"    timer-A fires at t=150
    // t=40  prop→"body-bc"   cancel A, timer-B fires at t=190
    // t=80  prop→"body-bcd"  cancel B, timer-C fires at t=230

    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="body-a"
        accentColor="#ff0000"
      />
    );

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="body-b"
        accentColor="#ff0000"
      />
    );
    tick(40);

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="body-bc"
        accentColor="#ff0000"
      />
    );
    tick(40);

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="body-bcd"
        accentColor="#ff0000"
      />
    );

    // t=150: timer-A would have fired.
    tick(70);
    expect(screen.queryByText("body-b")).toBeNull();

    // t=190: timer-B would have fired.
    tick(40);
    expect(screen.queryByText("body-bc")).toBeNull();

    // t=230: timer-C fires — only the final value appears.
    tick(40);
    expect(screen.getByText(/body-bcd/i)).toBeDefined();
    expect(screen.queryByText("body-b")).toBeNull();
    expect(screen.queryByText("body-bc")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// accentColor
// ═══════════════════════════════════════════════════════════════════════════════

describe("TemplatePlaceholderPreview — accentColor debounce", () => {
  it("does not update the accent color swatch immediately on prop change", () => {
    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#ff0000"
      />
    );

    // The resolved accent color is rendered in a <code> element.
    expect(screen.getByText("#ff0000")).toBeDefined();

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#00ff00"
      />
    );

    expect(screen.queryByText("#00ff00")).toBeNull();
    expect(screen.getByText("#ff0000")).toBeDefined();
  });

  it("still shows the old color at 149 ms and the new color at 150 ms", () => {
    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#ff0000"
      />
    );

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#00ff00"
      />
    );

    tick(149);
    expect(screen.queryByText("#00ff00")).toBeNull();
    expect(screen.getByText("#ff0000")).toBeDefined();

    tick(1);
    expect(screen.getByText("#00ff00")).toBeDefined();
    expect(screen.queryByText("#ff0000")).toBeNull();
  });

  it("resets the timer on each color change — no intermediate color ever renders", () => {
    // t=0   prop→"#bbbbbb"   timer-A fires at t=150
    // t=40  prop→"#cccccc"   cancel A, timer-B fires at t=190
    // t=80  prop→"#dddddd"   cancel B, timer-C fires at t=230

    const { rerender } = render(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#aaaaaa"
      />
    );

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#bbbbbb"
      />
    );
    tick(40);

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#cccccc"
      />
    );
    tick(40);

    rerender(
      <TemplatePlaceholderPreview
        htmlBody={ALL_HTML}
        headline="Headline"
        body="Body"
        accentColor="#dddddd"
      />
    );

    // t=150: timer-A would have fired.
    tick(70);
    expect(screen.queryByText("#bbbbbb")).toBeNull();

    // t=190: timer-B would have fired.
    tick(40);
    expect(screen.queryByText("#cccccc")).toBeNull();

    // t=230: timer-C fires — only the final color appears.
    tick(40);
    expect(screen.getByText("#dddddd")).toBeDefined();
    expect(screen.queryByText("#bbbbbb")).toBeNull();
    expect(screen.queryByText("#cccccc")).toBeNull();
  });
});
