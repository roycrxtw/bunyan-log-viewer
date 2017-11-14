
import React, { Component } from 'react';
import './App.css';
import Records from './Records'

let pageSize = 50;
let rawRecords = null;

const Navi = (props) => {
  const { currentPage, pageCount, pageHandler, recordCount } = props;
  return (
    <div>
      {(rawRecords && rawRecords.length > 0) && (
        <div className='navi-block'>
          <div>Found {recordCount} results. Current page: {currentPage} / {pageCount}.</div>

          <button className='naviButton' disabled={(recordCount > 0 && currentPage > 1)? false: true} 
            onClick={() => pageHandler('first')}>First page</button>

          <button className='naviButton' disabled={(recordCount > 0 && currentPage > 1)? false: true} 
            onClick={() => pageHandler('prev')}>Previous page</button>

          <button className='naviButton' onClick={() => pageHandler('next')} 
            disabled={(recordCount > 0 && currentPage < pageCount)? false: true} >Next page</button>
      
          <button className='naviButton' onClick={() => pageHandler('last')}
            disabled={(recordCount > 0 && currentPage < pageCount)? false: true} >Last page</button>
        </div>
      )}
    </div>
  );
};

const parseData = (data) => {
  const parsedData = [];
  try{
    data.forEach( item => {
      if(!item || item === '') return;
      
      let record = JSON.parse(item);
      
      for(let key in record){
        if( typeof(record[key]) !== 'string'){
          record[key] = JSON.stringify(record[key]);
        }
      }

      parsedData.push(record);
    });
    return parsedData;
  }catch(ex){
    throw new Error('Unable to parse this file. It should be a valid bunyan log file.');
  }
};

const readFile = (file) => {
  return new Promise( (resolve, reject) => {
    try{
      console.log(`Loading file: ${file.name}`);
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = function(event){
        const text = event.target.result;
        const records = text.split('\n');
        return resolve(records);
      }
    }catch(ex){
      console.log('Error in readFile():', ex);
      return reject('Error in readFile().');
    }
  });
};


class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      keyword: '',
      date: 0,
      level: 30,
      records: null,
      currentPage: 1,
      pageCount: 1,
      appMessage: null
    };
  }

  resetFilter = (cb) => {
    this.setState({
      keyword: '',
      date: 0,
      level: 30,
      currentPage: 1,
      pageCount: 1
    }, () => {
      if(cb){
        cb();
      }
    });
  };

  fileHandler = async (event) => {
    try{
      const file = event.target.files[0];
      if(!file) return;

      rawRecords = undefined;
      this.resetFilter();

      const data = await readFile(event.target.files[0]);
      const records = parseData(data);
      rawRecords = records;
      this.setState({ records, appMessage: undefined }, () => this.search());     
    }catch(ex){
      console.log(ex.message);
      rawRecords = null;
      this.setState({
        appMessage: ex.message,
        records: null
      })
    }
  }

  searchHandler = (event) => {
    const keyword = event.target.value;
    const { records } = this.state;
    
    // it should update keyword state even if there is no any records loaded.
    if(!records){
      this.setState({keyword});
      return;
    }

    if(keyword === ''){
      this.setState({ keyword, records: rawRecords }, () => this.search());
    }else{
      this.setState({ keyword }, () => this.search());
    }
  };

  search = () => {
    const { keyword, level, date } = this.state;
    const pattern = new RegExp(keyword, 'gi');

    if(!rawRecords) return;

    const result = [];
    rawRecords.forEach( (record, i) => {
      if(record && record !== ''){
        for(let key in record){
          if(typeof(record[key]) === 'string' 
            && record[key].search(pattern) !== -1 
            && Number(record.level) >= Number(level)
            && (new Date(record.time)) >= (new Date(date))
          ){
            result.push(record);
            break;
          }
        }
      }else{
        console.log('Record does not exist or it is an empty string: Do nothing.');
      }
    });

    this.setState({
      records: result,
      currentPage: 1,
      pageCount: Math.ceil(result.length / pageSize)
    });
  };

  levelFilter = (event) => {
    let level = Number(event.target.value);
    level = (level < 0 || level === 'NaN')? 0: level;
    this.setState({ level }, () => this.search());
  };

  listHandler = (event) => {
    const level = event.target.value;
    this.setState({ level }, () => this.search());
  };

  dateFilter = (event) => {
    let date = event.target.value;
    if(!date) date = 0;
    this.setState({ date }, () => this.search());
  };

  pageHandler = (cmd) => {
    console.log(`pageHandler(${cmd}) started.`);
    const { currentPage, pageCount } = this.state;
    let newPage;
    switch(cmd){
      case 'first':
        newPage = 1;
        break;
      case 'next':
        newPage = currentPage + 1;
        break;
      case 'prev':
        newPage = (currentPage > 1)? currentPage - 1: 1;
        break;
      case 'last':
        newPage = pageCount;
        break;
      default:
        break;
    }
    this.setState({currentPage: newPage});
  };

  reset = () => {
    this.resetFilter(this.search);
  };

  render() {
    const { level, keyword } = this.state;

    const AppMessage = (props) => {
      const content = (props.msg)? (<div className='app-message'>{props.msg}</div>): null;
      return (
        <div>{content}</div>
      );
    };

    return (
      <div>
        <header>
          <div className='app-title'>Bunyan Log Viewer</div>
          <div className='menu-file-picker'>
            <input type='file' className='filter file-picker' onChange={this.fileHandler} />
          </div>

          <div className='menu-item'>
            <label className='filter-title'>Filters</label>
          </div>

          <div className='menu-item'>
            <div className='filter-title'>date</div>
            <input type='date' className='filter time-filter' onChange={this.dateFilter}/>
          </div>
          
          <div className='menu-item'>
            <div className='filter-title'>level</div>
            <input type='text' className='filter level-filter' value={level} onChange={this.levelFilter} />
            <select className='filter level-list' value={level} onChange={this.listHandler}>
              <option value='0'>custom</option> 
              <option value='60'>fatal</option>
              <option value='50'>error</option>
              <option value='40'>warn</option>
              <option value='30'>info</option>
              <option value='20'>debug</option>
              <option value='10'>trace</option>
            </select>
          </div>
          
          <div className='menu-item'>
            <input type='text' className='filter keyword-field' value={keyword} 
              onChange={this.searchHandler} placeholder='search' />
          </div>

          <div className='menu-item'>
            <button className='btnReset' onClick={this.reset}>RESET</button>
          </div>
        </header>
        
        <AppMessage msg={this.state.appMessage}/>

        <div>
          {/* {(rawRecords) && ( */}
          <Navi currentPage={this.state.currentPage} 
            pageCount={this.state.pageCount}
            pageHandler={this.pageHandler}
            prevPageHandler={this.prevPageHandler}
            nextPageHandler={this.nextPageHandler}
            recordCount={this.state.records ? this.state.records.length: 0}
          />
          
          <Records currentPage={this.state.currentPage} records={this.state.records}
            pageSize={pageSize} />
        </div>

        <footer>
          Nov 2017, <a href='https://royvbtw.uk'>Roy Lu (royvbtw)</a> <a href='https://github.com/royvbtw/bunyan-log-viewer'>@github</a>
        </footer>
      </div>
    );
  }
}

export default App;
