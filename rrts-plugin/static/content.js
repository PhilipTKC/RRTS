var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
/*
 ** Document Query Selectors
 ** Originally #body > div:nth-child(3)
 ** Injected HTML is injected as first childs.
 ** 1. Defect Legend
 ** 2. Calculator
 ** 3. Defect Panel
 */
var overlayEnabled = false;
/*
 ** Listen for Context Menu "Toggle Overlay".
 */
chrome.runtime.onMessage.addListener(function (request) {
    if (request.toggleOverlay && request.toggleOverlay.isEnabled) {
        overlayEnabled = true;
        document.getElementById("defect-legend").style.display = "flex";
        document.getElementById("defect-calculator").style.display = "block";
        document.getElementById("defect-panel").style.display = "flex";
        setTimeout(function () { return mutationsObserver("add"); }, 1000);
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
function mutationsObserver(action) {
    var observer = new MutationObserver(function (mutations) {
        var movingPoint = mutations[0].target.value;
        document.getElementById("rrts-moving-point").innerHTML = movingPoint;
        var markedPointText = document.getElementById("rrts-marked-point").innerHTML;
        if (markedPointText && markedPointText.length > 0 && movingPoint) {
            var currentNumber = Number(markedPointText);
            var movingNumber = Number(movingPoint);
            var calculation = Math.abs(movingNumber - currentNumber).toString();
            document.getElementById("rrts-calculation").innerHTML = calculation;
            if (marking) {
                document.querySelector("input[id='rrts-defect-length']").value = calculation;
            }
        }
    });
    if (action === "add") {
        var lengthSelector = document.querySelector("#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBHL > div.GADMJONBBN > table > tbody > tr > td:nth-child(1) > input[type=text]");
        observer.observe(lengthSelector, {
            attributes: true,
            attributeFilter: ["value"]
        });
    }
}
/*
 ** Inject Defend Legend HTML
 ** Appends OL element
 ** Creates LI elements from Defects
 */
function injectDefectLegend() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, fetch(chrome.runtime.getURL("static/defect-legend.html"))
                    .then(function (response) { return response.text(); })
                    .then(function (html) {
                    var element = document.createElement("div");
                    element.innerHTML = html;
                    var orderedListEl = element.querySelector("ol");
                    var defectList = [];
                    console.log("Getting Defects");
                    chrome.storage.local.get("defects", function (storage) {
                        console.log(storage);
                        var defects = storage.defects;
                        if (defects) {
                            defects.forEach(function (defect, index) {
                                if (index > 1) {
                                    var listEl = document.createElement("li");
                                    listEl.className = "px-4";
                                    var spanStart = "<span style='display: inline-block; width:15px;'>";
                                    var spanEnd = "</span>";
                                    var digitShortcut = void 0;
                                    // Keybinds for 1-9
                                    if (index >= 1 && index <= 10) {
                                        digitShortcut = "".concat(spanStart, " ").concat(index - 1, " ").concat(spanEnd, " \u00B7 ").concat(defect);
                                    }
                                    // Keybinds 0
                                    if (index === 11) {
                                        digitShortcut = "".concat(spanStart, "0").concat(spanEnd, " \u00B7 ").concat(defect);
                                    }
                                    // Keybinds for - and =
                                    var minusShortcut = "".concat(spanStart, "-").concat(spanEnd, " \u00B7 ").concat(defect);
                                    var equalsShortcut = "".concat(spanStart, "=").concat(spanEnd, " \u00B7 ").concat(defect);
                                    var noShortcut = "".concat(spanStart).concat(spanEnd, " \u00B7 ").concat(defect);
                                    if (index > 1 && index < 12) {
                                        listEl.innerHTML = digitShortcut;
                                    }
                                    else if (index === 12) {
                                        listEl.innerHTML = minusShortcut;
                                    }
                                    else if (index === 13) {
                                        listEl.innerHTML = equalsShortcut;
                                    }
                                    else {
                                        listEl.innerHTML = noShortcut;
                                    }
                                    orderedListEl.appendChild(listEl);
                                    defectList.push(defect);
                                }
                            });
                        }
                    });
                    return { element: element, defectList: defectList };
                })];
        });
    });
}
var marking = false;
var markedData = void 0;
function injectPointMarker() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, fetch(chrome.runtime.getURL("static/calculator.html"))
                    .then(function (response) { return response.text(); })
                    .then(function (html) {
                    var element = document.createElement("div");
                    element.innerHTML = html;
                    element.querySelector("button[id='rrts-marker-button']").onclick = function () {
                        marking = true;
                        var currentPoint = getCurrentPoint();
                        document.getElementById("rrts-defect-length").value = "0";
                        element.querySelector("span[id='rrts-marked-point']").innerHTML = currentPoint;
                        var metadataSelector = document.querySelector("#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBNK");
                        if (metadataSelector && metadataSelector.innerHTML.length > 0) {
                            markedData = metadataSelector.innerHTML;
                        }
                        document.getElementById("rrts-marked-latlng").innerHTML = "".concat(cleanData(markedData)[3], " / ").concat(cleanData(markedData)[4]);
                    };
                    element.querySelector("button[id='rrts-reset-button']").onclick = function () {
                        marking = false;
                        resetMarkedData();
                    };
                    return element;
                })];
        });
    });
}
function injectDefectPanel(spreadsheetId) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, fetch(chrome.runtime.getURL("static/defect-panel.html"))
                    .then(function (response) { return response.text(); })
                    .then(function (html) {
                    var element = document.createElement("div");
                    element.innerHTML = html;
                    var defectSelectEl = element.querySelector("select[id='rrts-defect-selector']");
                    chrome.storage.local.get("defects", function (storage) {
                        var defects = storage.defects;
                        if (defects) {
                            defects.forEach(function (defect) {
                                var el = document.createElement("option");
                                el.value = defect;
                                el.text = defect;
                                defectSelectEl.appendChild(el);
                            });
                        }
                    });
                    element.querySelector("button[id='rrts-insert-button']").onclick = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, addToSpreadsheet(spreadsheetId, {})];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    return element;
                })];
        });
    });
}
var isAutoResetEnabled = false;
function autoResetEventListener() {
    if (!isAutoResetEnabled) {
        document.body.addEventListener("click", function (ev) {
            var element = ev.target;
            var acceptableTerms = ["Inc", "Dec"];
            var anchorText = element.innerHTML;
            if (overlayEnabled && anchorText && anchorText.length > 0) {
                var splitText = anchorText.split(" ");
                if (element.tagName === "A" && splitText.length > 0 && splitText.some(function (text) { return acceptableTerms.includes(text); })) {
                    document.getElementById("rrts-mp-loader").style.display = "inline-block";
                    // Reset
                    resetInputs();
                    resetMarkedData();
                    setTimeout(function () {
                        var lengthSelector = document.querySelector("#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBHL > div.GADMJONBBN > table > tbody > tr > td:nth-child(1) > input[type=text]");
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
chrome.storage.local.get("spreadsheetId", function (item) { return __awaiter(_this, void 0, void 0, function () {
    var spreadsheetId, _a, element, defectList, calculatorElement, defectPanel;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                spreadsheetId = item.spreadsheetId;
                if (!spreadsheetId) {
                    alert("Spreadsheet ID has not been set. Please go to RRTS Extension options");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, injectDefectLegend()];
            case 1:
                _a = _b.sent(), element = _a.element, defectList = _a.defectList;
                document.body.insertBefore(element, document.body.firstChild);
                listenForKeyboardShortcutEvents(spreadsheetId, defectList);
                return [4 /*yield*/, injectPointMarker()];
            case 2:
                calculatorElement = _b.sent();
                document.body.insertBefore(calculatorElement, document.body.firstChild);
                return [4 /*yield*/, injectDefectPanel(spreadsheetId)];
            case 3:
                defectPanel = _b.sent();
                document.body.insertBefore(defectPanel, document.body.firstChild);
                autoResetEventListener();
                return [2 /*return*/];
        }
    });
}); });
/*
 ** Defects
 */
function listenForKeyboardShortcutEvents(spreadsheetId, defects) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            document.addEventListener("keydown", function (event) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(overlayEnabled && event.code === "Enter")) return [3 /*break*/, 2];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, {})];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            if (!((overlayEnabled && event.ctrlKey && event.altKey) || (event.ctrlKey && event.metaKey))) return [3 /*break*/, 26];
                            if (!(event.code === "Digit1" && defects[0])) return [3 /*break*/, 4];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[0], index: 2 })];
                        case 3:
                            _a.sent();
                            _a.label = 4;
                        case 4:
                            if (!(event.code === "Digit2" && defects[1])) return [3 /*break*/, 6];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[1], index: 3 })];
                        case 5:
                            _a.sent();
                            _a.label = 6;
                        case 6:
                            if (!(event.code === "Digit3" && defects[2])) return [3 /*break*/, 8];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[2], index: 4 })];
                        case 7:
                            _a.sent();
                            _a.label = 8;
                        case 8:
                            if (!(event.code === "Digit4" && defects[3])) return [3 /*break*/, 10];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[3], index: 5 })];
                        case 9:
                            _a.sent();
                            _a.label = 10;
                        case 10:
                            if (!(event.code === "Digit5" && defects[4])) return [3 /*break*/, 12];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[4], index: 6 })];
                        case 11:
                            _a.sent();
                            _a.label = 12;
                        case 12:
                            if (!(event.code === "Digit6" && defects[5])) return [3 /*break*/, 14];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[5], index: 7 })];
                        case 13:
                            _a.sent();
                            _a.label = 14;
                        case 14:
                            if (!(event.code === "Digit7" && defects[6])) return [3 /*break*/, 16];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[6], index: 8 })];
                        case 15:
                            _a.sent();
                            _a.label = 16;
                        case 16:
                            if (!(event.code === "Digit8" && defects[7])) return [3 /*break*/, 18];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[7], index: 9 })];
                        case 17:
                            _a.sent();
                            _a.label = 18;
                        case 18:
                            if (!(event.code === "Digit9" && defects[8])) return [3 /*break*/, 20];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[8], index: 10 })];
                        case 19:
                            _a.sent();
                            _a.label = 20;
                        case 20:
                            if (!(event.code === "Digit0" && defects[9])) return [3 /*break*/, 22];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[9], index: 11 })];
                        case 21:
                            _a.sent();
                            _a.label = 22;
                        case 22:
                            if (!(event.code === "Minus" && defects[10])) return [3 /*break*/, 24];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[10], index: 12 })];
                        case 23:
                            _a.sent();
                            _a.label = 24;
                        case 24:
                            if (!(event.code === "Equal" && defects[11])) return [3 /*break*/, 26];
                            return [4 /*yield*/, addToSpreadsheet(spreadsheetId, { optComment: defects[11], index: 13 })];
                        case 25:
                            _a.sent();
                            _a.label = 26;
                        case 26: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
