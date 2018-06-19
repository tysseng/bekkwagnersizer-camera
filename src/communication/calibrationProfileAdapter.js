// @flow
import uuid from 'uuid/v1';
import config from "../config";
import logger from "../utils/logger";
import type { CalibrationProfile, PhotoColorCodesMap } from "../types";

const uploadCalibrationProfile = async (url: string, calibrationProfile: string): Promise<*> => {
  await fetch(url, {
    method: 'POST',
    body: calibrationProfile,
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(response => {
      logger.info('Upload calibration response:', response);
      if (response.status !== 200) {
        throw new Error(`Status code not OK (${response.status})`);
      }
    })
    .catch(err => {
      logger.info('Upload error:', err);
      throw err;
    });
};

export const saveCalibrationProfileToServer = async (name: string, colors: PhotoColorCodesMap) => {
  const sceneId = config.sceneConfig.id;
  const time = new Date().toLocaleString().replace(/[\/:]/g, '-').replace(',','');
  const profileName = `${sceneId} ${name} (${time})`;
  const profile = {
    id: uuid(),
    sceneId,
    time,
    name: profileName,
    colors,
  };

  const profileString = JSON.stringify(profile);

  const uploadPromises = config.saveCalibrationUrls.map((url) => {
    logger.info(`uploading calibration profile to ${url}`);
    return uploadCalibrationProfile(url, profileString);
  });

  await Promise.all(uploadPromises);
};


export const loadCalibrationProfilesFromServer = async (): Promise<Array<string>> => {
  return await fetch(config.loadCalibrationUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`Status code not OK (${response.status})`);
      } else {
        return response.json();
      }
    })
    .catch(err => {
      logger.error('Could not read calibration profiles from server');
      return [];
    });
};

export const loadCalibrationProfileFromServer = async (profile: string): Promise<?CalibrationProfile> => {
  return await fetch(config.loadCalibrationUrl + '/' + profile, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
    .then(response => {
      if (response.status !== 200) {
        throw new Error(`Status code not OK (${response.status})`);
      } else {
        return response.json();
      }
    })
    .catch(err => {
      logger.error(`Could not read calibration profile ${profile} from server`);
      return null;
    });
};
