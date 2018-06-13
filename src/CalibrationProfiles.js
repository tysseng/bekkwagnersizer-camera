// @flow
import React, { Component } from 'react';
import logger from "./utils/logger";
import config from "./config";
import { loadColors, loadPersistedColors } from "./colorizing/colorCalibration";

type State = {
  calibrationProfiles: Array,
}

class CalibrationProfiles  extends Component<*, State> {

  constructor(props: *) {
    super(props);
    this.state = {
      calibrationProfiles: [],
    };
    this.onDropdownChange = this.onDropdownChange.bind(this);
    this.loadCalibrationProfiles = this.loadCalibrationProfiles.bind(this);
  }

  onDropdownChange = function(event) {
    const id = event.target.value;
    if(id === 'none'){
      return;
    } else if(id ==='localstorage') {
      loadPersistedColors();
    } else {
      const profile = this.state.calibrationProfiles[id];
      if(profile){
        loadColors(profile.colors);
      } else {
        logger.error('Could not load calibration profile')
      }
    }
    console.log('dropdown changed', event.target.value);
  };

  loadCalibrationProfiles = function() {
    // TODO: Load from miraserver
    const calibrationProfiles = [
      {sceneId: 'pushwagnesizer', id: 'id1', name: 'profile1', colors: {}},
      {sceneId: 'fuglane', id: 'id2', name: 'profile2', colors: {}}
    ];

    const profilesForCurrentScene = calibrationProfiles.filter(
      profile => profile.sceneId === config.sceneConfig.id
    );
    this.setState({calibrationProfiles: profilesForCurrentScene});
  };

  saveCalibrationProfile = function(name: string, colors: CalibrationProfile) {
    const sceneId = config.sceneConfig.id;
    const time = '1234567890'; // TODO:
    const profileName = `${name} (${time})`;
    const profile = {
      sceneId,
      time,
      name: profileName,
      colors,
    };
    // TODO: Write to miraserver
    console.log('writing profile to server', profile);
  };

  componentDidMount = function() {
    this.loadCalibrationProfiles();
  };

  render() {
    return (
      <div>
        <select onChange={this.onDropdownChange}>
          <option key='none' value='none'>--- change color calibration ---</option>
          <option key='localstorage' value='none'>From local storage</option>
          {this.state.calibrationProfiles.map(profile =>
            <option key={profile.id} value={profile.id}>{profile.name}</option>
          )}
        </select>
      </div>
    );
  }
};

export default CalibrationProfiles;
