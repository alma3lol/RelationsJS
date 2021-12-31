import EventEmitter from 'events';

export type FileType = 'passports' | 'pictures' | 'videos' | 'documents';

declare global {
	interface Window {
		/**
		 * Global files operations
		 *
		 * Defined in 'src/global.d.ts'
		 * Functions in 'public/preload.js'
		 */
		files: {
			upload: (nodeId: string, fileType: FileType, filename: string, content: any) => string
			list: (nodeId: string, filesType: FileType) => string[]
			delete: (nodeId: string, fileType: FileType, filename: string) => void
			clearUnused: (filesType: FileType, files: any[]) => Pomise<number>
			saveFile: (content, title?: string) => Pomise<boolean>
		}
	}
}
