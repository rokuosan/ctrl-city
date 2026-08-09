export type ComparisonMode = "before" | "after";

export type ControlsCallbacks = Readonly<{
  onModeChange: (mode: ComparisonMode) => void;
  onOpacityChange: (opacity: number) => void;
  onRotationChange: (rotationDeg: number) => void;
}>;

export type Controls = Readonly<{
  setError: (message: string) => void;
  setReady: () => void;
  setStatus: (message: string, progress: number) => void;
}>;

const PASTE_SEQUENCE_TIMINGS = {
  copy: 1_300,
  transfer: 1_100,
  paste: 1_500,
  complete: 1_200,
} as const;

const REDUCED_MOTION_STEP_MS = 40;

export function wireControls(
  root: HTMLElement,
  callbacks: ControlsCallbacks,
): Controls {
  const beforeButton = requireElement<HTMLButtonElement>(root, "#mode-before");
  const afterButton = requireElement<HTMLButtonElement>(root, "#mode-after");
  const pasteButton = requireElement<HTMLButtonElement>(root, "#paste-button");
  const rotationInput = requireElement<HTMLInputElement>(root, "#rotation");
  const opacityInput = requireElement<HTMLInputElement>(root, "#opacity");
  const rotationValue = requireElement<HTMLOutputElement>(root, "#rotation-value");
  const opacityValue = requireElement<HTMLOutputElement>(root, "#opacity-value");
  const status = requireElement<HTMLElement>(root, "#load-status");
  const statusText = requireElement<HTMLElement>(root, "#load-status-text");
  const statusProgress = requireElement<HTMLElement>(root, "#load-progress");
  const retryButton = requireElement<HTMLButtonElement>(root, "#retry-button");
  const sequence = requireElement<HTMLElement>(root, "#copy-sequence");
  const aboutDialog = requireElement<HTMLDialogElement>(root, "#about-dialog");
  const aboutButton = requireElement<HTMLButtonElement>(root, "#about-button");
  const aboutClose = requireElement<HTMLButtonElement>(root, "#about-close");

  let sequenceRunning = false;

  const updateMode = (nextMode: ComparisonMode) => {
    root.dataset.mode = nextMode;
    beforeButton.setAttribute("aria-pressed", String(nextMode === "before"));
    afterButton.setAttribute("aria-pressed", String(nextMode === "after"));
    pasteButton.querySelector("span")!.textContent =
      nextMode === "before" ? "COPY & PASTE" : "PASTE AGAIN";
    callbacks.onModeChange(nextMode);
  };

  beforeButton.addEventListener("click", () => updateMode("before"));
  afterButton.addEventListener("click", () => updateMode("after"));

  rotationInput.addEventListener("input", () => {
    const rotation = Number(rotationInput.value);
    rotationValue.value = `${rotation > 0 ? "+" : ""}${rotation}°`;
    callbacks.onRotationChange(rotation);
  });

  opacityInput.addEventListener("input", () => {
    const opacity = Number(opacityInput.value) / 100;
    opacityValue.value = `${Math.round(opacity * 100)}%`;
    callbacks.onOpacityChange(opacity);
  });

  pasteButton.addEventListener("click", () => {
    if (!sequenceRunning) {
      void runPasteSequence();
    }
  });

  retryButton.addEventListener("click", () => window.location.reload());
  aboutButton.addEventListener("click", () => aboutDialog.showModal());
  aboutClose.addEventListener("click", () => aboutDialog.close());
  aboutDialog.addEventListener("click", (event) => {
    if (event.target === aboutDialog) {
      aboutDialog.close();
    }
  });

  async function runPasteSequence(): Promise<void> {
    sequenceRunning = true;
    pasteButton.disabled = true;
    sequence.hidden = false;
    sequence.dataset.step = "copy";

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    await delay(
      reduceMotion ? REDUCED_MOTION_STEP_MS : PASTE_SEQUENCE_TIMINGS.copy,
    );

    sequence.dataset.step = "transfer";
    await delay(
      reduceMotion ? REDUCED_MOTION_STEP_MS : PASTE_SEQUENCE_TIMINGS.transfer,
    );

    updateMode("after");
    sequence.dataset.step = "paste";
    await delay(
      reduceMotion ? REDUCED_MOTION_STEP_MS : PASTE_SEQUENCE_TIMINGS.paste,
    );

    sequence.dataset.step = "complete";
    await delay(
      reduceMotion ? REDUCED_MOTION_STEP_MS : PASTE_SEQUENCE_TIMINGS.complete,
    );

    sequence.hidden = true;
    sequence.dataset.step = "copy";
    pasteButton.disabled = false;
    sequenceRunning = false;
    pasteButton.focus();
  }

  return {
    setStatus(message: string, progress: number) {
      status.dataset.state = "loading";
      statusText.textContent = message;
      statusProgress.style.setProperty(
        "--load-progress",
        `${Math.round(progress * 100)}%`,
      );
    },
    setReady() {
      status.dataset.state = "ready";
      statusText.textContent = "2都市のデータ接続完了";
      statusProgress.style.setProperty("--load-progress", "100%");
      pasteButton.disabled = false;
      beforeButton.disabled = false;
      afterButton.disabled = false;
      rotationInput.disabled = false;
      opacityInput.disabled = false;
    },
    setError(message: string) {
      status.dataset.state = "error";
      statusText.textContent = message;
      retryButton.hidden = false;
      pasteButton.disabled = true;
    },
  };
}

function requireElement<T extends Element>(
  root: HTMLElement,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required UI element was not found: ${selector}`);
  }
  return element;
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}
