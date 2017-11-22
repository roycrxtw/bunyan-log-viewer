
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

export const generateRegexp = (keywords) => {
  if(keywords.length === 0){
    return new RegExp('[\\s\\S]*', 'ig');
  }
  let patternString = '';
  keywords.forEach( item => {
    patternString += '(?=.*' + item + ')';
  });
  
  patternString += '.*';
  return new RegExp(patternString, 'ig');
};

 /**
  * Generate highlight regexp from an array of keywords.
  */
export const generateHighlightRegexp = (keywords) => {
  //if(!keywords) return null;
  let patternString = '(' + keywords.join('|') + ')';
  return new RegExp(patternString, 'ig');
};

// ref: https://stackoverflow.com/a/6969486/7311700
export const escapeRegExp = (str) => {
  return str.replace(/[-[/{}()*+?.^$|\]\\]/g, "\\$&");
};


/**
 * Parse plain string into object.
 * @param {Array.<object>} data 
 */
export const parseData = (data) => {
  const parsedData = [];
  try{
    data.forEach( (item, i) => {
      if(!item || item === '') return;
      let record = JSON.parse(item);
      let valueSet = [];
      for(let key in record){
        if( typeof(record[key]) !== 'string'){
          record[key] = JSON.stringify(record[key]);
        }
        valueSet.push(record[key]);
      }
      record['_rawRecord'] = valueSet.join(';');  // this property will be used for keyword search.
      parsedData.push(record);
    });
    return parsedData;
  }catch(ex){
    throw new Error('Unable to parse this file. It should be a valid bunyan log file.');
  }
};