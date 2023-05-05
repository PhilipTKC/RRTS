/*
 ** Document Query Selectors
 ** Originally #body > div:nth-child(3)
 ** Injected HTML is injected as first childs.
 ** 1. Defect Legend
 ** 2. Calculator
 ** 3. Defect Panel
 */
let overlayEnabled = false;

/*
 ** Listen for Context Menu "Toggle Overlay".
 */
chrome.runtime.onMessage.addListener((request) => {
  if (request.toggleOverlay && request.toggleOverlay.isEnabled) {
    overlayEnabled = true;
    document.getElementById("defect-legend").style.display = "flex";
    document.getElementById("defect-calculator").style.display = "block";
    document.getElementById("defect-panel").style.display = "flex";

    setTimeout(() => mutationsObserver("add"), 1000);
  }

  if (request.toggleOverlay && !request.toggleOverlay.isEnabled) {
    overlayEnabled = false;

    // Reset
    document.getElementById("rrts-marked-point").innerHTML = "0";
    document.getElementById("rrts-calculation").innerHTML = "0";

    document.getElementById("defect-legend").style.display = "none";
    document.getElementById("defect-calculator").style.display = "none";
    document.getElementById("defect-panel").style.display = "none";
  }
});

function mutationsObserver(action: "add"): void {
  const observer = new MutationObserver((mutations) => {
    const movingPoint = (mutations[0].target as HTMLInputElement).value;

    document.getElementById("rrts-moving-point").innerHTML = movingPoint;

    const markedPointText = document.getElementById("rrts-marked-point").innerHTML;

    if (markedPointText && markedPointText.length > 0 && movingPoint) {
      const currentNumber = Number(markedPointText);
      const movingNumber = Number(movingPoint);

      const calculation = Math.abs(movingNumber - currentNumber).toString();

      document.getElementById("rrts-calculation").innerHTML = calculation;

      if (marking) {
        (document.querySelector("input[id='rrts-defect-length']") as HTMLInputElement).value = calculation;
      }
    }
  });

  if (action === "add") {
    const lengthSelector = document.querySelector(
      "#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBHL > div.GADMJONBBN > table > tbody > tr > td:nth-child(1) > input[type=text]"
    ) as HTMLInputElement;

    observer.observe(lengthSelector, {
      attributes: true,
      attributeFilter: ["value"],
    });
  }
}

/*
 ** Inject Defend Legend HTML
 ** Appends OL element
 ** Creates LI elements from Defects
 */
async function injectDefectLegend() {
  return fetch(chrome.runtime.getURL("static/defect-legend.html"))
    .then((response) => response.text())
    .then((html) => {
      const element: HTMLDivElement = document.createElement("div");
      element.innerHTML = html;

      const orderedListEl = element.querySelector("ol");

      const defectList: string[] = [];

      chrome.storage.local.get("defects", (storage) => {
        const defects = storage.defects;

        if (defects) {
          defects.forEach((defect: string, index: number) => {
            if (index > 1) {
              const listEl = document.createElement("li");

              listEl.className = "px-4";

              const spanStart = "<span style='display: inline-block; width:15px;'>";
              const spanEnd = "</span>";

              let digitShortcut: string;

              // Keybinds for 1-9
              if (index >= 1 && index <= 10) {
                digitShortcut = `${spanStart} ${index - 1} ${spanEnd} · ${defect}`;
              }

              // Keybinds 0
              if (index === 11) {
                digitShortcut = `${spanStart}0${spanEnd} · ${defect}`;
              }

              // Keybinds for - and =
              const minusShortcut = `${spanStart}-${spanEnd} · ${defect}`;
              const equalsShortcut = `${spanStart}=${spanEnd} · ${defect}`;

              const noShortcut = `${spanStart}${spanEnd} · ${defect}`;

              if (index > 1 && index < 12) {
                listEl.innerHTML = digitShortcut;
              } else if (index === 12) {
                listEl.innerHTML = minusShortcut;
              } else if (index === 13) {
                listEl.innerHTML = equalsShortcut;
              } else {
                listEl.innerHTML = noShortcut;
              }

              orderedListEl.appendChild(listEl);

              defectList.push(defect);
            }
          });
        }
      });

      return { element, defectList };
    });
}

let marking = false;
let markedData = void 0;

async function injectPointMarker(): Promise<HTMLDivElement> {
  return fetch(chrome.runtime.getURL("static/calculator.html"))
    .then((response) => response.text())
    .then((html) => {
      const element: HTMLDivElement = document.createElement("div");
      element.innerHTML = html;

      (element.querySelector("button[id='rrts-marker-button']") as HTMLButtonElement).onclick = () => {
        marking = true;

        const currentPoint = getCurrentPoint();

        (document.getElementById("rrts-defect-length") as HTMLInputElement).value = "0";

        element.querySelector("span[id='rrts-marked-point']").innerHTML = currentPoint;

        const metadataSelector = document.querySelector(
          "#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBNK"
        ) as HTMLDivElement;

        if (metadataSelector && metadataSelector.innerHTML.length > 0) {
          markedData = metadataSelector.innerHTML;
        }

        document.getElementById("rrts-marked-latlng").innerHTML = `${cleanData(markedData)[3]} / ${cleanData(markedData)[4]}`;
      };

      (element.querySelector("button[id='rrts-reset-button']") as HTMLButtonElement).onclick = () => {
        marking = false;
        resetMarkedData();
      };

      return element;
    });
}