function getCurrentPoint() {
    var calculation = document.getElementById("rrts-calculation");
    if (calculation) {
        calculation.innerHTML = "0";
    }
    var lengthSelector = document.querySelector("#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBHL > div.GADMJONBBN > table > tbody > tr > td:nth-child(1) > input[type=text]");
    return lengthSelector.value;
}
function addToSpreadsheet(spreadsheetId, _a) {
    var _b = _a.optComment, optComment = _b === void 0 ? undefined : _b, _c = _a.index, index = _c === void 0 ? undefined : _c;
    return __awaiter(this, void 0, void 0, function () {
        var metadataSelector, notifierContainer_1, indicator, data, roadId, roadNumber, rrd, comment, laneCode, length_1, width, quantity, unit, metadata, headers, body, requestOptions, response;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    metadataSelector = document.querySelector("#body > div:nth-child(6) > div:nth-child(2) > div > div > div.GADMJONBEK > div.GADMJONBGL > div.GADMJONBNK");
                    if (!(metadataSelector && metadataSelector.innerHTML.length > 0)) return [3 /*break*/, 2];
                    notifierContainer_1 = document.getElementById("rrt-indicator-container");
                    notifierContainer_1.style.visibility = "visible";
                    indicator = document.getElementById("rrts-indicator");
                    indicator.className = "fa fa-spinner fa-spin";
                    indicator.style.color = "#FFF";
                    data = void 0;
                    if (markedData) {
                        data = cleanData(markedData);
                    }
                    else {
                        data = cleanData(metadataSelector.innerHTML);
                    }
                    roadId = parseRoadId(data[0]);
                    roadNumber = parseRoadNumber(roadId);
                    rrd = parseRRD(data[2]);
                    comment = determineCommentType(optComment, index);
                    laneCode = document.getElementById("rrts-lane-code-selector").value;
                    length_1 = document.getElementById("rrts-defect-length").value || "";
                    width = document.getElementById("rrts-defect-width").value || "";
                    quantity = document.getElementById("rrts-quantity").value || "";
                    unit = document.getElementById("rrts-unit").value;
                    metadata = {
                        "Corrected RRD": rrd,
                        comments: comment,
                        cway_code: roadId.match(/(\d+) (U\/L|R)/)[2] === "U/L" ? "U/L" : "R",
                        date_entered: new Date(),
                        lane_code: laneCode,
                        latitude: data[3],
                        Length: length_1,
                        longitude: data[4],
                        quantity: quantity,
                        road_no: roadNumber,
                        Road: roadId,
                        units: unit,
                        Width: width
                    };
                    headers = new Headers();
                    headers.append("Content-Type", "application/json");
                    body = JSON.stringify({ spreadsheetId: spreadsheetId, metadata: metadata });
                    requestOptions = {
                        method: "POST",
                        headers: headers,
                        body: body
                    };
                    return [4 /*yield*/, fetch("http://localhost:5000/api/v1/spreadsheet/append", requestOptions)];
                case 1:
                    response = _d.sent();
                    if (response.status === 200) {
                        indicator.className = "fa fa-check";
                        indicator.style.color = "yellow";
                    }
                    else {
                        indicator.className = "fa fa-times";
                        indicator.style.color = "red";
                    }
                    setTimeout(function () {
                        notifierContainer_1.style.visibility = "hidden";
                    }, 3000);
                    resetInputs();
                    resetMarkedData();
                    _d.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function cleanData(data) {
    return data
        .replace("Lat/Long", "")
        .split(",")
        .map(function (data) {
        return data.trim();
    });
}
function parseRoadId(roadId) {
    return roadId.replace("-", " ");
}
function parseRoadNumber(roadId) {
    return roadId.split(" ")[0];
}
function parseRRD(rrd) {
    return Number(rrd.replace(/[^0-9]/g, "")) / 1000;
}
/*
 ** optComment / Index used when Defect comment name is passed in from Keyboard Shortcut Events.
 ** value used when manually selected from Defect Selection Dropdown.
 */
function determineCommentType(optComment, index) {
    if (optComment) {
        document.getElementById("rrts-defect-selector").selectedIndex = index;
    }
    var comment = optComment || document.getElementById("rrts-defect-selector").value;
    if (comment === "EMPTY") {
        comment = "";
    }
    if (comment === "CUSTOM") {
        comment = prompt("Enter Comment");
    }
    return comment;
}
function resetInputs() {
    document.getElementById("rrts-defect-width").value = "";
    document.getElementById("rrts-defect-length").value = "";
    document.getElementById("rrts-quantity").value = "";
}
function resetMarkedData() {
    marking = false;
    markedData = undefined;
    document.getElementById("rrts-marked-point").innerHTML = "0";
    document.getElementById("rrts-calculation").innerHTML = "0";
    document.getElementById("rrts-marked-latlng").innerHTML = "";
    document.getElementById("rrts-defect-length").value = "";
}
