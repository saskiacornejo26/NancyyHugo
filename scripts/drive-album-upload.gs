var FOLDER_ID = '11eJdMf_xqjmCigrZzS9vguAdOpVFTDSy';
var SHEET_NAME = 'Canciones sugeridas';
var RSVP_SHEET_NAME = 'Confirmaciones';
var CSV_NAME = 'Canciones sugeridas.csv';
var RSVP_CSV_NAME = 'Confirmaciones.csv';

function doGet(e) {
  try {
    var p = (e && e.parameter) || {};
    if (p.type === 'song') {
      return jsonOut(saveSong(p));
    }
    if (p.type === 'rsvp') {
      return jsonOut(saveRsvp(p));
    }
    return jsonOut(diagnose(p.folderId));
  } catch (error) {
    return jsonOut({ ok: false, version: 'rsvp-v3', error: String(error) });
  }
}

function doPost(e) {
  try {
    var body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    if (e && e.parameter) {
      body = Object.assign(body, e.parameter);
    }
    if (body.type === 'rsvp' || body.attending) {
      return jsonOut(saveRsvp(body));
    }
    if (body.type === 'song' || body.song) {
      return jsonOut(saveSong(body));
    }
    return jsonOut(savePhoto(body));
  } catch (error) {
    return jsonOut({ ok: false, error: String(error) });
  }
}

function probarCancion() {
  var sheet = openNamedSheet(SHEET_NAME, ['Fecha', 'Nombre', 'Canción', 'Enlace']);
  sheet.appendRow([new Date(), 'Prueba desde el editor', 'Canción de prueba', '']);
  SpreadsheetApp.flush();
  Logger.log('Canciones. Filas: ' + sheet.getLastRow());
}

function saveRsvp(body) {
  var attending = String(body.attending || '').trim();
  if (attending === 'si') {
    attending = 'Sí, asistiré';
  } else if (attending === 'no') {
    attending = 'No podré asistir';
  }
  var row = [
    new Date(),
    String(body.name || '').trim(),
    attending,
    String(body.message || '').trim(),
  ];

  var sheet = openRsvpSheet();
  sheet.appendRow(row);
  SpreadsheetApp.flush();
  return {
    ok: true,
    version: 'rsvp-v3',
    target: 'sheet',
    spreadsheetId: sheet.getParent().getId(),
    rows: sheet.getLastRow(),
  };
}

function findGoogleSheet(names) {
  for (var i = 0; i < names.length; i++) {
    var files = DriveApp.getFilesByName(names[i]);
    while (files.hasNext()) {
      var file = files.next();
      if (file.getMimeType() === MimeType.GOOGLE_SHEETS) {
        return SpreadsheetApp.open(file);
      }
    }
  }
  return null;
}

function openRsvpSheet() {
  var existing = findGoogleSheet(['Confirmaciones', 'Confimaciones']);
  if (existing) {
    return existing.getSheets()[0];
  }

  var songs = findGoogleSheet(['Canciones sugeridas']);
  if (songs) {
    var tab = songs.getSheetByName('Confirmaciones') || songs.getSheetByName('Confimaciones');
    if (!tab) {
      tab = songs.insertSheet('Confirmaciones');
      tab.appendRow(['Fecha', 'Nombre', 'Asistirá', 'Mensaje']);
      tab.setFrozenRows(1);
    }
    return tab;
  }

  var created = SpreadsheetApp.create('Confirmaciones');
  DriveApp.getFileById(created.getId()).moveTo(DriveApp.getFolderById(FOLDER_ID));
  var sheet = created.getSheets()[0];
  sheet.appendRow(['Fecha', 'Nombre', 'Asistirá', 'Mensaje']);
  sheet.setFrozenRows(1);
  return sheet;
}

function probarConfirmacion() {
  var sheet = openRsvpSheet();
  sheet.appendRow([new Date(), 'Prueba', 'Sí, asistiré', 'Hola']);
  SpreadsheetApp.flush();
  Logger.log('Confirmaciones. Filas: ' + sheet.getLastRow());
}

function diagnose(folderId) {
  var info = { ok: true, version: 'rsvp-v3' };
  try {
    info.folder = DriveApp.getFolderById(folderId || FOLDER_ID).getName();
  } catch (error) {
    info.folderError = String(error);
  }

  try {
    var songs = openNamedSheet(SHEET_NAME, ['Fecha', 'Nombre', 'Canción', 'Enlace']);
    info.songsRows = Math.max(0, songs.getLastRow() - 1);
  } catch (error) {
    info.songsError = String(error);
  }

  try {
    var rsvp = openRsvpSheet();
    info.rsvpRows = Math.max(0, rsvp.getLastRow() - 1);
    info.rsvpId = rsvp.getParent().getId();
  } catch (error) {
    info.rsvpError = String(error);
  }
  return info;
}

function savePhoto(body) {
  var folder = DriveApp.getFolderById(body.folderId || FOLDER_ID);
  var blob = Utilities.newBlob(
    Utilities.base64Decode(body.data),
    body.mimeType || 'application/octet-stream',
    body.filename || 'foto.jpg',
  );
  var file = folder.createFile(blob);
  return { ok: true, id: file.getId() };
}

function saveSong(body) {
  var row = [
    new Date(),
    String(body.name || '').trim(),
    String(body.song || '').trim(),
    String(body.link || '').trim(),
  ];
  return appendToSheetOrCsv(
    SHEET_NAME,
    ['Fecha', 'Nombre', 'Canción', 'Enlace'],
    row,
    CSV_NAME,
    body.folderId || FOLDER_ID,
  );
}

function appendToSheetOrCsv(sheetName, headers, row, csvName, folderId) {
  try {
    var sheet = openNamedSheet(sheetName, headers);
    sheet.appendRow(row);
    SpreadsheetApp.flush();
    return {
      ok: true,
      target: 'sheet',
      name: sheetName,
      spreadsheetId: sheet.getParent().getId(),
      rows: sheet.getLastRow(),
    };
  } catch (sheetError) {
    var csv = appendCsv(folderId, csvName, headers, row);
    return {
      ok: true,
      target: 'csv',
      fileId: csv.getId(),
      sheetError: String(sheetError),
    };
  }
}

function openNamedSheet(name, headers) {
  var found = findGoogleSheet(name === RSVP_SHEET_NAME ? ['Confirmaciones', 'Confimaciones'] : [name]);
  if (found) {
    return found.getSheets()[0];
  }

  var folder = DriveApp.getFolderById(FOLDER_ID);
  var spreadsheet = SpreadsheetApp.create(name);
  DriveApp.getFileById(spreadsheet.getId()).moveTo(folder);
  var sheet = spreadsheet.getSheets()[0];
  sheet.appendRow(headers);
  sheet.setFrozenRows(1);
  return sheet;
}

function appendCsv(folderId, csvName, headers, row) {
  var folder = DriveApp.getFolderById(folderId);
  var line =
    row
      .map(function (value) {
        return '"' + String(value).replace(/"/g, '""') + '"';
      })
      .join(',') + '\n';

  var files = folder.getFilesByName(csvName);
  if (files.hasNext()) {
    var file = files.next();
    file.setContent(file.getBlob().getDataAsString() + line);
    return file;
  }

  return folder.createFile(csvName, headers.join(',') + '\n' + line);
}

function jsonOut(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
