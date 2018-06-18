// @flow
import uuid from 'uuid/v1';
import config from "../config";
import logger from "../utils/logger";
import type { CalibrationProfile, PhotoColorCodesMap } from "../types";

const uploadCalibrationProfile = async (url: string, calibrationProfile: string): Promise<*> => {
  await fetch(url, {
    method: 'POST',
    body: calibrationProfile
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
  const time = Date.now();
  const profileName = `${name} (${time})`;
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


export const loadCalibrationProfilesFromServer = async (): Promise<Array<CalibrationProfile>> => {
  const calibrationProfiles = await fetch(config.loadCalibrationUrl, {
    method: 'GET',
  })
    .then(response => {
      logger.info('Upload calibration response:', response);
      if (response.status !== 200) {
        throw new Error(`Status code not OK (${response.status})`);
      } else {
        return response.json();
      }
    });

  const profilesForCurrentScene = calibrationProfiles.filter(
    profile => profile.sceneId === config.sceneConfig.id
  );
  return profilesForCurrentScene;
};
