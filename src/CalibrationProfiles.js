// @flow
import React, { Component } from 'react';
import logger from "./utils/logger";
import config from "./config";
import { loadColors, loadPersistedColors, persistColors } from "./colorizing/colorCalibration";
import {
  loadCalibrationProfilesFromServer,
  saveCalibrationProfileToServer
} from "./communication/calibrationProfileAdapter";
import type { CalibrationProfile } from "./types";
import { getPhotoColorCodes } from "./colorizing/colorRepository";
import './CalibrationProfiles.css';

type State = {
  calibrationProfiles: Array<CalibrationProfile>,
  error: ?string,
  statusMessage: ?string
}

const NONE = 'none';
const LOCALSTORAGE = 'localstorage';

class CalibrationProfiles extends Component<*, State> {

  constructor(props: *) {
    super(props);
    this.state = {
      calibrationProfiles: [],
      error: '',
      statusMessage: '',
    };
    this.onDropdownChange = this.onDropdownChange.bind(this);
    this.loadCalibrationProfiles = this.loadCalibrationProfiles.bind(this);
  }

  onDropdownChange = function (event: Event) {
    const target = event.target;
    if (target instanceof HTMLSelectElement) {
      console.log('dropdown changed', target.value);
      const id = target.value;
      if (id === NONE) {
        return;
      } else if (id === LOCALSTORAGE) {
        loadPersistedColors();
      } else {
        const profile = this.state.calibrationProfiles.find(profile => profile.id === id);
        if (profile) {
          loadColors(profile.colors);
        } else {
          logger.error('Could not load calibration profile')
        }
      }
    }
  };

  loadCalibrationProfiles = async function () {
    if (config.loadCalibrationProfiles === false) {
      return;
    }

    this.setState({ calibrationProfiles: await loadCalibrationProfilesFromServer() });
  };

  saveToServer = async function () {
    const name = this.refs.calibrationProfileName.value;
    if (name == null || name === '') {
      this.setState({ error: 'Name is missing' });
      return;
    } else {
      this.setState({ error: '' });

    }
    const colors = getPhotoColorCodes();
    try {
      await saveCalibrationProfileToServer(name, colors);
      this.setState({ statusMessage: 'Saved to server' })
    } catch (err) {
      logger.error(err);
      this.setState({ error: 'Saving failed' })
    }
  };

  saveToLocalStorage = function () {
    persistColors(getPhotoColorCodes());
    this.setState({ statusMessage: 'Saved to local storage' })
  };

  componentDidMount = function () {
    this.loadCalibrationProfiles();
  };

  render() {
    return (
      <div className='calibration-profiles'>
        <div>
          <h3>Load calibration profile</h3>
          <select onChange={this.onDropdownChange}>
            <option key='none' value={NONE}>--- change color calibration ---</option>
            <option key='localstorage' value={LOCALSTORAGE}>From local storage</option>
            {this.state.calibrationProfiles.map(profile =>
              <option key={profile.id} value={profile.id}>{profile.name}</option>
            )}
          </select>
        </div>
        <div>
          <h3>Save calibration profile</h3>
          <label>:Name <input type='text' ref='calibrationProfileName'/></label>
          <button className='primary' onClick={() => this.saveToServer()}>Save to server</button>
          <button className='secondary' onClick={() => this.saveToLocalStorage()}>Overwrite local storage</button>
          <div className='calibration-profiles__error-message'>{this.state.error}</div>
          <div className='calibration-profiles__status-message'>{this.state.statusMessage}</div>
        </div>
      </div>
    );
  }
};

export default CalibrationProfiles;
