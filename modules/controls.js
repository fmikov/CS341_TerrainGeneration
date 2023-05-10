import { updateNoiseScale } from "./noise";
import { setUpdateFlag } from "../main";

// Create an object to hold your variables
var settings = {
    noise_scale: 0.05, // Initial value
  };

// Create the GUI
var gui = new dat.GUI();

// Add a modifiable value to the GUI
gui.add(settings, 'noise_scale').name('Temp');

// Add a slider to the GUI
gui.add(settings, 'noise_scale', 0, 0.1).name('Noise scale').onChange(function(newValue) {
  // Handle the updated value here
      updateNoiseScale(settings.noise_scale);
      setUpdateFlag(true);
  });;
