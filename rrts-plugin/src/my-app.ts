import { IRouteableComponent } from "@aurelia/router";

import Sortable from "sortablejs";

import "./css/theme.css";

const DEFECTS = [
  "EMPTY",
  "CUSTOM",
  "Cracking",
  "Crocodile Cracking",
  "Cracking (Deformation)",
  "Crocodile Cracking (Deformation)",
  "Pothole",
  "Shoving",
  "Edge Break",
  "Low Shoulder",
  "Flushing",
  "Stripping / Ravelling",
  "Overgrown Vegetation",
];

export class MyApp implements IRouteableComponent {
  private spreadsheetId: string;

  private defectOptions: string[] = [];

  private defect: string;

  binding(): void {
    this.spreadsheetId = window.localStorage.getItem("spreadsheetId");

    if (this.saveSpreadsheetId) {
      this.saveSpreadsheetId();
    }

    const defects = window.localStorage.getItem("defects");

    if (!defects) {
      this.defectOptions = [...DEFECTS];
    } else {
      this.defectOptions = JSON.parse(defects);
    }

    console.log(this.defectOptions, this.spreadsheetId);

    this.sendDefectsToBackground();
  }

  attached(): void {
    const sortable = Sortable.create(document.getElementById("defects"), {
      onEnd: (event) => {
        const tempSortable = this.defectOptions[event.oldIndex];
        this.defectOptions.splice(event.oldIndex, 1);
        this.defectOptions.splice(event.newIndex, 0, tempSortable);
        window.localStorage.setItem("defects", JSON.stringify(this.defectOptions));
        chrome.runtime.sendMessage({ defects: this.defectOptions });
      },
    });

    chrome.runtime.sendMessage({ defects: this.defectOptions });
  }

  saveSpreadsheetId(): void {
    window.localStorage.setItem("spreadsheetId", this.spreadsheetId);
    chrome.runtime.sendMessage({ spreadsheetId: this.spreadsheetId });
  }

  sendDefectsToBackground(): void {
    window.localStorage.setItem("defects", JSON.stringify(this.defectOptions));
    chrome.runtime.sendMessage({ defects: this.defectOptions });
  }

  saveDefect(): void {
    this.defectOptions.push(this.defect);
    window.localStorage.setItem("defects", JSON.stringify(this.defectOptions));
    chrome.runtime.sendMessage({ defects: this.defectOptions });
    this.defect = "";
  }

  reset(): void {
    this.defectOptions = [...DEFECTS];
    window.localStorage.setItem("defects", JSON.stringify(this.defectOptions));
    chrome.runtime.sendMessage({ defects: this.defectOptions });
  }

  removeDefect(idx: number): void {
    this.defectOptions.splice(idx, 1);
    window.localStorage.setItem("defects", JSON.stringify(this.defectOptions));
    chrome.runtime.sendMessage({ defects: this.defectOptions });
  }
}
