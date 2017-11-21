
/**
 * Utility functions for bunyan-log-viewer
 */


export const readFile = (file) => {
  return new Promise( (resolve, reject) => {
    try{
      console.log(`Loading file: ${file.name}`);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function(event){
        const text = event.target.result;
        const data = text.split('\n');
        return resolve(data);
      }
    }catch(ex){
      console.log('Error in readFile():', ex);
      return reject('Error in readFile().');
    }
  });
};


 /**
  * Generate Regexp from an array of keywords.
  */
export const generateRegexp = (keywords) => {
  let patternString = '';
  keywords.forEach( item => {
    patternString += '(?=.*' + item + ')';
  });

  patternString += '.*';

  return new RegExp(patternString, 'gi');
};


