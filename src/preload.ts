import { contextBridge } from 'electron';
import { app, dialog } from "@electron/remote";
import fs from 'fs';
import path from 'path';
import { v4 } from 'uuid';
const userDataPath = app.getPath('userData');
import _ from 'lodash';
import { FileType } from './global';

contextBridge.exposeInMainWorld(
  'files',
  {
    upload: (nodeId: string, fileType: FileType, filename: string, content: string | NodeJS.ArrayBufferView | ArrayBuffer) => {
      const fileExtension = path.extname(filename);
      const filenameWithoutExtension = path.basename(filename, fileExtension);
      const newFileName = `${filenameWithoutExtension}-${v4()}${fileExtension}`;
      const folderPath = `${userDataPath}/${fileType}/${nodeId}`;
      const filePath = `${folderPath}/${newFileName}`;
      fs.mkdirSync(folderPath, { recursive: true });
      fs.writeFileSync(filePath, content.toString());
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
    clearUnused: async (filesType: FileType, files: string[]) => {
      const folderToSearch = `${userDataPath}/${filesType}`;
      if (!fs.existsSync(folderToSearch)) return 0;
      let deleted = 0;
      fs.readdirSync(folderToSearch).forEach(f => {
        const nodeFolder = `${folderToSearch}/${f}`;
        if (fs.lstatSync(nodeFolder).isDirectory()) {
          fs.readdirSync(nodeFolder).forEach(filename => {
            const found = _.find(files, { filename });
            if (!found) {
              deleted++;
              fs.unlinkSync(`${nodeFolder}/${filename}`);
            }
          });
        }
      });
      return deleted;
    },
    saveFile: async (content: string | NodeJS.ArrayBufferView, _title?: string) => {
      const title = _title ?? 'Choose file to export to';
      const filePath = dialog.showSaveDialogSync({
        title,
        defaultPath: 'relations-js-graph.json',
        filters: [
          {
            name: 'JSON',
            extensions: ['json']
          }
        ]
      });
      if (filePath) {
        fs.writeFileSync(filePath, content);
        return true;
      } else {
        return false;
      }
    }
  }
)
