import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from "axios";
import Perks from '../Perks';

export default function PlacesPage() {
  const { action } = useParams();
  const[title,setTitle]=useState('');
  const[address,setAddress]=useState('');
  const[addedPhotos,setAddedPhotos]=useState([]); 
  const[photoLink,setPhotoLink]=useState('');
  const[description,setDescription]=useState('');
  const[perks,setPerks]=useState([]);
  const[extraInfo,setExtraInfo]=useState('');
  const[checkIn,setCheckIn]=useState('');
  const[checkOut,setCheckOut]=useState('');
  const[maxGuests,setMaxGuests]=useState(1);
  function inputHeader(text){
    return(
      <h2 className='text-2xl mt-4'>{text}</h2>
    );
  }
  function inputDescription(text){
    return(
      <p className='text-gray-500 text-sm'>{text}</p>
    );
  }
  function preInput(header,description)
  {
    return(
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }
   
  async function addPhotoByLink(ev) {
    ev.preventDefault();
    const {data:filename}=await axios.post('/upload-by-link', { link: photoLink });
    setAddedPhotos(prev =>{
      return [...prev,filename];
    });
    setPhotoLink('');
  }

  function uploadPhoto(ev)
  {
    const files =ev.target.files;
    const data =new FormData();
    for (let i=0;i<files.length;i++)
    {
      data.append('photos',files[i]);
    }
    axios.post('/upload',data,{
      headers:{'Content-Type':'multipart/form-data'}
    }).then(res =>{
      const{data:filename}=res;
      setAddedPhotos(prev=>{
        return [...prev,filename];
      });
    })
  }
  return (
    <div>
      {action !== 'new' && (
        <div className='text-center'>
          <Link className='inline-flex bg-primary gap-1 text-white py-2 px-6 rounded-lg' to={'/account/places/new'}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add new place
          </Link>
        </div>
      )}
      {action === 'new' && (
        <div>
          <form>
            {preInput('Title','title for your place')}
            <input type='text' value={title} onChange={ev=>setTitle(ev.target.value)} placeholder='title, for example: my lovely apt' />
            {preInput('Address','Address to this place')}
            <input type='text' value={address} onChange={ev=>setAddress(ev.target.value)}placeholder='address' />
            {preInput('photos','more photos')}
            <div className='flex'>
                <input type='text' value={photoLink} onChange={ev => setPhotoLink(ev.target.value)} placeholder='Add using a link ........ jpg' />
                <button onClick={addPhotoByLink} className='bg-gray-200 px-4 rounded-lg'>Add photo</button>
            </div>
             
            <div className='mt-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
            {addedPhotos.length > 0 && addedPhotos.map(link => (
              <div key={link}>  
                <img className='rounded-2xl border' src={`http://localhost:4000${link}`} alt='' />
              </div>
              ))}

              <label className='flex justify-center gap-1 border bg-transparent rounded-2xl p-8 text-2xl text-gray-600'>
               <input type='file' multiple className='hidden' onChange={uploadPhoto}/>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
              </svg>
                 Upload
              </label>
            </div>
            {preInput('Description','description of the place')}
            <textarea value={description} onChange={ev=>setDescription(ev.target.value)}/>
            {preInput('Perks','select all the perks of your place')}
            <div className='grid gap-2 mt-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6'>
              <Perks selected={perks} onChange={setPerks}/>
            </div>
            {preInput('Extra Info','house rules, etc')}
            <textarea value={extraInfo} onChange={ev=>setExtraInfo(ev.target.value)}/>
            {preInput('Check in & out times','add check in and out times, remember to have some time window for cleaning the room between guests')}
            <div className='grid sm:grid-cols-3 gap-2'>
              <div>
                <h3 className='mt-2 mb-1'>Check in time</h3>
                <input type='text' value={checkIn} onChange={ev=>setCheckIn(ev.target.value)} placeholder='14:00' />
              </div>
              <div>
                <h3 className='mt-2 mb-1'>Check out time</h3>
                <input type='text' value={checkOut} onChange={ev=>setCheckOut(ev.target.value)} placeholder='11"00' />
              </div>
              <div>
                <h2 className='mt-2 mb-1'>Max number of guests</h2>
                <input type='text' value={maxGuests} onChange={ev=>setMaxGuests(ev.target.value)}/>
              </div>
            </div>
              <button className='primary my-2'>save</button>
          </form>
        </div>
      )}
    </div>
  );
}
