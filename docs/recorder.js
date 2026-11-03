import {showError,el} from './shared.js';
const form=document.getElementById('form');
let context,stream,processor,source,chunks=[];
const record=el('button',{type:'button',className:'quiet'},'Record on this device');
const speak=el('button',{type:'button',className:'quiet'},'Speak the latest reply');
const stopSpeech=el('button',{type:'button',className:'quiet',onclick:()=>speechSynthesis.cancel()},'Interrupt speech');
form.append(record,speak,stopSpeech);
record.onclick=async()=>{try{
 if(stream){
  processor.disconnect();source.disconnect();stream.getTracks().forEach(track=>track.stop());stream=null;
  const count=chunks.reduce((sum,chunk)=>sum+chunk.length,0);const buffer=new ArrayBuffer(44+count*2);const view=new DataView(buffer);
  const text=(offset,value)=>{for(let i=0;i<value.length;i++)view.setUint8(offset+i,value.charCodeAt(i));};
  text(0,'RIFF');view.setUint32(4,36+count*2,true);text(8,'WAVE');text(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,context.sampleRate,true);view.setUint32(28,context.sampleRate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);text(36,'data');view.setUint32(40,count*2,true);
  let offset=44;for(const chunk of chunks)for(const sample of chunk){view.setInt16(offset,Math.max(-1,Math.min(1,sample))*32767,true);offset+=2;}
  await context.close();record.textContent='Record on this device';
  const file=new File([buffer],'local-recording.wav',{type:'audio/wav'});const transfer=new DataTransfer();transfer.items.add(file);document.getElementById('audio-file').files=transfer.files;document.getElementById('progress').textContent='Recording ready. Click Transcribe locally to process it on your machine.';
 }else{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('This browser does not provide microphone capture. Upload a recording instead.');
  stream=await navigator.mediaDevices.getUserMedia({audio:true});context=new AudioContext({sampleRate:16000});chunks=[];source=context.createMediaStreamSource(stream);processor=context.createScriptProcessor(4096,1,1);processor.onaudioprocess=event=>{chunks.push(new Float32Array(event.inputBuffer.getChannelData(0)));if(chunks.length*4096/context.sampleRate>=30)record.click();};source.connect(processor);processor.connect(context.destination);record.textContent='Stop recording (30s maximum)';
 }
}catch(error){if(stream)stream.getTracks().forEach(track=>track.stop());stream=null;record.textContent='Record on this device';showError(error);}};
speak.onclick=()=>{try{const voices=speechSynthesis.getVoices().filter(voice=>voice.localService);if(!voices.length)throw new Error('No local speech voice is available. Read the reply in the transcript.');const data=document.getElementById('result').querySelector('details pre');const parsed=JSON.parse(data.textContent);const reply=parsed.history?.filter(item=>item.speaker==='receptionist').at(-1)?.text;if(!reply)throw new Error('Run a conversation turn first.');speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(reply);utterance.voice=voices.find(voice=>voice.lang.startsWith('en'))||voices[0];speechSynthesis.speak(utterance);}catch(error){showError(error);}};
