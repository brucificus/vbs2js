import * as fs from 'fs';
import * as path from 'path';

class Scanner {
    constructor(
        private inputFileExtension: string,
        private pairwiseInputFileExtension: string
    ) {}

    scan(
        folder: string,
        parentFolders: string[],
        action: (
            relativeLocationParts: string[],
            inputFile: string,
            pairwiseInputFile: string
        ) => void
    ): void {
        const folderBasename = path.basename(folder);
        parentFolders = [...parentFolders, folderBasename];

        fs.readdirSync(folder).forEach((folderChildBasename) => {
            const folderChild = path.join(folder, folderChildBasename);
            const folderChildInfo = fs.statSync(folderChild);
            const folderChildIsInputFile =
                folderChildInfo.isFile() &&
                path.extname(folderChild).toLowerCase() ===
                    '.' + this.inputFileExtension;

            if (folderChildIsInputFile) {
                const pairwiseInputFile =
                    folderChild.slice(
                        0,
                        folderChild.length - this.inputFileExtension.length - 1
                    ) +
                    '.' +
                    this.pairwiseInputFileExtension;
                if (fs.existsSync(pairwiseInputFile)) {
                    action(parentFolders, folderChild, pairwiseInputFile);
                }
            } else if (folderChildInfo.isDirectory()) {
                this.scan(folderChild, parentFolders, action);
            }
        });
    }
}

export default (
    folder: string,
    inputFileExtension: string,
    pairwiseInputFileExtension: string,
    action: (
        relativeLocationParts: string[],
        inputFile: string,
        pairwiseInputFile: string
    ) => void
): void => {
    new Scanner(inputFileExtension, pairwiseInputFileExtension).scan(
        folder,
        [],
        action
    );
};
