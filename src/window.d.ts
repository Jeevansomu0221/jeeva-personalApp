interface Window {
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: string) => Promise<void>;
  };
}