import { LocationRewrite } from './router.js';
export declare function composeRewrites(rewrites: Array<LocationRewrite>): {
    input: ({ url }: {
        url: URL;
    }) => URL;
    output: ({ url }: {
        url: URL;
    }) => URL;
};
export declare function rewriteBasepath(opts: {
    basepath: string;
    caseSensitive?: boolean;
}): {
    input: ({ url }: {
        url: URL;
    }) => URL;
    output: ({ url }: {
        url: URL;
    }) => URL;
};
export declare function executeRewriteInput(rewrite: LocationRewrite | undefined, url: URL): URL;
export declare function executeRewriteOutput(rewrite: LocationRewrite | undefined, url: URL): URL;
