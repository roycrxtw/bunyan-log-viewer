
import React, { Component } from 'react';
import reactStringReplace from 'react-string-replace';

import './App.css';
import Records from './Records';
import Navi from './Navi';
import { escapeRegExp, generateHighlightRegexp, generateRegexp, readFile, parseData } from './util';

const PAGE_SIZE = 50;

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      keyword: '',
      keywordSet: [],
      selectedFile: '',
      date: 0,
      level: 30,
      rawRecords: null,
      filteredRecords: null,
      currentPage: 1,
      pageCount: 1,
      pageSize: PAGE_SIZE,
      appMessage: null
    };
  }

  componentDidUpdate(){
    window.scroll(0, 0);
  }

  resetFilter = (cb) => {
    this.setState({
      keyword: '',
      keywordSet: [],
      date: 0,
      level: 30,
      currentPage: 1,
      pageCount: 1
    }, () => {
      if(cb) cb();
    });
  };

  fileHandler = async (event) => {
    try{
      
      const file = event.target.files[0];
      if(!file) return;
      console.log(`file=`, file.name);

      this.resetFilter();

      const data = await readFile(event.target.files[0]);
      const rawRecords = parseData(data);
      this.setState({
        rawRecords,
        selectedFile: file.name,
        appMessage: undefined
      }, () => this.search());     
    }catch(ex){
      console.log(ex.message);
      this.setState({
        appMessage: ex.message,
        rawRecords: null,
        filteredRecords: null
      })
    }
  }

  keywordChangeHandler = (event) => {
    const keyword = event.target.value;
    this.setState({ keyword });
  };

  search = () => {
    const { level, date, rawRecords, pageSize, keywordSet } = this.state;
    
    if(!rawRecords) return;

    const regexp = generateRegexp(keywordSet);
    const filteredRecords = [];
    rawRecords.forEach( (record, i) => {
      // Test if the record date matches the filter.
      if(new Date(record.time) < new Date(date)){
        return;
      }

      // Test if the record level matches the filter.
      if( Number(record.level) < Number(level) ){
        return;
      }

      // Test if values in this record matches the keywords.
      // It will test **_rawReord** rather than test every key-value in the record
      // for effectiveness.
      if( record['_rawRecord'].search(regexp) === -1){
        return;
      }
      filteredRecords.push({...record});
    });

    this.setState({
      filteredRecords,
      currentPage: 1,
      pageCount: Math.ceil(filteredRecords.length / pageSize),
      isSpinning: false
    }, () => this.highlight());
  };

  highlight = () => {
    const { filteredRecords, keywordSet } = this.state;
    
    if(keywordSet.length === 0) return;

    const highlightRegexp = generateHighlightRegexp(keywordSet);

    filteredRecords.forEach( record => {
      for(let key in record){
        record[key] = reactStringReplace(record[key], highlightRegexp, (match, i) => (
          <span className='highlight' key={i}>{match}</span>
        ))
      }
    });
    this.setState({ filteredRecords });
  };


  levelFilter = (event) => {
    let level = Number(event.target.value);
    level = (isNaN(level) || level < 0)? 0: level;
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
    const { currentPage, pageCount } = this.state;
    let newPage;
    switch(cmd){
      case 'first': newPage = 1; break;
      case 'next':  newPage = currentPage + 1; break;
      case 'prev':  newPage = (currentPage > 1)? currentPage - 1: 1; break;
      case 'last':  newPage = pageCount; break;
      default: break;
    }
    this.setState({currentPage: newPage});
  };

  submitHandler = (event) => {
    if(event.key === 'Enter'){
      this.submit();
    }
  };

  submit = () => {
    const { keyword, rawRecords } = this.state;
    
    if(!rawRecords) return;

    let keywordSet = [];
    if(keyword !== ''){
      const temp = escapeRegExp(keyword.trim().replace(/  +/g, ' '));
      keywordSet = temp.split(' ');
    }
    this.setState({ keyword, keywordSet }, () => this.search());
  };

  reset = () => {
    this.resetFilter(this.search);
  };

  closeFile = () => {
    this.resetFilter();
    this.setState({
      rawRecords: null,
      filteredRecords: null,
      selectedFile: ''
    });
  };

  render() {
    const { level, keyword, selectedFile } = this.state;

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
            <label className='filter-title'>File</label>
            <label className='filter file-picker'>name: {selectedFile}
            <input type='file' className='filter hidden-file-input' value={''}
              onChange={this.fileHandler} />
            </label>
          </div>

          <div className='menu-item'>
            <label className='filter-title'>Filters</label>
          </div>

          <div className='menu-item'>
            <div className='filter-title'>date</div>
            <input type='date' className='filter' onChange={this.dateFilter}/>
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
              onChange={this.keywordChangeHandler} onKeyPress={this.submitHandler} 
              placeholder='search' />
          </div>

          <div className='menu-item'>
            <button className='menu-button' onClick={this.submit}>Search</button>
            <button className='menu-button' onClick={this.reset}>Reset</button>
            <button className='menu-button' onClick={this.closeFile}>Close</button>
          </div>
        </header>
        
        <AppMessage msg={this.state.appMessage}/>

        <div>
          <Navi currentPage={this.state.currentPage} 
            pageCount={this.state.pageCount}
            pageHandler={this.pageHandler}
            rawRecordCount={this.state.rawRecords? this.state.rawRecords.length: 0}
            recordCount={this.state.filteredRecords ? this.state.filteredRecords.length: 0}
          />
          
          <Records currentPage={this.state.currentPage} records={this.state.filteredRecords}
            pageSize={this.state.pageSize} />

          <Navi currentPage={this.state.currentPage} 
            pageCount={this.state.pageCount}
            pageHandler={this.pageHandler}
            rawRecordCount={this.state.rawRecords? this.state.rawRecords.length: 0}
            recordCount={this.state.filteredRecords ? this.state.filteredRecords.length: 0}
          />
        </div>          

        <footer>
          Nov 2017, <a href='https://royvbtw.uk'>Roy Lu (royvbtw)</a> <a href='https://github.com/royvbtw/bunyan-log-viewer'>@github</a>
        </footer>
      </div>
    );
  }
}

export default App;
