import {python} from './python.mjs';import {runDemo,present,turn} from './public/core.js';
export async function runLocal(payload){return runDemo(payload.input,payload.previous,payload.action);}
export async function runAudio(payload){const transcript=await python('scripts/transcribe.py',payload);const result=present(turn(transcript.text),'LOCAL FASTER-WHISPER + INTAKE POLICY');result.sections.unshift({title:'Transcription',body:transcript.text});result.data.transcription=transcript;return result;}
