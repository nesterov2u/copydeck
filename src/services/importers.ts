import * as XLSX from "xlsx";

export async function readTextFile(file: File) {
  return await file.text();
}

export async function readDocxFile(file: File) {
  const mammoth = await import("mammoth/mammoth.browser");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function readSpreadsheetFile(file: File, rowMode = false) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(worksheet, {
    header: 1,
    blankrows: false
  });

  if (rowMode) {
    return rows.map((row) => row.filter(Boolean).join("  ")).filter(Boolean).join("\n\n");
  }

  return rows.flat().filter(Boolean).map(String).join("\n\n");
}
