import * as fs from 'fs';
import * as path from 'path';

import { convert } from '../src';
import recursivelyProcessInputOutputFilePairs from './support/recursively-process-input-output-file-pairs';

describe('library', () => {
    it('can be imported', async () => {
        await expect(import('../src')).resolves.toBeDefined();
    });
});

const testFilePair = (
    relativeLocationParts: string[],
    inputFile: string,
    pairwiseInputFile: string
) => {
    const describeRecursive = (parts: string[], action: () => void) => {
        if (parts.length > 0) {
            describe(parts[0], () => {
                describeRecursive(parts.splice(1), action);
            });
        } else {
            action();
        }
    };

    describeRecursive(relativeLocationParts, () => {
        const inputFileBasename = path.basename(inputFile);

        it(inputFileBasename, () => {
            const inputFileContent = fs.readFileSync(inputFile, {
                encoding: 'utf8',
            });
            const expectedConvertedContent = fs.readFileSync(
                pairwiseInputFile,
                { encoding: 'utf8' }
            );

            const actualConvertedContent = convert(inputFileContent);

            expect(actualConvertedContent).toBe(expectedConvertedContent);
        });
    });
};

recursivelyProcessInputOutputFilePairs(
    __dirname + '/resources',
    'vbs',
    'js',
    testFilePair
);
