import { updateNoiseScale } from "./noise";
import { setUpdateFlag } from "../main";

// Create an object to hold your variables
var settings = {
    noise_scale: 0.5, // Initial value
  };

// Create the GUI
var gui = new dat.GUI();

// Add a modifiable value to the GUI
gui.add(settings, 'noise_scale').name('Value 1');

// Add a slider to the GUI
gui.add(settings, 'noise_scale', 0, 1).name('Noise scale');

// Listen for changes to the modifiable value
gui.add(settings, 'noise_scale').onChange(function(newValue) {
// Handle the updated value here
    updateNoiseScale(settings.noise_scale);
    setUpdateFlag(true);
});