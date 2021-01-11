export = FFT;
declare function FFT(size: any): void;
declare class FFT {
    constructor(size: any);
    size: number;
    table: any[];
    fromComplexArray(complex: any, storage: any): any;
    createComplexArray(): any[];
    toComplexArray(input: any, storage: any): any;
    completeSpectrum(spectrum: any): void;
    transform(out: any, data: any): void;
    realTransform(out: any, data: any): void;
    inverseTransform(out: any, data: any): void;
}
