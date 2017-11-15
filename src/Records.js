
import React, { Component } from 'react';

export default class Records extends Component{
  printRecord = (record) => {
    function otherRecords(){
      const otherRecords = [];
      Object.keys(record).forEach( (key, i) => {
        if(key !== 'name' && key !== 'level' && key !== 'hostname' 
          && key !== 'time' && key !== 'pid' && key !== 'v'
        ){
          otherRecords.push(
            <div className='other-record' key={i}>
              <span className='other-record-title'>{key}</span>
              <span className='other-record-content'>{(record[key])}</span>
            </div>
          );
        }
      });
      return otherRecords;
    }

    return (
      <div>
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
              <td className='data-value'>{record.name}</td>
              <td className='data-value'>{record.time}</td>
              <td className='data-value'>{record.level}</td>
              <td className='data-value'>{record.hostname}</td>
              <td className='data-value'>{record.pid}</td>
              <td className='data-value'>{record.v}</td>
            </tr>
          </tbody>
        </table>
        {otherRecords()}
      </div>
    );
  };

  render(){
    const { records, currentPage, pageSize} = this.props;
    if(!records) return null;

    let list = null;
    const listItems = [];
    for(let i = (currentPage - 1) * pageSize; i < records.length && i < currentPage * pageSize ; i++){
      listItems.push(<li key={i} className='record'>{this.printRecord(records[i])}</li>);
    }
    list = <ul>{listItems}</ul>;
    
    return <div>{list}</div>;
  }
}
