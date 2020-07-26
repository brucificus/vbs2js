import {
    conversionSteps,
    ConversionReplacementFunction,
} from "./vbs2js_conversions";

function convert(input: string): string {
    let result = input;

    conversionSteps.forEach((conversionStep) => {
        let pattern = conversionStep.matcher;
        let replacement = conversionStep.replacement;
        if (pattern) {
            const patternRegEx = new RegExp(pattern, "igm");
            if (typeof replacement === "function") {
                // if function pointer passed, loop & use function to manually replace each match
                if (patternRegEx.test(result)) {
                    var matches = result.match(patternRegEx)!;
                    matches.forEach((match) => {
                        result = result.replace(
                            match,
                            (replacement as ConversionReplacementFunction)(
                                match
                            )
                        );
                    });
                }
            } else {
                result = result.replace(patternRegEx, replacement as string);
            }
        }
    });

    return result;
}

export { convert };
