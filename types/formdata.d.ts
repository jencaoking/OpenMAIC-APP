/// <reference lib="dom" />

declare global {
  interface FormData {
    get(name: string): FormDataEntryValue | null;
    getAll(name: string): FormDataEntryValue[];
    set(name: string, value: FormDataEntryValue): void;
    append(name: string, value: FormDataEntryValue): void;
    delete(name: string): void;
    has(name: string): boolean;
    keys(): IterableIterator<string>;
    values(): IterableIterator<FormDataEntryValue>;
    entries(): IterableIterator<[string, FormDataEntryValue]>;
    forEach(callbackfn: (value: FormDataEntryValue, key: string, parent: FormData) => void, thisArg?: unknown): void;
    readonly [Symbol.toStringTag]: 'FormData';
    [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>;
  }

  interface FormDataConstructor {
    new (form?: HTMLFormElement | null): FormData;
    prototype: FormData;
  }

  const FormData: FormDataConstructor;
}

export {};