async function injectDefectPanel(spreadsheetId: string): Promise<HTMLDivElement> {
  return fetch(chrome.runtime.getURL("static/defect-panel.html"))
    .then((response) => response.text())
    .then((html) => {
      const element: HTMLDivElement = document.createElement("div");
      element.innerHTML = html;

      const defectSelectEl = element.querySelector("select[id='rrts-defect-selector']");

      chrome.storage.local.get("defects", (storage) => {
        const defects = storage.defects;

        if (defects) {
          defects.forEach((defect: string) => {
            const el = document.createElement("option");
            el.value = defect;
            el.text = defect;
            defectSelectEl.appendChild(el);
          });
        }
      });

      (element.querySelector("button[id='rrts-insert-button']") as HTMLButtonElement).onclick = async () => {
        await addToSpreadsheet(spreadsheetId, {});
      };

      return element;
    });
}

let isAutoResetEnabled = false;

function autoResetEventListener(): void {
  if (!isAutoResetEnabled) {
    document.body.addEventListener("click", (ev) => {
      const element = ev.target as any;

      const acceptableTerms = ["Inc", "Dec"];

      const anchorText = (element as HTMLAnchorElement).innerHTML;

      if (overlayEnabled && anchorText && anchorText.length > 0) {
        const splitText = anchorText.split(" ");

        if (element.tagName === "A" && splitText.length > 0 && splitText.some((text) => acceptableTerms.includes(text))) {
          document.getElementById("rrts-mp-loader").style.display = "inline-block";

          // Reset
          resetInputs();
          resetMarkedData();

          setTimeout(() => {
            const lengthSelector = document.querySelector(
              "#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBHL > div.GADMJONBBN > table > tbody > tr > td:nth-child(1) > input[type=text]"
            ) as HTMLInputElement;

            document.querySelector("span[id='rrts-moving-point']").innerHTML = lengthSelector.value;

            mutationsObserver("add");

            document.getElementById("rrts-mp-loader").style.display = "none";
          }, 1000);
        }
      }
    });

    isAutoResetEnabled = true;
  }
}

chrome.storage.local.get("spreadsheetId", async (item) => {
  const spreadsheetId: string = item.spreadsheetId;

  if (!spreadsheetId) {
    alert("Spreadsheet ID has not been set. Please go to RRTS Extension options");
    return;
  }

  const { element, defectList } = await injectDefectLegend();
  document.body.insertBefore(element, document.body.firstChild);

  listenForKeyboardShortcutEvents(spreadsheetId, defectList);

  const calculatorElement = await injectPointMarker();
  document.body.insertBefore(calculatorElement, document.body.firstChild);

  const defectPanel = await injectDefectPanel(spreadsheetId);
  document.body.insertBefore(defectPanel, document.body.firstChild);

  autoResetEventListener();
});

/*
 ** Defects
 */
async function listenForKeyboardShortcutEvents(spreadsheetId: string, defects: string[]): Promise<void> {
  document.addEventListener("keydown", async (event) => {
    if (overlayEnabled && event.code === "Enter") {
      await addToSpreadsheet(spreadsheetId, {});
    }

    /*
     ** Determine if Overlay is enabled.
     ** Determine if Control and Alt key is currently pressed.
     */
    if ((overlayEnabled && event.ctrlKey && event.altKey) || (event.ctrlKey && event.metaKey)) {
      /*
       ** Determine if Numpad Shortcut key is currently pressed.
       ** Numpad 0-9
       */

      if (event.code === "Digit1" && defects[0]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[0], index: 2 });
      }

      if (event.code === "Digit2" && defects[1]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[1], index: 3 });
      }

      if (event.code === "Digit3" && defects[2]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[2], index: 4 });
      }

      if (event.code === "Digit4" && defects[3]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[3], index: 5 });
      }

      if (event.code === "Digit5" && defects[4]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[4], index: 6 });
      }

      if (event.code === "Digit6" && defects[5]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[5], index: 7 });
      }

      if (event.code === "Digit7" && defects[6]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[6], index: 8 });
      }

      if (event.code === "Digit8" && defects[7]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[7], index: 9 });
      }

      if (event.code === "Digit9" && defects[8]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[8], index: 10 });
      }

      if (event.code === "Digit0" && defects[9]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[9], index: 11 });
      }

      /* Non Numeric Shortcuts */

      if (event.code === "Minus" && defects[10]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[10], index: 12 });
      }

      if (event.code === "Equal" && defects[11]) {
        await addToSpreadsheet(spreadsheetId, { optComment: defects[11], index: 13 });
      }
    }
  });
}

