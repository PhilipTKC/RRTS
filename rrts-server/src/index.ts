interface Metadata {
    Road: string;
    "Corrected RRD": string;
    latitude: string;
    longitude: string;
    road_no: string;
    cway_code: string;
    lane_code: string;
    Length: string;
    Width: string;
    quantity: string;
    units: string;
    date_entered: string;
    due_date: string;
    date_closed: string;
    comments: string;

}

/* eslint-disable @typescript-eslint/no-var-requires */
import express, { Request, Response } from "express";

import cors from "cors";

import { GoogleSpreadsheet, GoogleSpreadsheetRow } from 'google-spreadsheet';

import credentials from './rrts.json';

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});

app.post("/api/v1/spreadsheet/append", async (request: Request, response: Response) => {
    const { spreadsheetId, metadata } = request.body;

    if (!spreadsheetId || !metadata) {
        return response.send(JSON.stringify({ message: "Spreadsheet ID or Metadata cannot be empty" })).sendStatus(400);
    }

    const defectsDocument = new GoogleSpreadsheet(spreadsheetId);

    defectsDocument.useServiceAccountAuth(credentials);

    await defectsDocument.loadInfo();

    const defectEditSheet = defectsDocument.sheetsByIndex[0];

    await defectEditSheet.addRow(metadata, { raw: false, insert: true });

    // Check for errors

    console.log(`Inserting into ${spreadsheetId}`);
    console.log(metadata);

    return response.status(200).send(JSON.stringify({ inserted: true }));
});

const PORT = 5000;

app.listen(PORT).on("listening", async () => {
    console.log("Listening on Port 5000");
});