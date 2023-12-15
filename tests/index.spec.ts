import * as fs from 'node:fs';
import path from 'node:path';

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
            /* eslint-disable jest/valid-title */
            describe(parts[0], () => {
                /* eslint-enable jest/valid-title */

                describeRecursive(parts.splice(1), action);
            });
        } else {
            action();
        }
    };

    describeRecursive(relativeLocationParts, () => {
        const inputFileBasename = path.basename(inputFile);

        /* eslint-disable jest/valid-title */
        it(inputFileBasename, () => {
            /* eslint-enable jest/valid-title */

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
    // eslint-disable-next-line unicorn/prefer-module
    __dirname + '/resources',
    'vbs',
    'js',
    testFilePair
);
