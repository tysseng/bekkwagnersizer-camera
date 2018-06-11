// @flow
import { isRunning } from "../runstatus";
import logger from "./logger";

export const timeout = (ms: number): Promise<*> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const abortable = <T>(funcToAsync: () => T): Promise<T> => {
  return new Promise((resolve, reject) => setTimeout(() => {
    try{
      const result = funcToAsync();
      if(isRunning()){
        resolve(result);
      } else {
        logger.error('- ABORTED, stop was pressed');
        reject('ABORT');
      }
    } catch (err) {
      reject(err)
    }

  }, 0));
};