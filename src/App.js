import React, { useReducer } from 'react';
import './App.css';
import uniqid from 'uniqid';
import luxon, { DateTime } from 'luxon';
import {Howl, Howler} from 'howler';

const LOCAL_STORAGE_KEY = 'asdasdierghierigh';

function App() {
  const isMounted = React.useRef(false);
  const refPlus = React.useRef();
  const [notes, setNotes] = React.useState([]);
  const [displayForm, setDisplayForm] = React.useState(false);

  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [second, setSecond] = React.useState(DateTime.now().second);
  const [minute, setMinute] = React.useState(0);
  const [hour, setHour] = React.useState(0);
  const [date, setDate] = React.useState(DateTime.now().toFormat('yyyy-MM-dd'));
  const [type, setType] = React.useState('normal');

  React.useEffect(() => {
    const storedItem = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if(storedItem) {
      setNotes(storedItem);
      // storedItem.map(item => saveNotes.push(item));
    }
  }, []);
  React.useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  React.useEffect(() => {
    setTimeout(() => {
      setSecond(DateTime.now().second);
    }, 1000);
  });

  React.useEffect(() => {
    const newNotes = [...notes];
    if(isMounted.current) {
      newNotes.map(note => {
        const startDate = DateTime.fromISO(DateTime.now().toFormat('yyyy-MM-dd'));
        const endDate = DateTime.fromISO(note.date);
        const startHour = DateTime.now().hour;
        const startMinute = DateTime.now().minute;
        const startSecond = DateTime.now().second;

        const noteTimeout = (Timeout(startDate, endDate, startHour, startMinute, startSecond, note.hour, note.minute));
        note.noteTimeout = noteTimeout
      });
      setNotes(newNotes);
    }
    else {
      isMounted.current = true;
    }
  }, [second]);

  const handleDisplayForm = () => {
    setDisplayForm(!displayForm);
    refPlus.current.classList.toggle('display-form--none');
    handleReset();
  };

  const handleRemoveNote = note => {
    const newNotes = [...notes];
    newNotes.splice(newNotes.findIndex(task => task.id === note.id), 1);
    setNotes(newNotes);
  }

  const handleReset = () => {
    setTitle('');
    setBody('');
    setMinute(0);
    setHour(0);
    setDate(DateTime.now().toFormat('yyyy-MM-dd'));
    setType('normal');
  }

  const Timeout = (startDate, endDate, startHour, startMinute, startSecond, hour, minute) => {
    const diffDate = endDate.diff(startDate, 'seconds');
    let timeout = diffDate.toObject();
    timeout = timeout.seconds;

    const diffTime = (hour*60*60 + minute*60) - (startHour*60*60 + startMinute*60 + startSecond);
    timeout += diffTime;
    return timeout;
  }

  const handleAddNote = e => {
    e.preventDefault();

    const startDate = DateTime.fromISO(DateTime.now().toFormat('yyyy-MM-dd'));
    const endDate = DateTime.fromISO(date);
    const startHour = DateTime.now().hour;
    const startMinute = DateTime.now().minute;
    const startSecond = DateTime.now().second;

    const noteTimeout = (Timeout(startDate, endDate, startHour, startMinute, startSecond, hour, minute));

    // const newDate = DateTime.fromISO(date).toFormat('dd-MM-yyyy');

    // saveNotes.push({title: title, body: body, date: newDate, type: type, hour:hour, minute:minute, noteTimeout: noteTimeout});
    setNotes([...notes, {title: title, body: body || '...', date: date, type: type, hour:hour, minute:minute, noteTimeout: noteTimeout, completed: false, id: uniqid()}]);

    handleDisplayForm();
    handleReset();
  }

  return (
    <div className='App'>
      {displayForm && <Form
        onDisplayForm={handleDisplayForm}
        handleTitleChange={(e) => {setTitle(e.target.value)}}
        handleBodyChange={(e) => {setBody(e.target.value)}}
        handleHourChange={(e) => {setHour(e.target.value)}}
        handleMinuteChange={(e) => {setMinute(e.target.value)}}
        handleDateChange={(e) => {setDate(e.target.value)}}
        handleTypeChange={(e) => {setType(e.target.value)}}
        onAddNote={handleAddNote}
        />}
      <Note notes={notes} onRemoveNote={handleRemoveNote}/>
      <div ref={refPlus} className='display-form' onClick={handleDisplayForm}></div>
      <Tool />
    </div>
  );
}

