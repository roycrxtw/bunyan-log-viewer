import React, { Component } from 'react';
import './App.css';

let pageSize = 50;
let rawRecords = null;

const Navi = (props) => {
  const { currentPage, pageCount, pageHandler, recordCount } = props;
  return (
    <div className='navi-block'> 
      {(recordCount > 0) && (
        <div>Found {recordCount} results. Current page: {currentPage} / {pageCount}.</div>
      )}

      <button className='naviButton' disabled={(recordCount > 0 && currentPage > 1)? false: true} 
        onClick={() => pageHandler('first')}
      >
        First page
      </button>

      <button className='naviButton' disabled={(recordCount > 0 && currentPage > 1)? false: true} 
        onClick={() => pageHandler('prev')}
      >
        Previous page
      </button>
      
      <button className='naviButton' disabled={(recordCount > 0 && currentPage < pageCount)? false: true} 
        onClick={() => pageHandler('next')}
      >
        Next page
      </button>
      
      <button className='naviButton' disabled={(recordCount > 0 && currentPage < pageCount)? false: true} 
        onClick={() => pageHandler('last')}
      >
        Last page
      </button>
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
    console.log('ex in parseData(): ', ex);
    return null;
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

    rawRecords = undefined;
    this.state = {
      keyword: '',
      date: 0,
      level: 30,
      records: [],
      currentPage: 1,
      pageCount: 1
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
      const r = parseData(data);
      rawRecords = r;
      this.setState({ records: r }, () => this.search());     
    }catch(ex){
      console.log('Error in fileHandler():', ex);
    }
  }

  searchHandler = (event) => {
    const keyword = event.target.value;
    const { records } = this.state;
    
    if(!records){
      this.setState({keyword});
      return;
    }

    if(keyword === ''){
      this.setState({
        keyword,
        records: rawRecords
      }, () => this.search());
    }else{
      this.setState({
        keyword
      }, () => this.search());
    }
  };

  search = () => {
    const { keyword, level, date } = this.state;
    const pattern = new RegExp(keyword, 'gi');

    if(!rawRecords) return;

    const result = [];
    rawRecords.forEach( (entity, i) => {
      if(entity && entity !== ''){
        for(let key in entity){
          if(typeof(entity[key]) === 'string' 
            && entity[key].search(pattern) !== -1 
            && Number(entity.level) >= Number(level)
            && (new Date(entity.time)) >= (new Date(date))
          ){
            result.push(entity);
            break;
          }
        }
      }else{
        console.log('Entity does not exist or it is an empty string: Do nothing.');
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

  printRecords = () => {
    const { records, currentPage } = this.state;
    if(!records) return;
  
    let items = [];
    for(let i = (currentPage - 1) * pageSize; i < records.length && i < currentPage * pageSize ; i++){
      items.push(<li key={i}>{this.printRecord(records[i])}</li>);
    }
    return <ul>{items}</ul>;
  };

  printRecord = (entity) => {
    function otherRecords(){
      const otherRecords = [];
      Object.keys(entity).forEach( (key, i) => {
        if(key !== 'name' && key !== 'level' && key !== 'hostname' 
          && key !== 'time' && key !== 'pid' && key !== 'v'
        ){
          otherRecords.push(
            <div className='other-entity' id='otherEntity' key={i}>
              <span className='other-entity-title'>{key}</span>
              <span className='other-entity-content'>{(entity[key])}</span>
            </div>
          );
        }
      });
      return otherRecords;
    }

    return (
      <div className='record'>
        <table className='record-table'>
          <tbody>
            <tr>
              <td className='data-title'>Name</td>
              <td className='data-title'>Time</td>
              <td className='data-title'>Level</td>
              <td className='data-title'>Hostname</td>
              <td className='data-title'>PID</td>
              <td className='data-title'>v</td>
            </tr>
            <tr>
              <td className='data-value'>{entity.name}</td>
              <td className='data-value'>{entity.time}</td>
              <td className='data-value'>{entity.level}</td>
              <td className='data-value'>{entity.hostname}</td>
              <td className='data-value'>{entity.pid}</td>
              <td className='data-value'>{entity.v}</td>
            </tr>
          </tbody>
        </table>
        {otherRecords()}
      </div>
    );
  };

  reset = () => {
    this.resetFilter(this.search);
  };

  render() {
    const { level, keyword } = this.state;

    return (
      <div>
        <header>
          Bunyan Log Viewer
        </header>

        <div className="menu">
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

          <button className='btnReset' onClick={this.reset}>RESET</button>
        </div>
        
        <div>
          {(rawRecords) && (
            <Navi currentPage={this.state.currentPage} 
              pageCount={this.state.pageCount}
              pageHandler={this.pageHandler}
              prevPageHandler={this.prevPageHandler}
              nextPageHandler={this.nextPageHandler}
              recordCount={this.state.records.length}
            />
          )}
          {this.printRecords()}
        </div>

        <footer>
          Nov 2017, Roy Lu (royvbtw)
        </footer>
      </div>
    );
  }
}

export default App;
