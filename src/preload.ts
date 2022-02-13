import { contextBridge } from 'electron';
import { app, dialog, BrowserWindow } from "@electron/remote";
import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';
const userDataPath = app.getPath('userData');
import _ from 'lodash';
import { FileType } from './global';

contextBridge.exposeInMainWorld(
  'files',
  {
    upload: (nodeId: string, fileType: FileType, filename: string, content: ArrayBuffer) => {
      const fileExtension = path.extname(filename);
      const filenameWithoutExtension = path.basename(filename, fileExtension);
      const newFileName = `${filenameWithoutExtension}-${v4()}${fileExtension}`;
      const folderPath = `${userDataPath}/${fileType}/${nodeId}`;
      const filePath = `${folderPath}/${newFileName}`;
      fs.mkdirSync(folderPath, { recursive: true });
      const writeStream = fs.createWriteStream(filePath, { encoding: 'utf8' });
      const buffer = Buffer.from(content);
      writeStream.write(buffer);
      writeStream.close();
      return filePath;
    },
    list: (nodeId: string, filesType: FileType) => {
      const folderPath = `${userDataPath}/${filesType}/${nodeId}`;
      if (!fs.existsSync(folderPath)) return [];
      return fs.readdirSync(folderPath).map(f => `${folderPath}/${f}`);
    },
    delete: (nodeId: string, fileType: FileType, filename: string) => {
      const fullPath = `${userDataPath}/${fileType}/${nodeId}/${filename}`;
      if (!fs.existsSync(fullPath)) return;
      fs.unlinkSync(fullPath)
    },
    clearUnused: (filesType: FileType, files: string[]) => {
      const folderToSearch = `${userDataPath}/${filesType}`;
      if (!fs.existsSync(folderToSearch)) return 0;
      let deleted = 0;
      fs.readdirSync(folderToSearch).forEach(f => {
        const nodeFolder = `${folderToSearch}/${f}`;
        if (fs.lstatSync(nodeFolder).isDirectory()) {
          fs.readdirSync(nodeFolder).forEach(filename => {
            const found = _.includes(files.map(file => path.basename(file)), filename);
            if (!found) {
              deleted++;
              fs.unlinkSync(`${nodeFolder}/${filename}`);
            }
          });
        }
      });
      return deleted;
    },
    saveFile: (content: string | ArrayBuffer, _title?: string, defaultPath?: string) => {
      const title = _title ?? 'Choose file to export to';
      const filePath = dialog.showSaveDialogSync({
        title,
        defaultPath: defaultPath ?? 'relations-js-graph.json',
        // filters: [
        //   {
        //     name: 'JSON',
        //     extensions: ['json']
        //   }
        // ]
      });
      if (filePath) {
        if (typeof content === 'string') {
          fs.writeFileSync(filePath, content);
        } else {
          const buffer = Buffer.from(content);
          fs.writeFileSync(filePath, buffer);
        }
        return true;
      } else {
        return false;
      }
    },
    getFile: (filePath: string) => {
      return new File([fs.readFileSync(filePath)], path.basename(filePath));
    }
  }
)

contextBridge.exposeInMainWorld(
  'electron',
  {
    print: async (filename: string, title: string = 'Save page') => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        let printers = focusedWindow.webContents.getPrinters();
        if (printers.length > 0) {
          focusedWindow.webContents.print({
            silent: false,
            printBackground: true,
            color: false,
            margins: {
              top: 0,
              left: 0,
              bottom: 0,
              right: 0
            },
            landscape: false,
            pagesPerSheet: 1,
            collate: false,
            copies: 1,
          });
        } else {
          const data = await focusedWindow.webContents.printToPDF({
            marginsType: 0,
            pageSize: 'A4',
            printBackground: true,
            printSelectionOnly: false,
            landscape: false,
          });
          const savePath = await dialog.showSaveDialog({
            title: title,
            defaultPath: `${filename}.pdf`,
            filters: [
              {
                name: 'PDF',
                extensions: ['pdf']
              }
            ]
          });
          if (savePath.filePath) {
            fs.writeFileSync(savePath.filePath, data);
          }
        }
      }
    },
  }
)
