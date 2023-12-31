import {collection, deleteDoc, doc, setDoc} from 'firebase/firestore/lite'
import { FirebaseDB } from '../../firebase/config';
import { deleteNoteById,addNewEmptyNote, setActiveNote, savingNewNote, setNotes, setSaving, updateNote, setPhotosToActiveNote } from './journalSlice';
import { fileUpload, loadNotes } from '../../helpers';
export const startNewNote = ()=>{
    return async(dispatch, getState)=>{
     
        dispatch(savingNewNote());
        const {uid} = getState().auth;

        const newNote = {
            title:'',
            body:'',
            date:new Date().getTime(),
        }
        //DONDE va a meter la nueva colección del firebase
        const newDoc = doc(collection(FirebaseDB,`${uid}/journal/notes`))
        //INSERTA en newDoc el newNote
        await setDoc(newDoc,newNote);
        newNote.id = newDoc.id
        //ejecuta el addnewemptynote con la nueva nota
        //aqui ve que ha cambiado el estado y le dice que hacer con el newnote
        dispatch(addNewEmptyNote(newNote))
        //esta es la nota que estara activa para modificar o lo que sea
        dispatch(setActiveNote(newNote))
       
    }
}//en los thunks es donde se ejecutara con dispatch las funciones del slice
//defino que va a haber un reducer en store -> pasa por slice que es el que ve
//los estados y dice que estado va a cambiar y en thunks que datos son los que va
//a pasar al slice

export const startLoadingNotes=()=>{
    return async(dispatch,getState)=>{
        const {uid} = getState().auth;
        if(!uid) throw new Error('El UID del usuario no existe')
      await loadNotes(uid)
      const notes = await loadNotes(uid)
      dispatch(setNotes(notes))
    }
}
export const startSaveNote = () =>{
    return async(dispatch,getState)=>{
        dispatch(setSaving());
        const {uid} = getState().auth;
        const {active:note}= getState().journal;
        const noteToFireStore = {...note};
        delete noteToFireStore.id;
        const docRef = doc(FirebaseDB,`${uid}/journal/notes/${note.id}`)
        await setDoc(docRef,noteToFireStore,{merge:true})
        dispatch(updateNote(note));
    }
}

export const startUploadingFiles = (files = [])=>{
    return async(dispatch) =>{
        dispatch(setSaving());
    const fileUploadPromises = [];
    for(const file of files){
        //Empieza a almacenar las imagenes
        fileUploadPromises.push(fileUpload(file))

    }
    //cuando resuelva tendremos un array de todas las imagenes en orden
   const photosUrl =  await Promise.all(fileUploadPromises)
    dispatch(setPhotosToActiveNote(photosUrl));
    }

}
export const startDeletingNote = () =>{
    return async(dispatch,getState)=>{
        const {uid} = getState().auth;
        const {active:note} = getState().journal;
        const docRef = doc(FirebaseDB,`${uid}/journal/notes/${note.id}`)
        await deleteDoc(docRef);
        dispatch(deleteNoteById(note.id));
    }
}