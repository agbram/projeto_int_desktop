export {}; 
declare global { 
  interface Window { 
    api: { 
      consoleLog: (message: string) => void;
    }; 
  } 
}