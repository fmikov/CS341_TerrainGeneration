import { updateNoiseOffset, updateNoiseScale } from "./noise";
import { setUpdateFlag, updateCutoff } from "../main";
import { updateAmplMultiplier, updateFreqMultiplier, updateNumOctaves } from "./caves";

// Create an object to hold your variables
var settings = {
    cutoff: 0.3,
    noise_offset: 0.0,
    noise_scale: 0.03,
    ampl: 0.17,
    freq: 0.2,
    octaves: 4
  };
//setting initial values
// updateCutoff(settings.cutoff);
// updateNoiseScale(settings.noise_scale);
// updateNoiseOffset(settings.noise_offset);
// updateAmplMultiplier(settings.ampl);
// updateFreqMultiplier(settings.freq);
// updateNumOctaves(settings.octaves);
// setUpdateFlag(true);

// Create the GUI
var gui = new dat.GUI();

// Add a modifiable value to the GUI
//gui.add(settings, 'noise_scale').name('Temp');

// Add a slider to the GUI
gui.add(settings, 'cutoff', 0, 1).name('Cube cutoff').onChange(function(newValue) {
  // Handle the updated value here
      updateCutoff(settings.cutoff);
      setUpdateFlag(true);
  });;
gui.add(settings, 'noise_scale', 0, 0.1).name('Noise scale').onChange(function(newValue) {
  // Handle the updated value here
      updateNoiseScale(settings.noise_scale);
      setUpdateFlag(true);
  });;
gui.add(settings, 'noise_offset', -2, 2).name('Noise offset').onChange(function(newValue) {
  // Handle the updated value here
      updateNoiseOffset(settings.noise_offset);
      setUpdateFlag(true);
  });;
gui.add(settings, 'ampl', 0, 5).name('Amplitude').onChange(function(newValue) {
  // Handle the updated value here
      updateAmplMultiplier(settings.ampl);
      setUpdateFlag(true);
  });;
gui.add(settings, 'freq', 0, 5).name('Frequency').onChange(function(newValue) {
// Handle the updated value here
    updateFreqMultiplier(settings.freq);
    setUpdateFlag(true);
});;
gui.add(settings, 'octaves').name('Octaves').onChange(function(newValue) {
  // Handle the updated value here
      updateNumOctaves(settings.octaves);
      setUpdateFlag(true);
  });;
