export = FFT;
declare function FFT(size: any): void;
declare class FFT {
    constructor(size: any);
    size: number;
    _csize: number;
    table: any[];
    _width: number;
    _bitrev: any[];
    _out: any;
    _data: any;
    _inv: number;
    fromComplexArray(complex: any, storage: any): any;
    createComplexArray(): any[];
    toComplexArray(input: any, storage: any): any;
    completeSpectrum(spectrum: any): void;
    transform(out: any, data: any): void;
    realTransform(out: any, data: any): void;
    inverseTransform(out: any, data: any): void;
    _transform4(): void;
    _singleTransform2(outOff: any, off: any, step: any): void;
    _singleTransform4(outOff: any, off: any, step: any): void;
    _realTransform4(): void;
    _singleRealTransform2(outOff: any, off: any, step: any): void;
    _singleRealTransform4(outOff: any, off: any, step: any): void;
}
