
import React, { Component } from 'react';

/**
 * The navigation component.
 */
const Navi = (props) => {
  const { currentPage, pageCount, pageHandler, rawRecordCount, recordCount } = props;
  return (
    <div>
      {(rawRecordCount > 0) && (
        <div className='navi-block'>
          <div>Found {recordCount} results. Current page: {currentPage} / {pageCount}.</div>

          <button className='naviButton' disabled={(currentPage > 1)? false: true} 
            onClick={() => pageHandler('first')}>First page</button>

          <button className='naviButton' disabled={(currentPage > 1)? false: true} 
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

export default Navi;