function Form ({
  onDisplayForm,
  handleTitleChange,
  handleBodyChange,
  handleHourChange,
  handleMinuteChange,
  handleDateChange,
  handleTypeChange,
  onAddNote,
}) {
  return (
    <div className='popup'>
      <form className='form' onSubmit={onAddNote}>
        <div className='form__icon--cross' onClick={onDisplayForm}></div>
        <div className='title'>
          <label className='title__label'>Title</label>
          <input type='text' className='title__input'
            onChange={handleTitleChange} required
            ></input>
        </div>
        <div className='body'>
          <label className='body__label'>Description</label>
          <textarea className='body__textarea' cols='33' rows='5'
            onChange={handleBodyChange}
            ></textarea>
        </div>
        <div className='time'>
          <div className='hour'>
            <label>Hour</label>
            <input type='number' min='0' max='24' onChange={handleHourChange} defaultValue='0'></input>
          </div>
          <div className='minute'>
            <label>Minute</label>
            <input type='number' min='0' max='60' onChange={handleMinuteChange} defaultValue='0'></input>
          </div>
        </div>
        <div className='date'>
          <label className='date__label'>Date</label>
          <input type='date' className='date__input'
            onChange={handleDateChange} min="2021-01-01"
            defaultValue={DateTime.now().toFormat('yyyy-MM-dd')}
            ></input>
        </div>
        <div className='type'>
          <label className='type__label'>Type</label>
          <select className='type__select'
            onChange={handleTypeChange}
            >
            <option className='type__select--option' value='normal'>Normal</option>
            <option className='type__select--option' value='Special'>Special</option>
            <option className='type__select--option' value='INSANE'>Insane</option>
          </select>
        </div>
        <button className='form__button'>ADD</button>
      </form>
    </div>
  );
}

function Note({notes, onRemoveNote}) {
  const newNotes = [...notes];
  newNotes.sort((a, b) => a.noteTimeout - b.noteTimeout);

  return (
    <div>
      {newNotes.map(note => {
        let [s, m, h, d] = [
          note.noteTimeout%60,
          Math.floor(note.noteTimeout/60)%60,
          Math.floor(note.noteTimeout/60/60)%24,
          Math.floor(note.noteTimeout/60/60/24)%365
        ];
        
        if(note.noteTimeout <= 0) {
          const newNote = note;
          newNote.completed = true;
          newNote.type = 'DONE';
        }

        const newDate = DateTime.fromISO(note.date).toFormat('dd-MM-yyyy');

        return (
          <div key={uniqid()} className='note'>
            <h3>{note.title}<i className='note__cross' onClick={() => {onRemoveNote(note)}}></i></h3>
            <p className='note__body'>{note.body}</p>
            <div className={`note__type note__type--${note.type}`}>{note.type}</div>
            <div className='note__time'>Time:{' '}
              {note.hour < 10 ? `0${note.hour}` : `${note.hour}`}
              :
              {note.minute < 10 ? `0${note.minute}` : `${note.minute}`} {' / '} {newDate}</div>
            <div>
              <span className='note__span--h'>{note.noteTimeout > 0 ? ((h < 10) ? `0${h}h` : `${h}h`) : '00'}</span>
              :
              <span className='note__span--m'>{note.noteTimeout > 0 ? ((m < 10) ? `0${m}m` : `${m}m`) : '00'}</span>
              :
              <span className='note__span--s'>{note.noteTimeout > 0 ? ((s < 10) ? `0${s}s` : `${s}s`) : '00'}</span>
              <div><span className='note__span--d'>{note.noteTimeout > 0 ? `${d}` : '0'} days left</span></div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Tool() {
  return (
    <div>
      
    </div>
  )
}

export default App;