function getCurrentPoint(): string {
  const calculation = document.getElementById("rrts-calculation");

  if (calculation) {
    calculation.innerHTML = "0";
  }

  const lengthSelector = document.querySelector(
    "#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBHL > div.GADMJONBBN > table > tbody > tr > td:nth-child(1) > input[type=text]"
  ) as HTMLInputElement;

  return lengthSelector.value;
}

async function addToSpreadsheet(spreadsheetId: string, { optComment = undefined, index = undefined }) {
  const metadataSelector = document.querySelector(
    "#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBNK"
  ) as HTMLDivElement;

  if (metadataSelector && metadataSelector.innerHTML.length > 0) {
    const notifierContainer = document.getElementById("rrt-indicator-container");
    notifierContainer.style.visibility = "visible";

    const indicator = document.getElementById("rrts-indicator");
    indicator.className = "fa fa-spinner fa-spin";
    indicator.style.color = "#FFF";

    /*
     ** [0] Road ID
     ** [1] Road ID (Increasing/Decreasing)
     ** [2] Road Length
     ** [3] Latitude
     ** [4] Longitude
     ** [5] Capture Date
     */
    let data: string[];

    if (markedData) {
      data = cleanData(markedData);
    } else {
      data = cleanData(metadataSelector.innerHTML);
    }

    const roadId: string = parseRoadId(data[0]);

    const roadNumber: string = parseRoadNumber(roadId);

    const rrd: number = parseRRD(data[2]);

    const comment: string = determineCommentType(optComment, index);

    const laneCode: string = (document.getElementById("rrts-lane-code-selector") as HTMLSelectElement).value;

    const length = (document.getElementById("rrts-defect-length") as HTMLInputElement).value || "";

    const width = (document.getElementById("rrts-defect-width") as HTMLInputElement).value || "";

    const quantity = (document.getElementById("rrts-quantity") as HTMLInputElement).value || "";

    const unit = (document.getElementById("rrts-unit") as HTMLSelectElement).value;

    const metadata = {
      "Corrected RRD": rrd,
      comments: comment,
      cway_code: roadId.match(/(\d+) (U\/L|R)/)[2] === "U/L" ? "U/L" : "R",
      date_entered: new Date(), // Should use Server Date Instead
      lane_code: laneCode,
      latitude: data[3],
      Length: length,
      longitude: data[4],
      quantity: quantity,
      road_no: roadNumber,
      Road: roadId,
      units: unit,
      Width: width,
    };

    const headers = new Headers();

    headers.append("Content-Type", "application/json");

    const body = JSON.stringify({ spreadsheetId, metadata });

    const requestOptions = {
      method: "POST",
      headers,
      body,
    };

    const response = await fetch("http://localhost:5000/api/v1/spreadsheet/append", requestOptions);

    if (response.status === 200) {
      indicator.className = "fa fa-check";
      indicator.style.color = "yellow";
    } else {
      indicator.className = "fa fa-times";
      indicator.style.color = "red";
    }

    setTimeout(() => {
      notifierContainer.style.visibility = "hidden";
    }, 3000);

    resetInputs();
    resetMarkedData();
  }
}

function cleanData(data: string): string[] {
  return data
    .replace("Lat/Long", "")
    .split(",")
    .map((data) => {
      return data.trim();
    });
}

function parseRoadId(roadId: string): string {
  return roadId.replace("-", " ");
}

function parseRoadNumber(roadId: string): string {
  return roadId.split(" ")[0];
}

function parseRRD(rrd: string): number {
  return Number(rrd.replace(/[^0-9]/g, "")) / 1000;
}

/*
 ** optComment / Index used when Defect comment name is passed in from Keyboard Shortcut Events.
 ** value used when manually selected from Defect Selection Dropdown.
 */
function determineCommentType(optComment?: string, index?: number): string {
  if (optComment) {
    (document.getElementById("rrts-defect-selector") as HTMLSelectElement).selectedIndex = index;
  }

  let comment = optComment || (document.getElementById("rrts-defect-selector") as HTMLSelectElement).value;

  if (comment === "EMPTY") {
    comment = "";
  }

  if (comment === "CUSTOM") {
    comment = prompt("Enter Comment");
  }

  return comment;
}

function resetInputs(): void {
  (document.getElementById("rrts-defect-width") as HTMLInputElement).value = "";
  (document.getElementById("rrts-defect-length") as HTMLInputElement).value = "";
  (document.getElementById("rrts-quantity") as HTMLInputElement).value = "";
}

function resetMarkedData(): void {
  marking = false;
  markedData = undefined;
  document.getElementById("rrts-marked-point").innerHTML = "0";
  document.getElementById("rrts-calculation").innerHTML = "0";
  document.getElementById("rrts-marked-latlng").innerHTML = "";
  (document.getElementById("rrts-defect-length") as HTMLInputElement).value = "";
}
