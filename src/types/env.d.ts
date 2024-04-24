declare namespace NodeJS {
  interface ProcessEnv {
    NAME: string;
    CONNECTOR: string;
    HOST: string;
    PORT: string;
    DBUSER: string;
    PASSWORD: string;
    DATABASE: string;
    SCHEMA: string;
  }

  interface mysqlParams {
    USER: string;
    HOST: string;
    PORT: string;
    PASSWORD: string;
    DATABASE: string;
    DATESTRINGS: boolean;
  }
}