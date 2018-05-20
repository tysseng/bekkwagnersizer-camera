import React from 'react';

export const StatusWindow = (statusTexts) => {
  return <div className='statusWindow'>
    {statusTexts.map(msg => <div>{msg}</div>)}
  </div>
};