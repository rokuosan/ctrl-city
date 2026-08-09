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
  copy: 850,
  transfer: 700,
  paste: 950,
  complete: 700,
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
  let awaitingKeyboardPaste = false;
  let controlsReady = false;

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
      void runAutomaticPasteSequence();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    if (event.key === "Escape" && awaitingKeyboardPaste) {
      event.preventDefault();
      resetSequence(false);
      return;
    }

    if ((!event.ctrlKey && !event.metaKey) || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "c" && controlsReady && !sequenceRunning) {
      event.preventDefault();
      startKeyboardCopy();
    } else if (key === "v" && awaitingKeyboardPaste) {
      event.preventDefault();
      awaitingKeyboardPaste = false;
      void runPasteStages(false);
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

  function prepareSequence(input: "button" | "keyboard", step: string): void {
    sequenceRunning = true;
    pasteButton.disabled = true;
    sequence.hidden = false;
    sequence.dataset.input = input;
    sequence.dataset.step = step;
  }

  function startKeyboardCopy(): void {
    awaitingKeyboardPaste = true;
    prepareSequence("keyboard", "waiting");
  }

  async function runAutomaticPasteSequence(): Promise<void> {
    prepareSequence("button", "copy");

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    await delay(
      reduceMotion ? REDUCED_MOTION_STEP_MS : PASTE_SEQUENCE_TIMINGS.copy,
    );

    await runPasteStages(true);
  }

  async function runPasteStages(focusButton: boolean): Promise<void> {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

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

    resetSequence(focusButton);
  }

  function resetSequence(focusButton: boolean): void {
    sequence.hidden = true;
    sequence.dataset.step = "copy";
    delete sequence.dataset.input;
    awaitingKeyboardPaste = false;
    sequenceRunning = false;
    pasteButton.disabled = !controlsReady;
    if (focusButton) {
      pasteButton.focus();
    }
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
      controlsReady = true;
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
      controlsReady = false;
      status.dataset.state = "error";
      statusText.textContent = message;
      retryButton.hidden = false;
      pasteButton.disabled = true;
    },
  };
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
    ),
  );
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
